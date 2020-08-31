import { Request, Response } from 'express'
import * as claims from '../../models/userClaims'
import * as group from '../../models/group'
import * as metadata from '../../models/metadata'
import * as user from '../../models/user'
import * as section from '../../models/section'
import * as subject from '../../models/subject'
import * as entity from '../../models/entity'
import * as analytics from '../../models/analytics'
import * as tier from '../../models/tier'
import * as payment from '../../models/payment'
import { Role, UsageDataType } from '../../models/common/schema'
import { roles } from '../../models/common'
import { serverError, badRequest, forbidden, unauthorized, limitExceeded, tierExpired } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { paymentUsage } from '../helper/payment'

export async function create(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { groupId, groupName } = req.body
        if (!groupId || !groupName)
            return badRequest(res, 'Group ID and Group Name is required.')
        const groupDataExists = await group.checkIfgroupExists(groupId)
        if (groupDataExists)
            return badRequest(res, 'Group already Exists')
        const userData = await user.get(uid)
        const { tierId, email, phone } = userData
        if (!tierId)
            return badRequest(res, 'Select Tier first')
        const tierData = await tier.get(userData.tierId)
        const { subscriptionStatus, subscriptionItems } = userData
        if (tierData.group.allowed >= 0 && userData.sudo.length >= tierData.group.allowed){
            return limitExceeded(res)
        } else if (subscriptionStatus !== 'active' && subscriptionStatus !== 'past_due') {
            return tierExpired(res, subscriptionStatus)
        }
        const groupData = {
            groupId,
            groupName,
            sudo: uid,
            admin: [uid],
            tierId: tierData.tierId,
            subscriptionStatus,
            subscriptionItems
        }
        const role: Role = 'admin'
        const sudo = true;
        const newClaims = { groupId, role, sudo }
        const newUserData = await user.addtoGroup(userData, groupId, 'admin', sudo)
        await claims.set(uid, newClaims)
        await group.set(groupData)
        await metadata.set({
            id: groupId,
            name: groupName,
            type: 'group',
            email,
            phone,
            subscriptionStatus: subscriptionStatus
        })
        await paymentUsage({
            data: userData,
            type: 'group',
            action: 'create',
            idempotencyKey: groupId + Date.now().toString(),
            quantity: newUserData.sudo.length
        })

        return successResponse(res, { groupId, role: 'admin' })
    } catch(err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { groupId } = req.params
        if (!groupId) return badRequest(res, 'Group ID required')
        const groupData = await group.get(groupId)
        const groupUsage = group.getUsage(groupData)
        if (!uid || groupData.sudo !== uid) return unauthorized(res)
        const {
            sectionId,
            subjectId,
            admin,
            provider,
            learner,
            tierId,
            subscriptionItems
        } = groupData
        const userIds = [ ...admin, ...provider, ...learner ]
        await Promise.all(subjectId.map(async subId => {
            try {
                const subjectData = await subject.get(subId)
                const allUsers = [ ...subjectData.admin, ...subjectData.provider, ...subjectData.learner ]
                const entities = await entity.removeAll(subId)
                const entityIds = entities.map(e => e.entityId).reduce((acc: string[], curr) => acc.concat(curr), [])
                await analytics.removeEntityComplete(entityIds, allUsers)
                await subject.remove(subjectData)
            } catch (_) {}
        }))
        await Promise.all(sectionId.map(async secId => {
            try {
                await section.removePartial(secId)
            } catch (_) {}
        }))
        await Promise.all(userIds.map(async id => {
            try {
                const userClaims = await claims.get(id)
                const customClaims = claims.checkIfExist(userClaims)
                claims.findGroup(customClaims, groupId)
                const userData = await user.get(id)
                await claims.remove(customClaims, groupId, id)
                await user.removeFromGroup(userData, groupId, sectionId, subjectId, true)
            } catch (err) {
                return
            }
        }))
        await group.remove(groupId)
        await metadata.remove(groupId)

        // Payment Reduction
        if (tierId !== 'free') {
            await Promise.all(Object.keys(groupUsage).map(async typeKey => {
                const type = typeKey as UsageDataType
                const subItemId = payment.findSubscriptionItemId(type, subscriptionItems)
                const quantity = groupUsage[type]
                if (quantity <= 0) return
                await payment.removeUsage(subItemId, quantity, groupId + subItemId)
            }))
        }
        return successResponse(res, 'Successfully removed')
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function removeUser(req: Request, res: Response) {
    try {
        const { groupId, id } = req.params
        if (!id || !groupId)
            return badRequest(res, 'Group ID and UID required')
        else {
            const userClaims = await claims.get(id)
            const customClaims = claims.checkIfExist(userClaims)
            const filterClaim = claims.findGroup(customClaims, groupId)
            if (filterClaim.sudo) return forbidden(res)
            const userData = await user.get(id)
            if (!userData.groupId.includes(groupId)) return forbidden(res)
            else {
                const groupData = await group.get(groupId)
                const { role } = filterClaim
                const sectionIds = await section.removeUserFromRoleAll(id, groupId, role)
                const subjects = await subject.removeUserFromRoleAll(id, groupId, role)
                const subjectIds = subjects.map(s => s.subjectId).reduce((a: string[], b) => a.concat(b), [])
                const entityId = subjects.map(s => s.entityId).reduce((acc, curr) => acc.concat(curr), [])
                await Promise.all(entityId.map(async e => {
                    await analytics.removeEntityFromUser(e, id)
                }))
                await claims.remove(customClaims, groupId, id)
                await user.removeFromGroup(userData, groupId, sectionIds, subjectIds)
                const response = await group.removeUser(groupData, id)

                await paymentUsage({
                    data: groupData,
                    type: 'user',
                    action: 'delete',
                    idempotencyKey: id + Date.now().toString(),
                    quantity: 1
                })

                return successResponse(res, response)
            }
        }
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function acceptRequest(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { uid, role } = req.body
        if (!uid || !role) return badRequest(res, 'User ID and Role required')
        else if (!roles.includes(role)) return badRequest(res, 'Invalid Role')
        else {
            const { groupId } = groupData
            const userData = await user.get(uid)

            let subjectIds: string[] = []
            try {
                const subjects = await subject.getAllFromGroup(groupId)
                if (subjects.length > 0) {
                    subjectIds = subjects.map(sub => sub.subjectId).reduce((acc: string[], curr) => acc.concat(curr), [])
                    await Promise.all(subjects.map(async subData => {
                        try {
                            if (role === 'provider')
                                return await subject.addUser(uid, subData)
                            else if (role === 'learner')
                                return await subject.addUser(uid, subData, 'learner')
                            else
                                return
                        } catch (_) {
                            subjectIds = []
                            return
                        }
                    }))
                }
            } catch (_) { subjectIds = [] }

            await group.acceptRequest(groupData, uid, role)
            userData.subjectId.push(...subjectIds)
            await user.acceptRequest(userData, groupId, role)
            await claims.set(uid, { groupId, role })
            
            await paymentUsage({
                data: groupData,
                type: 'user',
                action: 'update',
                idempotencyKey: uid + Date.now().toString(),
                quantity: 1
            })

            return successUpdated(res)
        }
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function cancelRequest(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { userId } = req.params
        const { groupId } = groupData
        const userData = await user.get(userId)
        await group.removeRequest(groupData, userId)
        await user.removeRequest(userData, groupId)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function updateGroupName(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { name } = req.body
        const { groupId } = groupData
        if (!name)
            return badRequest(res, 'Name required')
        await group.update({ groupId, groupName: name })
        await metadata.update({ id: groupId, name })
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}
