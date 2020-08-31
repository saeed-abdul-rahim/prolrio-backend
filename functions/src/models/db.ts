import * as admin from 'firebase-admin'
import {
    VERSION,
    DB,
    USERS,
    GROUPS,
    EARNINGS,
    SECTIONS,
    SUBJECTS,
    ENTITIES,
    ANALYTICS,
    TIERS,
    METADATA,
    SUPPORT,
    PRODUCTS
} from './constants'

const db = admin.firestore()
const ref = db.collection(VERSION).doc(DB)

export const batch = admin.firestore().batch()

export const tiersRef = ref.collection(TIERS)
export const usersRef = ref.collection(USERS)
export const groupsRef = ref.collection(GROUPS)
export const earningsRef = ref.collection(EARNINGS)
export const sectionsRef = ref.collection(SECTIONS)
export const subjectsRef = ref.collection(SUBJECTS)
export const entitiesRef = ref.collection(ENTITIES)
export const metadataRef = ref.collection(METADATA)
export const productsRef = ref.collection(PRODUCTS)
export const supportRef = ref.collection(SUPPORT)
export const analyticsRef = ref.collection(ANALYTICS)

export const dbRoute = `${VERSION}/${DB}`
export const tiersRoute = `${dbRoute}/${TIERS}`
export const usersRoute = `${dbRoute}/${USERS}`
export const groupsRoute = `${dbRoute}/${GROUPS}`
export const earningsRoute = `${dbRoute}/${EARNINGS}`
export const sectionsRoute = `${dbRoute}/${SECTIONS}`
export const subjectsRoute = `${dbRoute}/${SUBJECTS}`
export const entitesRoute = `${dbRoute}/${ENTITIES}`
export const metadataRoute = `${dbRoute}/${METADATA}`
export const supportRoute = `${dbRoute}/${SUPPORT}`
export const analyticsRoute = `${dbRoute}/${ANALYTICS}`
export const usersAnalyticsRoute = `${analyticsRoute}/{id}/${USERS}`
