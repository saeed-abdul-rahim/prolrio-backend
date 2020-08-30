import { usersRef } from '../db'
import { UserInterface, UserType, User } from './schema'
import { Role, SubscriptionItem, SubscriptionStatus } from '../common/schema'
import { filterOut } from '../../utils/filter'
import arraySplit from '../../utils/arraySplit'

export async function get(uid: string): Promise<UserInterface> {
    try {
        const doc = await usersRef.doc(uid).get()
        if (!doc.exists) throw new Error('User not found')
        const data = <UserInterface>doc.data()
        data.uid = doc.id
        return new User(data).get()
    } catch (err) {
        throw err
    }
}

export async function getByIds(uids: string[]): Promise<UserInterface[]> {
    try {
        return await Promise.all(uids.map(async id => {
            try {
                return await get(id)
            } catch (_) {
                return new User({}).get()
            }
        }))        
    } catch (err) {
        throw err
    }
}

export async function getByEmail(email: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('email', email)
    } catch (err) {
        throw err;
    }
}

export async function getByPhone(phone: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('phone', phone)
    } catch (err) {
        throw err;
    }
}

export async function getByStripeId(stripeId: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('stripeId', stripeId)
    } catch (err) {
        throw err;
    }
}

export async function set(uid: string, user: UserType): Promise<boolean> {
    try {
        const dataToInsert = new User(user).get()
        await usersRef.doc(uid).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(user: UserInterface): Promise<UserInterface> {
    try {
        const { uid } = user
        const dataToUpdate = new User(user).get()
        dataToUpdate.updatedAt = Date.now()
        await usersRef.doc(uid).set(dataToUpdate)
        return user
    } catch (err) {
        throw err
    }
}

export async function addtoGroup(user: UserInterface, groupId: string, role: Role, sudo = false): Promise<UserInterface> {
    try {
        if (!user[role].includes(groupId))
            user[role].push(groupId)
        if (!user.groupId.includes(groupId))
            user.groupId.push(groupId)
        if (sudo && !user.sudo.includes(groupId))
            user.sudo.push(groupId)
        return await update(user)
    } catch (err) {
        throw err
    }
}

export async function addtoSections(user: UserInterface, sectionIds: string[]): Promise<UserInterface> {
    try {
        if (sectionIds.length > 0) {
            sectionIds.map(sectionId => {
                if (!user.sectionId.includes(sectionId))
                    user.sectionId.push(sectionId)
            })
            return await update(user)
        }
        return user
    } catch (err) {
        throw err
    }
}

export async function addtoSubjects(user: UserInterface, subjectIds: string[]): Promise<UserInterface> {
    try {
        if (subjectIds.length > 0) {
            subjectIds.map(subjectId => {
                if (!user.subjectId.includes(subjectId))
                    user.subjectId.push(subjectId)
            })
            return await update(user)
        }
        return user
    } catch (err) {
        throw err
    }
}

export async function addtoEntity(uid: string, entityId: string): Promise<UserInterface> {
    try {
        const user = await get(uid)
        if (user.entityId.includes(entityId))
            return user
        user.entityId.push(entityId)
        return await update(user)
    } catch (err) {
        throw err
    }
}

export async function removeFromGroup(user: UserInterface, groupIdMain: string, sectionId: string[] = [], subjectId: string[] = [], isSudo = false): Promise<UserInterface> {
    try {
        const { sudo, admin, provider, learner, groupId, groupRequests } = user
        if ((!isSudo && !sudo.some(id => admin.includes(id)) || isSudo))
            user.admin = admin.filter((ids: string) => ids !== groupIdMain)
        if (isSudo) user.sudo = sudo.filter((ids: string) => ids !== groupIdMain)
        user.provider = provider.filter((ids: string) => ids !== groupIdMain)
        user.learner = learner.filter((ids: string) => ids !== groupIdMain)
        user.groupId = groupId.filter((ids: string) => ids !== groupIdMain)
        user.groupRequests = groupRequests.filter((ids: string) => ids !== groupIdMain)
        if (sectionId.length > 0) user.sectionId = filterOut(sectionId, user.sectionId)
        if (subjectId.length > 0) user.subjectId = filterOut(subjectId, user.subjectId)
        return await update(user)
    } catch (err) {
        throw err
    }
}

export async function removeFromSections(sectionIds: string[], subjectIds: string[], user: UserInterface): Promise<UserInterface> {
    try {
        const { sectionId, subjectId } = user
        if (sectionIds.length > 0) {
            user.sectionId = filterOut(sectionIds, sectionId)
            if (subjectIds.length > 0) user.subjectId = filterOut(subjectIds, subjectId)
            return await update(user)
        }
        return user
    } catch (err) {
        throw err
    }
}

export async function removeFromSubjects(subjectIds: string[], user: UserInterface): Promise<UserInterface> {
    try {
        const { subjectId } = user
        if (subjectIds.length === 0) return user
        user.subjectId = filterOut(subjectIds, subjectId)
        return await update(user)
    } catch (err) {
        throw err
    }
}

export async function removeAllFromSubjects(subjectIds: string[]): Promise<boolean> {
    try {
        const subjectIdsSplit = <typeof subjectIds[]>arraySplit(subjectIds)
        subjectIdsSplit.forEach(async subIds => {
            const usersInSubjects = await usersRef.where('subjectId', 'array-contains-any', subIds).get()
            await Promise.all(usersInSubjects.docs.map(async userInSubjects => {
                const user = <UserInterface>userInSubjects.data()
                const { id } = userInSubjects
                const { subjectId } = user
                user.uid = id
                user.subjectId = filterOut(subjectIds, subjectId)
                await update(user)
            }))
        })
        return true
    } catch (err) {
        throw err
    }
}

export async function removeAllFromSections(sectionIds: string[], subjectIds: string[]): Promise<boolean> {
    try {
        const sectionIdsSplit = <typeof sectionIds[]>arraySplit(sectionIds)
        sectionIdsSplit.forEach(async secIds => {
            const usersInSections = await usersRef.where('sectionId', 'array-contains-any', secIds).get()
            await Promise.all(usersInSections.docs.map(async userInSections => {
                const user = <UserInterface>userInSections.data()
                const { id } = userInSections
                const { sectionId, subjectId } = user
                user.uid = id
                user.sectionId = filterOut(sectionIds, sectionId)
                user.subjectId = filterOut(subjectIds, subjectId)
                await update(user)
            }))
        })
        return true
    } catch (err) {
        throw err
    }
}

export async function updateRole(user: UserInterface, groupId: string, oldRole: Role, newRole: Role): Promise<UserInterface> {
    try {
        if (user[oldRole].includes(groupId)) {
            user[oldRole] = user[oldRole].filter(uidInRole => uidInRole !== groupId)
            if (!user[newRole].includes(groupId)){
                user[newRole].push(groupId)
                return await update(user)
            }
        }
        return user
    } catch (err) {
        throw err
    }
}


export async function updateSubscription(user: UserInterface, tierId: string, subscriptionId: string, subscriptionItems: SubscriptionItem[], status: SubscriptionStatus): Promise<UserInterface> {
    try {
        const updatedUser = {
            ...user,
            tierId,
            subscriptionId,
            subscriptionItems,
            subscriptionStatus: status
        }
        return await update(updatedUser)
    } catch (err) {
        throw err
    }
}

export async function setRequest(userData: UserInterface, groupId: string): Promise<UserInterface> {
    try {
        if (userData.requests.includes(groupId)) throw new Error('Request already sent')
        userData.requests.push(groupId)
        return await update(userData)
    } catch (err) {
        throw err
    }
}

export async function removeRequest(userData: UserInterface, groupId: string): Promise<UserInterface> {
    try {
        if (!userData.requests.includes(groupId)) throw new Error('Request not found')
        else {
            userData.requests = userData.requests.filter(id => id !== groupId)
            return await update(userData)
        }
    } catch (err) {
        throw err
    }
}

export async function acceptGroupRequest(userData: UserInterface, groupId: string): Promise<UserInterface> {
    try {
        if (!userData.groupRequests.includes(groupId)) throw new Error('Request already found')
        userData.groupRequests.push(groupId)
        return await update(userData)
    } catch (err) {
        throw err
    }
}

export async function removeGroupRequest(userData: UserInterface, groupId: string): Promise<UserInterface> {
    try {
        if (!userData.groupRequests.includes(groupId)) throw new Error('Request not found')
        else {
            userData.groupRequests = userData.groupRequests.filter(id => id !== groupId)
            return await update(userData)
        }
    } catch (err) {
        throw err
    }
}

export async function acceptRequest(userData: UserInterface, groupId: string, role: Role): Promise<UserInterface> {
    try {
        if (!userData.requests.includes(groupId)) throw new Error('Request not found')
        if (!userData[role].includes(groupId))
            userData[role].push(groupId)
        if (!userData.groupId.includes(groupId))
            userData.groupId.push(groupId)
        userData.requests = userData.requests.filter(id => id !== groupId)
        return await update(userData)
    } catch (err) {
        throw err
    }
}

export async function addPayment(user: UserInterface, paymentSource: string): Promise<UserInterface> {
    try {
        user.paymentMethodId = paymentSource
        return await update(user)
    } catch (err) {
        throw err
    }
}

export async function removePayment(user: UserInterface, paymentSource: string): Promise<UserInterface> {
    try {
        user.paymentMethodId = ''
        return await update(user)
    } catch (err) {
        throw err
    }
}

async function getOneByCondition(field: string, value: string): Promise<UserInterface> {
    try {
        const doc = await usersRef.where(field, '==', value).get()
        if (doc.empty) throw new Error('User not found')
        const user = doc.docs[0].data()
        const data = <UserType>user
        data.uid = doc.docs[0].id
        return new User(data).get()
    } catch (err) {
        throw err;
    }
}
