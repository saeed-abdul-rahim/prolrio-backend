import { Request, Response } from 'express'
import * as admin from 'firebase-admin'
import * as user from '../../models/user'
import * as group from '../../models/group'
import * as section from '../../models/section'
import * as subject from '../../models/subject'
import * as analytics from '../../models/analytics'
import * as claims from '../../models/userClaims'
import * as tier from '../../models/tier'
import { createStripeUser } from '../../models/payment'
import { newUserEmail } from '../helper/mail'
import { serverError, badRequest, forbidden, tierExpired, limitExceeded } from '../../responseHandler/errorHandler'
import { successCreated, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { sendMail } from '../../mail'
import { roles } from '../../models/common'
import { Role } from '../../models/common/schema'
import { filterIn } from '../../utils/filter'
import { paymentUsage } from '../helper/payment'
import { UserInterface } from '../../models/user/schema'

export async function update(req: Request, res: Response) {
   try {
       const { uid } = res.locals
       const { displayName, password } = req.body

       if (!displayName || !password) {
           return badRequest(res, 'Missing fields')
       }

       await admin.auth().updateUser(uid, { displayName, password })
       const userData = await admin.auth().getUser(uid)

       return successResponse(res, userData)
   } catch (err) {
        console.log(err)
       return serverError(res, err)
   }
}

export async function signUp(req: Request, res: Response) {
    try {
        const { displayName, email, password, phone } = req.body
        if (!displayName)
            return badRequest(res, 'Name required')
        else if (!phone && !email && !password)
            return badRequest(res, 'Phone / Email required')
        else if (email && !password)
            return badRequest(res, 'Password required')
        else {
            let uid: string
            if (phone) {
                uid = (await admin.auth().getUserByPhoneNumber(phone)).uid
            } else {
                uid = (await admin.auth().getUserByEmail(email)).uid
            }
            await admin.auth().updateUser(uid, { displayName, password })
            const { id } = await createStripeUser(uid, { email, phone })
            await user.set(uid, {
                name: displayName,
                email,
                phone,
                tierId: 'free',
                subscriptionStatus: 'active',
                stripeId: id
            })
            return successCreated(res)
        }
    } catch(err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function create(req: Request, res: Response) {
    try {
        const { email, phone, role: newRole } = req.body
        const { groupData } = res.locals
 
        if (!email && !phone)
            return badRequest(res, 'Email / Phone required')
        if (!newRole)
            return badRequest(res, 'Missing fields')
        if (!roles.includes(newRole)) 
            return badRequest(res, 'Invalid Role')

        const { groupId, groupName, tierId, subscriptionStatus } = groupData
        const tierData = await tier.get(tierId)
        const groupUsage = group.getUsage(groupData)
        if (tierData.user.allowed > 0 && groupUsage.user >= tierData.user.allowed){
            return limitExceeded(res)
        } else if (subscriptionStatus !== 'active' && subscriptionStatus !== 'past_due') {
            return tierExpired(res, subscriptionStatus)
        }
        const role: Role = newRole
        let userData: UserInterface | null = null
        let userAuth: admin.auth.UserRecord | null  = null
        try {
            if (email) {
                userAuth = await admin.auth().getUserByEmail(email)
                userData = await getUserByEmail(email)
            } else if (phone) {
                userAuth = await admin.auth().getUserByPhoneNumber(phone)
                userData = await getUserByPhone(phone)
            }
        } catch (_) { }
        let uid: string
        if (userData) {
            uid = userData.uid
        } else if (userAuth) {
            uid = userAuth.uid
        } else {
            const createdUser = await admin.auth().createUser({ email, phoneNumber: phone })
            uid = createdUser.uid
        }
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
        if (userData) {
            if (userData.groupId.includes(groupId)) {
                return badRequest(res, 'User already exists')
            } else {
                userData[role].push(groupId)
                userData.groupId.push(groupId)
                userData.groupRequests.push(groupId)
                userData.subjectId.push(...subjectIds)
                userData.requests = userData.requests.filter(rid => rid !== groupId)
                await user.update(userData)
            }
        } else {
            const newUserData = {
                uid,
                email,
                groupId: [ groupId ],
                [role]: [ groupId ],
                subjectId: subjectIds,
                groupRequests: [groupId],
            }
            await user.set(uid, newUserData)
        }
        await sendMail(newUserEmail(email, groupName))
        await claims.set(uid, { groupId, role })
        await group.addUser(groupData, role, uid)

        await paymentUsage({
            data: groupData,
            type: 'user',
            action: 'update',
            idempotencyKey: uid + Date.now().toString(),
            quantity: 1
        })
        return successCreated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function updateRole(req: Request, res: Response) {
    try {
        const { groupId, groupData: groupDataMain, uid: mainUid } = res.locals
        const { uid, role } = req.body
        if (mainUid === uid) return forbidden(res)
        else if (!uid || !role) return badRequest(res, 'Missing fields')
        else {
            const userData = await user.get(uid)
            if (!userData.groupId.includes(groupId)) return forbidden(res)
            else {
                let sections = userData.sectionId
                let subjects = userData.subjectId
                const oldRole: Role = roles.filter(r => userData[r].includes(groupId))[0]
                await user.updateRole(userData, groupId, oldRole, role)
                const groupData = await group.updateRole(groupDataMain, uid, oldRole, role)

                const sectionsInGroup = groupData.sectionId
                const subjectsInGroup = groupData.subjectId
                sections = filterIn(sections, sectionsInGroup)
                subjects = filterIn(subjects, subjectsInGroup)
                if (sections) {
                    sections.map(async sectionId => {
                        await section.updateRole(sectionId, uid, oldRole, role)
                    })
                }
                if (subjects) {
                    subjects.map(async subjectId => {
                        const sub = await subject.updateRole(subjectId, uid, oldRole, role)
                        await Promise.all(sub.entityId.map(async e => {
                            await analytics.setUserRole(e, uid, role)
                        }))
                    })
                }
                await claims.update(uid, { groupId, role })
                return successUpdated(res)
            }
        }
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function request(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { groupId } = req.body
        const groupData = await group.get(groupId)
        const userData = await user.get(uid)
        const { groupRequests } = userData
        if (groupRequests.includes(groupId)) {
            await group.removeRequest(groupData, uid)
            await user.removeRequest(userData, groupId)
        } else {
            await group.setRequest(groupData, uid)
            await user.setRequest(userData, groupId)
        }
        return successCreated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function cancelRequest(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { groupId } = req.params
        const groupData = await group.get(groupId)
        const userData = await user.get(uid)
        await group.removeRequest(groupData, uid)
        await user.removeRequest(userData, groupId)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function acceptRequest(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { groupId } = req.body
        const groupData = await group.get(groupId)
        const userData = await user.get(uid)
        await group.removeGroupRequest(groupData, uid)
        await user.removeGroupRequest(userData, groupId)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

async function getUserByEmail(email: string) {
    try {
        const userData = await user.getByEmail(email)
        return userData
    } catch (err) {
        return null
    }
}

async function getUserByPhone(phone: string) {
    try {
        const userData = await user.getByPhone(phone)
        return userData
    } catch (err) {
        return null
    }
}
