import { subjectsRef } from '../db'
import { SubjectInterface, Subject, SubjectType } from './schema'
import { firestore } from 'firebase-admin'
import { Role } from "../common/schema";
import { roles } from '../common'
import { isDefined } from '../../utils/isDefined';

export async function get(subjectId: string): Promise<SubjectInterface> {
    try {
        const doc = await subjectsRef.doc(subjectId).get()
        if (!doc.exists) throw new Error('Subject not found')
        const data = <SubjectInterface>doc.data()
        data.subjectId = doc.id
        return new Subject(data).get()
    } catch (err) {
        throw err
    }
}

export async function getAllFromSection(sectionId: string): Promise<SubjectInterface[]> {
    try {
        const doc = await getBySection(sectionId).get()
        return getAll(doc)
    } catch (err) {
        throw err
    }
}

export async function getAllFromGroup(groupId: string): Promise<SubjectInterface[]> {
    try {
        const doc = await getBySection('').where('groupId', '==', groupId).get()
        return getAll(doc)
    } catch (err) {
        throw err
    }
}

export async function add(subject: SubjectType): Promise<string> {
    try {
        const dataToInsert = new Subject(subject).get()
        const data = await subjectsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function remove(subject: SubjectInterface): Promise<SubjectInterface> {
    try {
        const { subjectId } = subject
        await subjectsRef.doc(subjectId).delete()
        return subject
    } catch (err) {
        throw err
    }
}

export async function removeAll(sectionId: string = ''): Promise<SubjectInterface[]> {
    try {
        const subjects = await getBySection(sectionId).get()
        const allSubjectIds = await Promise.all(subjects.docs.map(async subject => {
            const data = <SubjectInterface>subject.data()
            data.subjectId = subject.id
            return await remove(data)
        }))
        return allSubjectIds
    } catch (err) {
        throw err
    }
}

export async function removeUserFromSection(sectionId: string, uid: string): Promise<SubjectInterface[]> {
    try {
        const subjects = await getAllFromSection(sectionId)
        const allSubjects = await Promise.all(subjects.map(async sub => {
            try {
                await removeUser(uid, sub)
                return sub
            } catch (err) {
                return undefined
            }
        }))
        return allSubjects.filter(isDefined)
    } catch (err) {
        throw err
    }
}

export async function addEntity(entityId: string, subject: SubjectInterface): Promise<SubjectInterface> {
    try {
        const { subjectId } = subject
        if (!subject.entityId.includes(entityId)) {
            subject.entityId.push(entityId)
            await update(subjectId, subject)
        }
        return subject
    } catch (err) {
        throw err
    }
}

export async function addUser(uid: string, subject: SubjectInterface, role: Role | null = null): Promise<SubjectInterface> {
    try {
        const { subjectId } = subject
        if (role && !subject[role].includes(uid))
            subject[role].push(uid)
        if (!subject.users.includes(uid))
            subject.users.push(uid)
        await update(subjectId, subject)
        return subject
    } catch (err) {
        throw err
    }
}

export async function removeUser(uid: string, subject: SubjectInterface): Promise<SubjectInterface> {
    try {
        const { subjectId } = subject
        const allChanges = roles.map(role => {
            if(subject[role].includes(uid)) {
                subject[role] = subject[role].filter(id => id !== uid)
                return true
            }
            return false
        })
        if (subject.users.includes(uid)) {
            subject.users = subject.users.filter(id => id !== uid)
            allChanges.push(true)
        }
        if (allChanges.includes(true)) await update(subjectId, subject)
        else throw new Error(`User does not exist in ${subject.subjectName}`)
        return subject
    } catch (err) {
        throw err
    }
}

export async function removeEntity(entityIds: string[], subject: SubjectInterface): Promise<string[]> {
    try {
        const { subjectId } = subject
        let { entityId } = subject
        const allEntityIds = entityIds.map(id => {
            if (entityId.includes(id)) {
                entityId = entityId.filter(e => e !== id)
                return id
            } else return ''
        })
        subject.entityId = entityId
        await update(subjectId, subject)
        return allEntityIds
    } catch (err) {
        throw err
    }
}

export async function removeUserFromRole(uid: string, subjectId: string, role: Role): Promise<SubjectInterface> {
    try {
        const subject = await get(subjectId)
        subject[role] = subject[role].filter(id => id !== uid)
        await update(subjectId, subject)
        return subject
    } catch (err) {
        throw err
    }
}

export async function removeUserFromRoleAll(uid: string, groupId: string, role: Role): Promise<SubjectInterface[]> {
    try {
        const docs = await subjectsRef.where('groupId', '==', groupId).where(role, 'array-contains', uid).get()
        if (docs.empty) return []
        let subject
        const subjectIds: SubjectInterface[] = []
        docs.forEach(async doc => {
            subject = new Subject(<SubjectInterface>doc.data()).get()
            subject[role] = subject[role].filter(r => r !== uid)
            const data = await update(doc.id, subject)
            subjectIds.push(data)
        })
        return subjectIds
    } catch (err) {
        throw err
    }
}

export async function updateRole(subjectId: string, uid: string, oldRole: Role, newRole: Role): Promise<SubjectInterface> {
    try {
        const subjectData = await get(subjectId)
        if (subjectData[oldRole].includes(uid)) {
            subjectData[oldRole] = subjectData[oldRole].filter(uidInRole => uidInRole !== uid)
            if (!subjectData[newRole].includes(uid)) {
                subjectData[newRole].push(uid)
                return await update(subjectId, subjectData)
            }
        }
        return subjectData
    } catch (err) {
        throw err
    }
}

export async function updateName(subjectName: string, subjectId: string): Promise<SubjectInterface> {
    try {
        const subject = await get(subjectId)
        subject.subjectName = subjectName
        await update(subjectId, subject)
        return subject
    } catch (err) {
        throw err
    }
}

export async function updateSection(sectionId: string, subjectId: string): Promise<SubjectInterface> {
    try {
        const subject = await get(subjectId)
        subject.sectionId = sectionId
        await update(subjectId, subject)
        return subject
    } catch (err) {
        throw err
    }
}

async function update(subjectId: string, subject: SubjectInterface): Promise<SubjectInterface> {
    try {
        const dataToUpdate = new Subject(subject).get()
        dataToUpdate.updatedAt = Date.now()
        await subjectsRef.doc(subjectId).set(dataToUpdate)
        return subject
    } catch (err) {
        throw err
    }
}

function getAll(doc: firestore.QuerySnapshot): SubjectInterface[] {
    try {
        if (doc.empty) throw new Error('No Subjects have been found')
        const allData: SubjectInterface[] = []
        doc.forEach(sub => {
            const data = <SubjectInterface>sub.data()
            data.subjectId = sub.id.toString()
            allData.push(new Subject(data).get())
        })
        return allData
    } catch (err) {
        throw err
    }
}

function getBySection(sectionId: string) {
    return subjectsRef.where('sectionId', '==', sectionId)
}
