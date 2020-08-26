import { Request, Response } from 'express'
import * as user from '../../models/user'
import * as group from '../../models/group'
import * as tier from '../../models/tier'
import * as subject from '../../models/subject'
import * as entity from '../../models/entity'
import * as analytics from '../../models/analytics'
import * as storage from '../../storage/storage'
import { serverError, badRequest, unauthorized, forbidden, limitExceeded, tierExpired } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated, successCreated } from '../../responseHandler/successHandler'
import { allEqual } from '../../utils/allEqual'
import { bytesToGB } from '../../utils/bytesToGB'
import { paymentUsage } from '../helper/payment'
import { GroupInterface } from '../../models/group/schema'
import { sendMail } from '../../mail'
import { contentEmail } from '../helper/mail'

export async function create(req: Request, res: Response) {
    const { subjectId, title, author, contentName, contentType, contentSize, description } = req.body
    const { groupData } = res.locals;
    const { groupId, currentStorage } = groupData
    try {
        if (!subjectId || !title || !author) {
            if (contentName && contentType)
                await removeFile(contentName, contentType, groupId)
            return badRequest(res, 'Subject ID, Subject Name, Title and Author is required')
        }
        if (typeof(contentSize) !== 'number')
            return badRequest(res, 'Content Size should be numeric')
        const { tierId, subscriptionStatus } = groupData
        if (subscriptionStatus !== 'active' && subscriptionStatus !== 'past_due') {
            await removeFile(contentName, contentType, groupId)
            return tierExpired(res, subscriptionStatus)
        }
        const tierData = await tier.get(tierId)
        let newSize = 0
        let contentLength = 0
        if (description) {
            contentLength = description.length
            if (contentSize) {
                newSize = contentSize
            }
            newSize += description.length
        }
        if (newSize > 0) {
            const { storage: storeLimit } = tierData
            const { allowed } = storeLimit
            if (allowed > 0) {
                const contentSizeInGB = bytesToGB(newSize)
                const currentStorageInGB = bytesToGB(currentStorage)
                const sizeToBe = contentSizeInGB + currentStorageInGB
                if (sizeToBe > allowed) {
                    await removeFile(contentName, contentType, groupId)
                    return limitExceeded(res)
                }
            }
        }
        const subjectData = await subject.get(subjectId)
        const { subjectName, sectionIds, admin, provider, learner } = subjectData
        const lastEntityData = await entity.getByMaxOrder(subjectId)
        const entityData = {
            ...req.body,
            groupId,
            sectionIds,
            subjectId,
            subjectName,
            title,
            description,
            contentLength,
            order: lastEntityData ? lastEntityData.order + 1 : 0
        }
        const entityId = await entity.add(entityData)
        await subject.addEntity(entityId, subjectData)
        await analytics.setEntity({
            groupId,
            subjectId,
            sectionIds,
            entityId,
            admin: {
                usersNotDownloaded: contentType === 'document' ? admin : [],
                usersNotWatched: contentType === 'video' ? admin : [],
                usersNotViewed: admin
            },
            provider: {
                usersNotDownloaded: contentType === 'document' ? provider : [],
                usersNotWatched: contentType === 'video' ? provider : [],
                usersNotViewed: provider
            },
            learner: {
                usersNotDownloaded: contentType === 'document' ? learner : [],
                usersNotWatched: contentType === 'video' ? learner : [],
                usersNotViewed: learner
            }
        })

        if (newSize > 0) {
            const newGroupData = await group.updateStorage(groupData, newSize, 'add')
            await paymentUsage({
                data: newGroupData,
                type: 'storage',
                action: 'update',
                idempotencyKey: entityId,
                quantity: newSize
            })
        }
        return successResponse(res, entityId)
    } catch (err) {
        if (contentName && contentType)
            await removeFile(contentName, contentType, groupId)
        console.log(err)
        return serverError(res, err)
    }
}

export async function updateTitleDesc(req: Request, res: Response) {
    try {
        const { role, groupId, uid, groupData } = res.locals
        const { id } = req.params
        const { title, description } = req.body
        let desc = ''
        let diff = 0
        if (!id || !title) return badRequest(res, 'Title required')
        const entityData = await entity.get(id)
        let { contentSize } = entityData
        const oldDescriptionSize = entityData.description.length
        if (description) {
            desc = description
            diff = desc.length - oldDescriptionSize
            contentSize += diff
        }
        if (entityData.groupId !== groupId) return forbidden(res)
        if (role === 'provider') {
            const { subjectId } = entityData
            const subjectData = await subject.get(subjectId)
            const { provider } = subjectData  
            if (!provider.includes(uid)) return unauthorized(res)          
        }
        await entity.update({
            ...entityData,
            title,
            description,
            contentSize
        })
        if (diff !== 0) {
            const newGroupData = await group.updateStorage(groupData, diff, 'add')
            await paymentUsage({
                data: newGroupData,
                type: 'storage',
                action: 'update',
                idempotencyKey: id + Date.now().toString(),
                quantity: diff
            })
        }
        return successUpdated(res)
    } catch(err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { role, uid, groupData } = res.locals
        const { id } = req.params
        const entityData = await entity.get(id)
        const { subjectId } = entityData
        const subjectData = await subject.get(subjectId)
        const { admin, provider, learner } = subjectData
        if (role === 'admin' || provider.includes(uid)) {
            const data = await entity.remove(entityData)
            const allUsers = [ ...admin, ...provider, ...learner ]
            await subject.removeEntity([id], subjectData)
            await analytics.removeEntity(id)
            await Promise.all(allUsers.map(async usrId => {
                await analytics.removeEntityFromUser(id, usrId)
            }))
            if (entityData.contentSize > 0) {
                const { contentSize } = entityData
                await group.updateStorage(groupData, contentSize, 'subtract')
                await paymentUsage({
                    data: groupData,
                    type: 'storage',
                    action: 'delete',
                    idempotencyKey: id,
                    quantity: contentSize
                })
            }                
            return successResponse(res, data)
        } else return unauthorized(res)
    } catch(err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function updateEntities(req: Request, res: Response) {
    try {
        const { role, groupId, uid } = res.locals
        let { entities } = req.body
        if (!entities) return badRequest(res, 'Entities required')
        if (!(entities instanceof Array)) return badRequest(res, 'Invalid data')
        if (entities.length === 0) return badRequest(res, 'Invalid data')
        let checkAuth: any[]
        checkAuth = entities.map(ent => ent.groupId === groupId)
        if (checkAuth.includes(false)) return forbidden(res)
        if (role === 'provider') {
            checkAuth = entities.map(ent => ent.subjectId)
            if (!allEqual(checkAuth)) badRequest(res, 'Invalid Data')
            const subjectData = await subject.get(checkAuth[0])
            if (!subjectData.provider.includes(uid)) return unauthorized(res)
        }
        entities = entities.map(ent => {
            ent.entityId = ent.id
            return ent
        })
        await entity.updateEntities(entities)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function sendContentMessage(req: Request, res: Response) {
    try {
        const { groupData } = res.locals
        const { id: entityId } = req.params
        const { uid } = req.body
        if (!uid || !entityId) {
            return badRequest(res, 'UID and Entity ID required')
        }
        const { groupRequests, admin, provider, learner, groupName } = groupData as GroupInterface
        if (groupRequests && groupRequests.includes(uid)) {
            return badRequest(res, 'User has not yet accepted the invite')
        }
        const allUsers = [ ...admin, ...provider, ...learner ]
        if (!allUsers.includes(uid)) {
            return badRequest(res, 'User not part of the group')
        }
        const entityData = await entity.get(entityId)
        const userData = await user.get(uid)
        const { email } = userData
        const { title, subjectName, thumbnailImageUrl, contentType } = entityData
        let action = ''
        if (!contentType || contentType === 'image') {
            action = 'view'
        } else if (contentType === 'document') {
            action = 'download'
        } else if (contentType === 'video') {
            action = 'watch'
        }
        if (email){
            await sendMail(contentEmail(email, false, groupName, title, subjectName, thumbnailImageUrl, action))
        }
        return successCreated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

async function removeFile(contentName: string, contentType: string, groupId: string): Promise<boolean> {
    try {
        await storage.removeFile(contentName, contentType, groupId)
        if (contentType === 'image' || contentType === 'video') {
            await storage.removeFile(`thumb_${contentName}.png`, 'image', groupId)
        }
        return true
    } catch (_) {
        return false
    }
}
