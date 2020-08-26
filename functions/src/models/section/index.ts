import { sectionsRef } from '../db'
import { SectionInterface, Section, SectionType } from './schema'
import { Role } from '../common/schema'
import { roles } from '../common'
import { filterOut } from '../../utils/filter'

export async function get(sectionId: string): Promise<SectionInterface> {
    try {
        const doc = await sectionsRef.doc(sectionId).get()
        if (!doc.exists) throw new Error('Section not found')
        const data = <SectionInterface>doc.data()
        data.sectionId = doc.id
        return new Section(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(section: SectionType): Promise<string> {
    try {
        const dataToInsert = new Section(section).get()
        const data = await sectionsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function addChild(section: SectionType, parentId: string): Promise<string> {
    try {
        const dataToInsert = new Section(section).get()
        dataToInsert.parentId = parentId
        const parentData = await sectionsRef.doc(parentId).get()
        const newParentData = new Section(<SectionInterface>parentData.data()).get()
        dataToInsert.parentIds = newParentData.parentIds
        dataToInsert.parentIds.push(parentId)
        const data = await sectionsRef.add(dataToInsert)
        if (newParentData.childIds) {
            newParentData.childIds.push(data.id)
            await update(parentId, newParentData)
        }
        return data.id
    } catch (err) {
        throw err
    }
}

export async function removePartial(sectionId: string): Promise<boolean> {
    try {
        await sectionsRef.doc(sectionId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(section: SectionInterface): Promise<SectionInterface[]> {
    try {
        const { sectionId, childIds } = section
        await sectionsRef.doc(sectionId).delete()
        let sectionIds: SectionInterface[] = [section]
        if (childIds.length > 0) {
            sectionIds = sectionIds.concat(...await Promise.all(childIds.map(async childId => {
                const childSection = await get(childId)
                return await remove(childSection)
            })))
        }
        return sectionIds
    } catch (err) {
        throw err
    }
}

// UP -> Add user to Parent Ids
// Down -> Add user to Child Ids
export async function addUser(uid: string, section: SectionInterface, role: Role, direction: 'up' | 'down' | 'none' = 'none'): Promise<SectionInterface[]> {
    try {
        const { sectionId } = section
        let sections: SectionInterface[] = []
        if(!section[role].includes(uid)) {
            sections.push(section)
            section[role].push(uid)
            section.users.push(uid)
            await update(sectionId, section)
        }
        if (section.childIds.length > 0 && direction === 'down') {
            const allChildIds = await Promise.all(section.childIds.map(async childId => {
                try {
                    const childSection = await get(childId)
                    return await addUser(uid, childSection, role, 'down')
                } catch (err) {
                    return []
                }
            }))
            sections = sections.concat(...allChildIds)
        }
        if (section.parentId && direction === 'up') {
            const parentSection = await get(section.parentId)
            sections = sections.concat(...await addUser(uid, parentSection, role, 'up'))
        }
        return sections
    } catch (err) {
        throw err
    }
}

export async function removeUser(uid: string, section: SectionInterface): Promise<string[]> {
    try {
        const { sectionId } = section
        let sectionIds = [sectionId]
        const allChanges = roles.map(role => {
            if(section[role].includes(uid)) {
                section[role] = section[role].filter(id => id !== uid)
                return true
            }
            return false
        })
        if (section.users.includes(uid)) {
            section.users = section.users.filter(id => id !== uid)
            allChanges.push(true)
        }
        if (allChanges.includes(true)) {
            await update(sectionId, section)
            if (section.childIds && section.childIds.length > 0) {
                const allChildIds = await Promise.all(section.childIds.map(async childId => {
                    try {
                        const childSection = await get(childId)
                        return await removeUser(uid, childSection)
                    } catch (err) {
                        return []
                    }
                }))
                sectionIds = sectionIds.concat(...allChildIds)
            }
        }
        return sectionIds
    } catch (err) {
        throw err
    }
}

export async function addSubject(subjectId: string, section: SectionInterface): Promise<SectionInterface> {
    try {
        const { sectionId } = section
        if (!section.subjectId.includes(subjectId)) {
            section.subjectId.push(subjectId)
            await update(sectionId, section)
        }
        return section
    } catch (err) {
        throw err
    }
}

export async function removeSubject(subjectIds: string[], section: SectionInterface): Promise<SectionInterface> {
    try {
        const { subjectId, sectionId } = section
        section.subjectId = filterOut(subjectIds, subjectId)
        return await update(sectionId, section)
    } catch (err) {
        throw err
    }
}

export async function removeUserFromRoleAll(uid: string, groupId: string, role: Role): Promise<Array<string>> {
    try {
        const docs = await getByGroup(groupId).where(role, 'array-contains', uid).get()
        if (docs.empty) return []
        let section
        const sectionIds: string[] = []
        docs.forEach(async doc => {
            sectionIds.push(doc.id)
            section = new Section(<SectionInterface>doc.data()).get()
            section[role] = section[role].filter(r => r !== uid)
            section.users = section.users.filter(r => r !== uid)
            await update(doc.id, section)
        })
        return sectionIds
    } catch (err) {
        throw err
    }
}

export async function updateRole(sectionId: string, uid: string, oldRole: Role, newRole: Role): Promise<SectionInterface> {
    try {
        const sectionData = await get(sectionId)
        if (sectionData[oldRole].includes(uid)) {
            sectionData[oldRole] = sectionData[oldRole].filter(uidInRole => uidInRole !== uid)
            if (!sectionData[newRole].includes(uid)) {
                sectionData[newRole].push(uid)
                return await update(sectionId, sectionData)
            }
        }
        return sectionData
    } catch (err) {
        throw err
    }
}

export async function updateName(sectionName: string, sectionId: string): Promise<SectionInterface> {
    try {
        const section = await get(sectionId)
        section.sectionName = sectionName
        await update(sectionId, section)
        return section
    } catch (err) {
        throw err
    }
}

async function update(sectionId: string, section: SectionInterface): Promise<SectionInterface> {
    try {
        const dataToUpdate = new Section(section).get()
        dataToUpdate.updatedAt = Date.now()
        await sectionsRef.doc(sectionId).set(dataToUpdate)
        return section
    } catch (err) {
        throw err
    }
}

// function getAll(doc: firestore.QuerySnapshot): SectionInterface[] {
//     if (doc.empty) throw new Error('No Sections have been found')
//     const allData: SectionInterface[] = []
//     doc.forEach(sec => {
//         const data = <SectionInterface>sec.data()
//         data.sectionId = sec.id.toString()
//         allData.push(new Section(data).get())
//     })
//     return allData
// }

// Retrieves all sections (including child)
function getByGroup(groupId: string) {
    return sectionsRef.where('groupId', '==', groupId)
}
