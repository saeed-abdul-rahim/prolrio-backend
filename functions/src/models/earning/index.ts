import { earningsRef } from '../db'
import { EarningInterface, Earning, EarningType } from './schema'

export async function get(id: string): Promise<EarningInterface> {
    try {
        const doc = await earningsRef.doc(id).get()
        if (!doc.exists) throw new Error('Earning not found')
        const data = <EarningInterface>doc.data()
        data.groupId = doc.id
        return new Earning(data).get()
    } catch (err) {
        throw err
    }
}

export async function set(earning: EarningType): Promise<EarningInterface> {
    try {
        const { groupId } = earning
        const dataToInsert = new Earning(earning).get()
        dataToInsert.updatedAt = Date.now()
        await earningsRef.doc(groupId).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function update(data: EarningType): Promise<boolean> {
    try {
        const { groupId } = data
        await earningsRef.doc(groupId).update({ ...data, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(id: string): Promise<boolean> {
    try {
        await earningsRef.doc(id).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function checkIfEarningExist(groupId: string): Promise<EarningInterface | null> {
    try {
        return await get(groupId)
    } catch (err) {
        return null
    }
}
