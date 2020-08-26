import { entitiesRef } from '../db'
import { EntityInterface, EntityType, Entity } from './schema'
import { firestore } from 'firebase-admin'
import { removeFile } from '../../storage/storage'

export async function get(entityId: string): Promise<EntityInterface> {
    try {
        const doc = await entitiesRef.doc(entityId).get()
        if (!doc.exists) throw new Error('Entity not found')
        const data = <EntityInterface>doc.data()
        data.entityId = doc.id
        return new Entity(data).get()
    } catch (err) {
        throw err
    }
}

export async function getAllByOrder(subjectId: string): Promise<EntityInterface[]> {
    try {
        const doc = await getBySubject(subjectId).orderBy('order', 'asc').get()
        return getAll(doc)
    } catch (err) {
        throw err
    }
}

export async function getByMaxOrder(subjectId: string) {
    try {
        const doc = await getBySubject(subjectId).orderBy('order', 'desc').limit(1).get()
        if (doc.empty) return null
        return new Entity(<EntityType>doc.docs[0].data()).get()
    } catch (err) {
        throw err
    }
}

export async function add(entity: EntityType): Promise<string> {
    try {
        const dataToInsert = new Entity(entity).get()
        const data = await entitiesRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function update(entity: EntityInterface): Promise<EntityInterface> {
    try {
        const { entityId } = entity
        const dataToUpdate = new Entity(entity).get()
        dataToUpdate.updatedAt = Date.now()
        await entitiesRef.doc(entityId).set(dataToUpdate)
        return entity
    } catch (err) {
        throw err
    }
}

export async function remove(entity: EntityInterface): Promise<string> {
    try {
        const { entityId, contentName, contentType, groupId, thumbnailName } = entity
        if (contentName) await removeFile(contentName, contentType, groupId)
        if (thumbnailName) await removeFile(thumbnailName, contentType, groupId)
        await entitiesRef.doc(entityId).delete()
        return entityId
    } catch (err) {
        throw err
    }
}

export async function removeAll(subjectId: string): Promise<EntityInterface[]> {
    try {
        const allEntities = await getBySubject(subjectId).get()
        const allEntityIds = await Promise.all(allEntities.docs.map(async entity => {
            const data = <EntityInterface>entity.data()
            data.entityId = entity.id
            await remove(data)
            return data
        }))
        return allEntityIds
    } catch (err) {
        throw err
    }
}

export async function updateEntities(entities: EntityInterface[]) {
    try {
        await Promise.all(entities.map(async entity => await update(entity)))
    } catch (err) {
        throw err
    }
}

function getAll(doc: firestore.QuerySnapshot): EntityInterface[] {
    if (doc.empty) throw new Error('No Entities have been found')
    const allData: EntityInterface[] = []
    doc.forEach(ent => {
        const data = <EntityType>ent.data()
        data.entityId = ent.id.toString()
        allData.push(new Entity(data).get())
    })
    return allData
}

function getBySubject(subjectId: string) {
    return entitiesRef.where('subjectId', '==', subjectId)
}
