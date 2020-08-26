import * as admin from 'firebase-admin'
import { CustomClaims, CustomClaimsInterface, AllCustomClaimsInterface, CustomClaimsType } from './schema'

export async function get(uid: string): Promise<admin.auth.UserRecord> {
    try {
        return await admin.auth().getUser(uid)
    } catch (err) {
        throw err
    }
 }

export async function set(uid: string, newClaims: CustomClaimsType): Promise<boolean> {
    try {
        const user = await get(uid)
        const { customClaims } = user
        let setNewClaims
        if (customClaims && customClaims.claims) {
            const claims: CustomClaimsInterface[] = customClaims.claims
            const currentClaims = claims.find(c => c.groupId === newClaims.groupId)
            if (currentClaims && currentClaims.role === newClaims.role)
                return true
            setNewClaims = [ ...customClaims.claims.map((claim: CustomClaimsInterface) => new CustomClaims(claim).get()), newClaims ]
        }
        else
            setNewClaims = [ newClaims ]
        await admin.auth().setCustomUserClaims(uid, { claims: setNewClaims })
        return true
    } catch (err) {
        throw err
    }
 }

export async function remove(customClaims: AllCustomClaimsInterface, groupId: string, uid: string) : Promise<AllCustomClaimsInterface> {
    try {
        customClaims.claims = customClaims.claims.filter((claim: CustomClaimsInterface) => claim.groupId !== groupId)
        await setClaims(uid, customClaims)
        return customClaims
    } catch (err) {
        throw err
    }
}

export async function update(uid: string, updateClaims: CustomClaimsType): Promise<AllCustomClaimsInterface> {
    try {
        const user = await get(uid)
        const { customClaims } = user
        const newClaims = new CustomClaims(updateClaims)
        if (!customClaims || !customClaims.claims) throw new Error('User not part of any group')
        const claims: AllCustomClaimsInterface = <AllCustomClaimsInterface>customClaims
        const groupIndex = claims.claims.findIndex((claim: CustomClaimsInterface) => claim.groupId === newClaims.groupId)
        claims.claims[groupIndex] = newClaims
        await setClaims(uid, claims)
        return claims
    } catch (err) {
        throw err
    }
}

export function findGroup(customClaims: AllCustomClaimsInterface, groupId: string): CustomClaimsInterface {
    const claimFilter = customClaims.claims.find((claim: CustomClaimsInterface) => claim.groupId === groupId )
    if (!claimFilter) 
        throw new Error("User is not part of the group")
    else return claimFilter
}

export function checkIfExist(user: admin.auth.UserRecord): AllCustomClaimsInterface {
    const { customClaims } = user
    if (!customClaims || !customClaims.claims || customClaims.claims.length === 0) 
        throw new Error("User does'nt have claims")
    return { claims: customClaims.claims as Array<any> }
}

async function setClaims(uid: string, customClaims: AllCustomClaimsInterface): Promise<boolean> {
    try {
        await admin.auth().setCustomUserClaims(uid, customClaims)
        return true
    } catch (err) {
        throw err
    }
}
