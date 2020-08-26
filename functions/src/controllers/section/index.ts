import { Request, Response } from 'express'
import * as user from '../../models/user'
import * as group from '../../models/group'
import * as section from '../../models/section'
import * as subject from '../../models/subject'
import * as entity from '../../models/entity'
import * as analytics from '../../models/analytics'
import * as tier from '../../models/tier'
import { serverError, badRequest, limitExceeded, tierExpired } from '../../responseHandler/errorHandler'
import { successResponse, successCreated } from '../../responseHandler/successHandler'
import { getRole } from '../../utils/getRole'
import { SectionInterface } from '../../models/section/schema'
import { paymentUsage } from '../helper/payment'
import { UsageDataType } from '../../models/common/schema'
import { SubjectInterface } from '../../models/subject/schema'

export async function create(req: Request, res: Response) {
    try {
        const { groupData, uid }= res.locals
        const { sectionName, sectionId } = req.body
        if (!sectionName)
            return badRequest(res, 'Section name required')
        const { groupId, tierId, subscriptionStatus } = groupData
        const tierData = await tier.get(tierId)
        const groupUsage = group.getUsage(groupData)
        if (tierData.section.allowed >= 0 && groupUsage.section >= tierData.section.allowed) {
            return limitExceeded(res)
        } else if (subscriptionStatus !== 'active' && subscriptionStatus !== 'past_due') {
            return tierExpired(res, subscriptionStatus)
        }
        const sectionData = {
            groupId,
            sectionName,
            admin: [uid]
        }
        let newSectionId
        if (sectionId)
            newSectionId = await section.addChild(sectionData, sectionId)
        else
            newSectionId = await section.add(sectionData)
        const newGroupData = await group.addSection(groupId, newSectionId)
        const userData = await user.get(uid)
        await user.addtoSections(userData, [newSectionId])

        await paymentUsage({
            data: newGroupData,
            type: 'section',
            action: 'update',
            idempotencyKey: newSectionId,
            quantity: 1
        })

        return successCreated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { groupData }= res.locals
        const { sectionId } = req.params
        if (!sectionId) return badRequest(res, 'Section ID required')
        const sectionData = await section.get(sectionId)
        const allSections = await section.remove(sectionData)

        let allSubjectIds: string[] = []
        let storageReduction = 0
        const allDeletedSubjects = await Promise.all(allSections.map(async sec => {
            if (sec.subjectId.length > 0) {
                const deletedSubjects = await subject.removeAll(sec.sectionId)
                const deletedSubjectIds = deletedSubjects.map(s => s.subjectId).reduce((prev: string[], curr) => prev.concat(curr), [])
                deletedSubjects.forEach(async sub => {
                    const { subjectId, admin, provider, learner } = sub
                    const allUsers = [ ...admin, ...provider, ...learner ]
                    const entities = await entity.removeAll(subjectId)
                    if (entities.length > 0) {
                        storageReduction += entities.reduce((prev, curr) => prev + curr.contentSize || 0, 0)
                        const entityIds = entities.map(e => e.entityId).reduce((acc: string[], curr) => acc.concat(curr), [])
                        await analytics.removeEntityComplete(entityIds, allUsers)
                    }
                })
                return deletedSubjectIds
            } else return []
        }))
        
        groupData.currentStorage -= storageReduction
        const allSectionIds = [...allSections.map(sec => sec.sectionId)]
        allSubjectIds = allSubjectIds.concat(...allDeletedSubjects)
        await user.removeAllFromSections(allSectionIds, allSubjectIds)
        const newGroupData = await group.removeSection(groupData, allSectionIds, allSubjectIds)

        const action = 'delete'
        const updatePayment: UsageDataType[] = ['section', 'subject', 'storage']
        await Promise.all(updatePayment.map(async type => {
            let quantity = 0
            let idempotencyKey
            if (type === 'section') {
                idempotencyKey = sectionId
                quantity = allSectionIds.length
            } else if (type === 'subject') {
                idempotencyKey = `${sectionId}_subject`
                quantity = allSubjectIds.length
            } else if (type === 'storage') {
                idempotencyKey = `${sectionId}_storage`
                quantity = storageReduction
            } else return
            if (quantity > 0) {
                await paymentUsage({
                    data: newGroupData,
                    type,
                    action,
                    idempotencyKey,
                    quantity
                })
            }
        }))

        return successResponse(res, `${sectionData.sectionName} has been removed`)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function updateName(req: Request, res: Response) {
    try {
        const { name, sectionId } = req.body
        const sectionData = await section.updateName(name, sectionId)
        return successResponse(res, sectionData)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function addUser(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { uid, sectionId } = req.body
        if (!sectionId || !uid) return badRequest(res, 'Section ID and User ID are required')
        checkIfSectionPartOfGroup(groupData, sectionId)
        const role = getRole(groupData, uid)
        const userData = await user.get(uid)
        if (userData.sectionId.includes(sectionId)) badRequest(res, 'User already in section')
        const sectionData = await section.get(sectionId)
        let sections: SectionInterface[] = await section.addUser(uid, sectionData, role)
        const { parentId } = sectionData

        if (parentId)
            sections = sections.concat(...await section.addUser(uid, sectionData, role, 'up'))
        const sectionIds: string[] = sections.map(s => s.sectionId)
        await user.addtoSections(userData, sectionIds)
        if (role !== 'admin') {
            const subjectIds: string[] = sections.map(s => s.subjectId).reduce((a, b) => a.concat(b), [])
            let parentSubjects: SubjectInterface[] = []
            try {
                parentSubjects = await subject.getAllFromGroup(groupData.groupId)
            } catch (_) {}
            const parentSubjectIds = parentSubjects.map(s => s.subjectId)
            subjectIds.push(...parentSubjectIds)
            await Promise.all(subjectIds.map(async subId => {
                const subData = await subject.get(subId)
                if (role === 'provider')
                    return await subject.addUser(uid, subData)
                else
                    return await subject.addUser(uid, subData, 'learner')
            }))
            await user.addtoSubjects(userData, subjectIds)
        }
        return successResponse(res, 'User has been added')
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function removeUser(req: Request, res: Response) {
    try {
        const { sectionId, id } = req.params
        if (!sectionId || !id)
            return badRequest(res, 'Section ID and User ID are required')
        const userData = await user.get(id)
        if (!userData.sectionId.includes(sectionId))
            return badRequest(res, 'User not in section')
        const sectionData = await section.get(sectionId)
        const sectionIds = await section.removeUser(id, sectionData)
        let subjectIds: string[] = []
        const sectionSubjectIds = await Promise.all(sectionIds.map(async sectId => {
            try {
                const subjects = await subject.removeUserFromSection(sectId, id)
                const subIds = subjects.map(s => s.subjectId).reduce((acc: string[], curr) => acc.concat(curr), [])
                const entityId = subjects.map(s => s.entityId).reduce((acc, curr) => acc.concat(curr), [])
                await Promise.all(entityId.map(async e => {
                    await analytics.removeEntityFromUser(e, id)
                }))
                return subIds
            } catch (_) { return [] }
        }).filter(e => e))
        subjectIds = subjectIds.concat(...sectionSubjectIds)
        await user.removeFromSections(sectionIds, subjectIds, userData)
        return successResponse(res, 'User has been removed')
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

function checkIfSectionPartOfGroup(groupData: any, sectionId: string) {
    if (!groupData.sectionId.includes(sectionId)) throw new Error ('Section not part of the group')
    return groupData
}
