import { Tier, TierInterface, TierType } from './schema'
import { tiersRef } from '../db'

export async function get(tierId: string): Promise<TierInterface> {
    try {
        const doc = await tiersRef.doc(tierId).get()
        if (!doc.exists) throw new Error('Tier not found')
        const data = <TierInterface>doc.data()
        data.tierId = doc.id
        return new Tier(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(id: string, tier: TierType): Promise<TierInterface> {
    try {
        const dataToInsert = new Tier(tier).get()
        dataToInsert.tierId = id
        await tiersRef.doc(id).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function update(id: string, tier: TierInterface): Promise<TierInterface> {
    try {
        const dataToUpdate = new Tier(tier).get()
        dataToUpdate.updatedAt = Date.now()
        await tiersRef.doc(id).set(dataToUpdate)
        return tier
    } catch (err) {
        throw err
    }
}

export async function remove(id: string): Promise<string> {
    try {
        await tiersRef.doc(id).delete()
        return id
    } catch (err) {
        throw err
    }
}
