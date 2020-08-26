import { analyticsRef, usersRef } from '../db'
import {
    UserAnalytics,
    UserAnalyticsType,
    UserAnalyticsInterface,
    EntityAnalyticsInterface,
    EntityAnalytics,
    EntityAnalyticsType
} from './schema'
import { Role, Status } from '../common/schema'
import { USERANALYTICS, ENTITIES } from '../constants'

export async function getEntity(id: string): Promise<EntityAnalyticsInterface> {
    try {
        const doc = await analyticsRef.doc(id).get()
        if (!doc.exists) {
            throw new Error('Data not found')
        }
        const data = <EntityAnalyticsInterface>doc.data()
        data.entityId = doc.id
        return new EntityAnalytics(data).get()
    } catch (err) {
        throw err
    }
}

export async function getUser(entityId: string, uid: string): Promise<UserAnalyticsInterface> {
    try {
        const doc = await analyticsRef.doc(entityId).collection(USERANALYTICS).doc(uid).get()
        let data: UserAnalyticsInterface
        if (!doc.exists) {
            throw new Error('Data not found')
        }
        data = <UserAnalyticsInterface>doc.data()
        data.entityId = doc.id
        return new UserAnalytics(data).get()
    } catch (err) {
        throw err
    }
}

export async function setEntity(analytics: EntityAnalyticsType): Promise<EntityAnalyticsInterface> {
    try {
        const dataToInsert = new EntityAnalytics(analytics).get()
        const { entityId } = dataToInsert
        await analyticsRef.doc(entityId).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function updateEntity(analytics: EntityAnalyticsType): Promise<EntityAnalyticsInterface> {
    try {
        const dataToInsert = new EntityAnalytics(analytics).get()
        dataToInsert.updatedAt = Date.now()
        const { entityId } = dataToInsert
        await analyticsRef.doc(entityId).update(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function removeEntity(id: string): Promise<boolean> {
    try {
        const users = await analyticsRef.doc(id).collection(USERANALYTICS).get()
        users.forEach(async usr => {
            return await analyticsRef.doc(id).collection(USERANALYTICS).doc(usr.id).delete()
        })
        await analyticsRef.doc(id).delete()
        return true
    } catch (err) {
        return false
    }
}

export async function removeEntityFromUser(entityId: string, uid: string): Promise<boolean> {
    try {
        await usersRef.doc(uid).collection(ENTITIES).doc(entityId).delete()
        return true
    } catch (err) {
        return false
    }
}

export async function removeEntityComplete(entityIds: string[], userIds: string[]): Promise<boolean> {
    try {
        await Promise.all(entityIds.map(async e => {
            await removeEntity(e)
            await Promise.all(userIds.map(async usrId => {
                await removeEntityFromUser(e, usrId)
            }))
        }))
        return true
    } catch (_) {
        return false
    }
}

export async function setUserStatus(entityId: string, uid: string, status: Status): Promise<boolean> {
    try {
        await analyticsRef.doc(entityId).collection(USERANALYTICS).doc(uid).update({ status })
        return true
    } catch (err) {
        return false
    }
}

export async function setUserRole(entityId: string, uid: string, role: Role): Promise<boolean> {
    try {
        await analyticsRef.doc(entityId).collection(USERANALYTICS).doc(uid).update({ role })
        return true
    } catch (err) {
        return false
    }
}

export async function setUser(analytics: UserAnalyticsType): Promise<UserAnalyticsInterface> {
    try {
        let newData = new UserAnalytics(analytics).get()
        const currDateStr = new Date(Date.now()).toISOString().split('T')[0]
        const currDate = new Date(currDateStr).valueOf()
        const { uid, entityId,
            downloaded, watched, viewed,
            recentTimeSpent, recentWatchTime
        } = newData
        newData = {
            ...newData,
            lastSeen: Date.now()
        }
        try {
            const oldData = await getUser(entityId, uid)
            const { totalWatchTime, totalTimesViewed, totalTimesPlayed, totalTimeSpent,
                totalDownloads } = oldData
            let { dateViewed, datePlayed } = oldData
            const start = {
                date: currDate,
                count: 1
            }
            if (viewed && dateViewed.length === 0) {
                dateViewed = [start]
            } else if (viewed) {
                const itemIndex = dateViewed.findIndex(date => date.date === currDate)
                if (itemIndex > -1) {
                    const item = dateViewed[itemIndex]
                    item.count += 1
                    dateViewed[itemIndex] = item
                } else {
                    dateViewed.unshift(start)
                }
            }
            if (watched && datePlayed.length === 0) {
                datePlayed = [start]
            } else if (watched) {
                const itemIndex = datePlayed.findIndex(date => date.date === currDate)
                if (itemIndex > -1) {
                    const item = datePlayed[itemIndex]
                    item.count += 1
                    datePlayed[itemIndex] = item
                } else {
                    datePlayed.unshift(start)
                }
            }
            newData = {
                ...newData,
                recentTimeSpent: recentTimeSpent !== 0 ? recentTimeSpent : oldData.recentTimeSpent,
                recentWatchTime: recentWatchTime !== 0 ? recentWatchTime : oldData.recentWatchTime,
                totalDownloads: downloaded ? totalDownloads + 1 : totalDownloads,
                totalTimesViewed: viewed ? totalTimesViewed + 1 : totalTimesViewed,
                totalTimesPlayed: watched ? totalTimesPlayed + 1 : totalTimesPlayed,
                totalTimeSpent: recentTimeSpent ? totalTimeSpent + recentTimeSpent : totalTimeSpent,
                totalWatchTime: recentWatchTime ? totalWatchTime + recentWatchTime : totalWatchTime,
                dateViewed,
                datePlayed
            }
            if (newData.totalTimesPlayed > 0 && newData.totalWatchTime > 0) {
                newData.avgWatchTime = newData.totalWatchTime / newData.totalTimesPlayed
            }
            if (newData.totalTimesViewed > 0 && newData.totalTimeSpent > 0) {
                newData.avgTimeSpent = newData.totalTimeSpent / newData.totalTimesViewed
            }
        } catch (err) {
            if (err.message === 'Data not found') {
                newData = {
                    ...newData,
                    status: 'active',
                    totalDownloads: downloaded ? 1 : 0,
                    totalTimesViewed: viewed ? 1 : 0,
                    totalTimesPlayed: watched ? 1 : 0,
                    totalTimeSpent: recentTimeSpent ? recentTimeSpent : 0,
                    totalWatchTime: recentWatchTime ? recentWatchTime : 0,
                    dateViewed: viewed ? [{ date: currDate, count: 1 }] : [] ,
                    datePlayed: watched ? [{ date: currDate, count: 1 }] : []
                }
            }
        }
        await analyticsRef.doc(entityId).collection(USERANALYTICS).doc(uid).set(newData)
        return newData
    } catch (err) {
        throw err
    }
}

export async function setUsage(user: UserAnalyticsInterface, entityData: EntityAnalyticsInterface) {
    try {
        const { role, uid, viewed, watched, downloaded } = user
        const entityDataRole = entityData[role]
        const { ids } = entityDataRole
        let { usersNotViewed, usersNotDownloaded, usersNotWatched } = entityDataRole
        let { lastSeenId, lastOpenedTime } = entityDataRole
        lastSeenId = uid
        lastOpenedTime = Date.now()
        if (!ids.includes(uid)) {
            ids.unshift(uid)
        }
        if (usersNotViewed.includes(uid) && viewed) {
            usersNotViewed = usersNotViewed.filter(u => u !== uid)
        }
        if (usersNotDownloaded.includes(uid) && downloaded) {
            usersNotDownloaded = usersNotDownloaded.filter(u => u !== uid)
        }
        if (usersNotWatched.includes(uid) && watched) {
            usersNotWatched = usersNotWatched.filter(u => u !== uid)
        }
        const newEntityDataRole = {
            lastSeenId,
            lastOpenedTime,
            ids,
            usersNotDownloaded,
            usersNotViewed,
            usersNotWatched
        }
        const newEntityData = {
            ...entityData,
            [role]: newEntityDataRole
        }
        return await updateEntity(newEntityData)
    } catch (err) {
        throw err
    }
}

export async function removeUsage(user: UserAnalyticsInterface) {
    try {
        const { role, uid, entityId } = user
        const entityData = await getEntity(entityId)
        const entityDataRole = entityData[role]
        const { ids } = entityDataRole
        let { usersNotViewed, usersNotDownloaded, usersNotWatched } = entityDataRole
        if (ids.includes(uid)) {
            ids.filter(u => u !== uid)
        }
        if (usersNotViewed.includes(uid)) {
            usersNotViewed = usersNotViewed.filter(u => u !== uid)
        }
        if (usersNotDownloaded.includes(uid)) {
            usersNotDownloaded = usersNotDownloaded.filter(u => u !== uid)
        }
        if (usersNotWatched.includes(uid)) {
            usersNotWatched = usersNotWatched.filter(u => u !== uid)
        }
        const newEntityData = {
            ...entityData,
            [role]: {
                ids,
                usersNotViewed,
                usersNotDownloaded,
                usersNotWatched
            }
        }
        return await updateEntity(newEntityData)
    } catch (err) {
        throw err
    }
}
