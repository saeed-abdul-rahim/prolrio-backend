import { Metadata, MetadataInterface, MetadataType } from './schema'
import { metadataRef } from '../db'

export async function get(id: string): Promise<MetadataInterface> {
    try {
        const doc = await metadataRef.doc(id).get()
        if (!doc.exists) throw new Error('Metadata not found')
        const data = doc.data() as MetadataInterface
        return new Metadata(data).get()
    } catch (err) {
        throw err
    }
}

export async function set(metadata: MetadataInterface): Promise<MetadataInterface> {
    try {
        const { id } = metadata
        const dataToInsert = new Metadata(metadata).get()
        await metadataRef.doc(id).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function remove(id: string): Promise<boolean> {
    try {
        await metadataRef.doc(id).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function update(data: MetadataType): Promise<boolean> {
    try {
        const { id } = data
        await metadataRef.doc(id).update({ ...data, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}
