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
        const { groupData, uid } = res.locals
        const { subjectName, sectionId } = req.body
        if (!subjectName)
            return badRequest(res, 'Subject name required')

        const { groupId, tierId, subscriptionStatus } = groupData
        const tierData = await tier.get(tierId)
        const groupUsage = group.getUsage(groupData)
        if (tierData.subject.allowed >= 0 && groupUsage.subject >= tierData.subject.allowed){
            return limitExceeded(res)
        } else if (subscriptionStatus !== 'active' && subscriptionStatus !== 'past_due') {
            return tierExpired(res, subscriptionStatus)
        }

        // Add Learners
        let learner: string[] = []
        const sectionIds: string[] = []
        let sectionData
        if (sectionId) {
            sectionIds.push(sectionId)
            sectionData = await section.get(sectionId)
            learner = sectionData.learner
            if (sectionData.parentIds) {
                sectionIds.push(...sectionData.parentIds)
            }
        }
        const subjectData = {
            groupId,
            admin: [uid],
            subjectName,
            sectionId: sectionId ? sectionId : '',
            sectionIds,
            learner
        }
        const subjectId = await subject.add(subjectData)
        if (sectionId && sectionData) await section.addSubject(subjectId, sectionData)
        const newGroupData = await group.addSubject(groupId, subjectId)
        const userData = await user.get(uid)
        await user.addtoSubjects(userData, [subjectId])
        if (learner) {
            await Promise.all(learner.map(async l => {
                const learnerData = await user.get(l)
                await user.addtoSubjects(learnerData, [subjectId])
            }))
        }
        await paymentUsage({
            data: newGroupData,
            type: 'subject',
            action: 'update',
            idempotencyKey: subjectId,
            quantity: 1
        })
        return successCreated(res)

    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function get(req: Request, res: Response) {
    try {
        const { subjectId } = req.params
        const subjectData = await subject.get(subjectId)
        return successResponse(res, subjectData)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function updateName(req: Request, res: Response) {
    try {
        const { name, subjectId } = req.body
        const subjectData = await subject.updateName(name, subjectId)
        if (subjectData.entityId.length > 0) {
            await Promise.all(subjectData.entityId.map(async id => {
                const entityData = await entity.get(id)
                entityData.subjectName = name
                await entity.update(entityData)
            }))
        }
        return successResponse(res, subjectData)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function addUser(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { uid, subjectId } = req.body
        const { groupId } = groupData
        if (!subjectId || !uid) return badRequest(res, 'Subject ID and User ID are required')
        subjectPartOf(subjectId, groupData.subjectId)
        const role = getRole(groupData, uid)
        const userData = await user.get(uid)
        const subjectData = await subject.get(subjectId)
        const { entityId } = subjectData
        const sectionData = await getSection(subjectData.sectionId)
        await subject.addUser(uid, subjectData, role)
        let sections: SectionInterface[] = []
        if (sectionData && !sectionData[role].includes(uid)) {
            sections = sections.concat(...await section.addUser(uid, sectionData, role, 'up'))
        }
        if (role !== 'admin') {
            const subjectIds: string[] = sections.map(s => s.subjectId).reduce((a, b) => a.concat(b), [])
            let parentSubjects: SubjectInterface[] = []
            try {
                parentSubjects = await subject.getAllFromGroup(groupId)
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
        await user.addtoSubjects(userData, [subjectId])

        await Promise.all(entityId.map(async id => {
            try {
                const entityData = await entity.get(id)
                const { contentType } = entityData
                const entityAnalytics = await analytics.getEntity(id)
                entityAnalytics[role].usersNotViewed.push(uid)
                if (contentType === 'document') {
                    entityAnalytics[role].usersNotDownloaded.push(uid)
                } else if (contentType === 'video') {
                    entityAnalytics[role].usersNotWatched.push(uid)
                }
                await analytics.setEntity(entityAnalytics)
            } catch (_) {}
        }))

        const sectionIds: string[] = sections.map(s => s.sectionId)
        if (sectionIds.length > 0) await user.addtoSections(userData, sectionIds)
        return successResponse(res, 'User has been added')
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function removeUser(req: Request, res: Response) {
    try {
        const { subjectId, id } = req.params
        if (!subjectId || !id)
            return badRequest(res, 'Subject ID and User ID are required')
        const subjectData = await subject.get(subjectId)
        const { entityId } = subjectData
        await subject.removeUser(id, subjectData)
        const userData = await user.get(id)
        await user.removeFromSubjects([subjectId], userData)
        await Promise.all(entityId.map(async e => {
            await analytics.removeEntityFromUser(e, id)
        }))
        return successResponse(res, `User has been removed from ${subjectData.subjectName}`)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { subjectId } = req.params
        if (!subjectId) return badRequest(res, 'Subject ID required')
        const subjectData = await subject.get(subjectId)
        const entities = await entity.removeAll(subjectId)
        const { admin, provider, learner } = subjectData
        const allUsers = [ ...admin, ...provider, ...learner ]
        let storageReduction = 0
        await subject.remove(subjectData)
        if (subjectData.sectionId) {
            const sectionData =  await section.get(subjectData.sectionId)
            await section.removeSubject([subjectId], sectionData)
        }
        if (entities.length > 0) {
            storageReduction += entities.reduce(
                (prev, nxtEnt) => prev + nxtEnt.contentSize || 0, 0
            )
            const entityIds = entities.map(e => e.entityId).reduce((acc: string[], curr) => acc.concat(curr), [])
            await analytics.removeEntityComplete(entityIds, allUsers)
        }
        groupData.currentStorage -= storageReduction
        const newGroupData = await group.removeSubject(groupData, [subjectId])
        await user.removeAllFromSubjects([subjectId])
        
        const action = 'delete'
        const updatePayment: UsageDataType[] = ['subject', 'storage']
        await Promise.all(updatePayment.map(async type => {
            let quantity = 0
            let idempotencyKey
            if (type === 'subject') {
                quantity = 1
                idempotencyKey = subjectId
            } else if (type === 'storage') {
                quantity = storageReduction
                idempotencyKey = `${subjectId}_storage`
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
        return successResponse(res, `${subjectData.subjectName} has been removed`)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

function subjectPartOf(subjectId: string, groupDataSubjectId: string[]) {
    if (!groupDataSubjectId.includes(subjectId)) throw new Error ('Subject not part of the group')
}

async function getSection(sectionId: string) {
    try {
        return await section.get(sectionId)
    } catch (err) {
        return null
    }
}
