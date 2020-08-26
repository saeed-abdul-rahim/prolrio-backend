import { groupsRef } from '../db'
import { GroupInterface, Group, GroupType } from './schema'
import { Role, SubscriptionItem, Usage, SubscriptionStatus } from '../common/schema'
import { filterOut } from '../../utils/filter'

export async function get(id: string): Promise<GroupInterface> {
    try {
        const doc = await groupsRef.doc(id).get()
        if (!doc.exists) throw new Error('Group not found')
        const data = <GroupInterface>doc.data()
        data.groupId = doc.id
        return new Group(data).get()
    } catch (err) {
        throw err
    }
}

export async function getAll(groupIds: string[]): Promise<GroupInterface[]> {
    try {
        return await Promise.all(groupIds.map(async id => await get(id)))
    } catch (err) {
        throw err
    }
}

export async function set(group: GroupType): Promise<GroupInterface> {
    try {
        const { groupId } = group
        const dataToInsert = new Group(group).get()
        dataToInsert.updatedAt = Date.now()
        await groupsRef.doc(groupId).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function remove(id: string): Promise<boolean> {
    try {
        await groupsRef.doc(id).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function update(data: GroupType): Promise<boolean> {
    try {
        const { groupId } = data
        await groupsRef.doc(groupId).update({ ...data, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function removeUser(groupData: GroupInterface, uid: string): Promise<GroupInterface> {
    try {
        let { admin, provider, learner, users, groupRequests } = groupData
        admin = admin.filter(e => e !== uid)
        provider = provider.filter(e => e !== uid)
        learner = learner.filter(e => e !== uid)
        users = users.filter(e => e !== uid)
        groupRequests = groupRequests.filter(e => e !== uid)
        groupData.admin = admin
        groupData.provider = provider
        groupData.learner = learner
        groupData.users = users
        groupData.groupRequests = groupRequests
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function setRequest(groupData: GroupInterface, uid: string): Promise<GroupInterface> {
    try {
        if (groupData.requests.includes(uid)) throw new Error('Request already sent')
        groupData.requests.push(uid)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function removeRequest(groupData: GroupInterface, uid: string): Promise<GroupInterface> {
    try {
        if (!groupData.requests.includes(uid)) throw new Error('Request not sent')
        groupData.requests = groupData.requests.filter(id => id !== uid)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function acceptRequest(groupData: GroupInterface, uid: string, role: Role): Promise<GroupInterface> {
    try {
        if (!groupData.requests.includes(uid)) throw new Error('No requests found for this user')
        groupData[role].push(uid)
        groupData.requests = groupData.requests.filter(id => id !== uid)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function removeGroupRequest(groupData: GroupInterface, uid: string): Promise<GroupInterface> {
    try {
        if (!groupData.groupRequests.includes(uid)) throw new Error('Request not sent')
        groupData.groupRequests = groupData.groupRequests.filter(id => id !== uid)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function setGroupRequest(groupData: GroupInterface, uid: string): Promise<GroupInterface> {
    try {
        if (groupData.groupRequests.includes(uid)) throw new Error('Request already sent')
        groupData.groupRequests = groupData.groupRequests.filter(id => id !== uid)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function addUser(groupData: GroupInterface, role: Role, uid: string): Promise<GroupInterface> {
    try {
        const { groupId } = groupData
        let updated = false;
        if (!groupData[role].includes(uid)) {
            groupData[role].push(uid)
            updated = true
        }
        if (!groupData.users.includes(uid)) {
            groupData.users.push(uid)
            updated = true
        }
        if (groupData.requests.includes(uid)) {
            groupData.requests = groupData.requests.filter(rid => rid !== groupId)
            updated = true
        }
        if (!groupData.groupRequests.includes(uid)) {
            groupData.groupRequests.push(uid)
            updated = true
        }
        if (updated) return await set(groupData)
        else return groupData
    } catch (err) {
        throw err
    }
}

export async function addSection(groupId: string, sectionId: string): Promise<GroupInterface> {
    try {
        const groupData = await get(groupId)
        if (groupData.sectionId.includes(sectionId)) throw new Error('Section already exists')
        groupData.sectionId.push(sectionId)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function addSubject(groupId: string, subjectId: string): Promise<GroupInterface> {
    try {
        const groupData = await get(groupId)
        if (groupData.subjectId.includes(subjectId)) throw new Error('Subject already exists')
        groupData.subjectId.push(subjectId)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function removeSection(groupData: GroupInterface, sectionIds: string[], subjectIds: string[]): Promise<GroupInterface> {
    try {
        const { sectionId, subjectId } = groupData
        groupData.sectionId = filterOut(sectionIds, sectionId)
        groupData.subjectId = filterOut(subjectIds, subjectId)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function removeSubject(groupData: GroupInterface, subjectIds: string[]): Promise<GroupInterface> {
    try {
        const { subjectId } = groupData
        groupData.subjectId = filterOut(subjectIds, subjectId)
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function updateStorage(groupData: GroupInterface, newStorage: number, action: 'add' | 'subtract'): Promise<GroupInterface> {
    try {
        if (action === 'add') groupData.currentStorage += newStorage
        if (action === 'subtract') groupData.currentStorage -= newStorage
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function updateRole(groupData: GroupInterface, uid: string, oldRole: Role, newRole: Role): Promise<GroupInterface> {
    try {
        if (groupData[oldRole].includes(uid)) {
            groupData[oldRole] = groupData[oldRole].filter(uidInRole => uidInRole !== uid)
            if (!groupData[newRole].includes(uid)) {
                groupData[newRole].push(uid)
                return await set(groupData)
            }
        }
        return groupData
    } catch (err) {
        throw err
    }
}

export async function updateSubscription(groupData: GroupInterface, tierId: string, subscriptionItems: SubscriptionItem[], status: SubscriptionStatus): Promise<GroupInterface> {
    try {
        groupData.tierId = tierId
        groupData.subscriptionItems = subscriptionItems
        groupData.subscriptionStatus = status
        return await set(groupData)
    } catch (err) {
        throw err
    }
}

export async function checkIfgroupExists(groupId: string): Promise<boolean> {
    try {
        await get(groupId)
        return true
    } catch (err) {
        return false
    }
}

export function getUsage(groupData: GroupInterface): Usage {
    const {
        admin,
        provider,
        learner,
        sectionId,
        subjectId,
        currentStorage
    } = groupData
    const user = (admin.length - 1) + provider.length + learner.length
    const section = sectionId.length
    const subject = subjectId.length
    return {
        group: 1,
        user,
        section,
        subject,
        storage: currentStorage
    }
}
