import * as functions from 'firebase-functions'

import * as analytics from '../../models/analytics'
import { UserAnalytics, UserAnalyticsType } from '../../models/analytics/schema'

export async function createEntityAnalytics(change: functions.Change<functions.firestore.DocumentSnapshot>, uid: string, entityId: string) {
    try {
        const { after, before } = change
        const userEntityBefore = before.exists ? before.data() as UserAnalyticsType : null
        const userEntityAfter = after.exists ? after.data() as UserAnalyticsType : null
        
        const userEntityBeforeData = userEntityBefore && new UserAnalytics(userEntityBefore).get()
        const userEntityAfterData = userEntityAfter && new UserAnalytics(userEntityAfter).get()

        if (userEntityAfterData) {
            // Create Or Update
            const entityData = await analytics.getEntity(entityId)
            const { groupId, sectionIds, subjectId } = entityData
            const newUserData = {
                ...userEntityAfterData,
                groupId,
                sectionIds,
                subjectId
            }
            await analytics.setUser(newUserData)
            await analytics.setUsage(userEntityAfterData, entityData)
        } else if (userEntityBeforeData && !userEntityAfterData) {
            // Delete
            await analytics.setUserStatus(entityId, uid, 'inactive')
            await analytics.removeUsage(userEntityBeforeData)
        }
    } catch (err) {
        console.log(err)
    }
}
