import { TimestampInterface, TimestampType } from "../../common/schema"
import { Timestamp } from "../../common"

export type ViewCount = {
    id: string
    count: number
}

export type EntityCountType = {
    totalTimesPlayed?: number
    totalTimesViewed?: number
    totalWatchTime?: number
    totalTimeSpent?: number
    totalDownloads?: number
    totalUniqueDownloads?: number
    avgWatchTime?: number
    avgTimeSpent?: number
    totalViewers?: number
    totalUsers?: number
    totalComments?: number
    topViewers?: ViewCount[]
}

export type EntityUsersType = {
    ids?: string[]
    usersNotViewed?: string[]
    usersNotDownloaded?: string[]
    usersNotWatched?: string[]
    lastSeenId?: string
    lastOpenedTime?: number
    // current?: EntityCountType
    // historic?: EntityCountType
}

export type EntityAnalyticsType = TimestampType & {
    groupId: string
    subjectId: string
    entityId: string
    sectionIds?: string[]
    admin?: EntityUsersType
    provider?: EntityUsersType
    learner?: EntityUsersType
}

export interface EntityCountInterface {
    totalTimesPlayed: number
    totalTimesViewed: number
    totalWatchTime: number
    totalTimeSpent: number
    totalDownloads: number
    totalUniqueDownloads: number
    avgWatchTime: number
    avgTimeSpent: number
    totalViewers: number
    totalUsers: number
    totalComments: number
    topViewers: ViewCount[]
}

export interface EntityUsersInterface {
    ids: string[]
    usersNotViewed: string[]
    usersNotDownloaded: string[]
    usersNotWatched: string[]
    lastSeenId: string
    lastOpenedTime: number
    // current: EntityCountType
    // historic: EntityCountType
}

export interface EntityAnalyticsInterface extends TimestampInterface {
    groupId: string
    sectionIds: string[]
    subjectId: string
    entityId: string
    admin: EntityUsersInterface
    provider: EntityUsersInterface
    learner: EntityUsersInterface
}

export class EntityAnalytics extends Timestamp implements EntityAnalyticsInterface {
    groupId: string
    sectionIds: string[]
    subjectId: string
    entityId: string
    admin: EntityUsersInterface
    provider: EntityUsersInterface
    learner: EntityUsersInterface

    constructor(data: EntityAnalyticsType) {
        super(data)
        const { admin, provider, learner, groupId, subjectId, entityId } = data
        this.groupId = groupId
        this.subjectId = subjectId
        this.entityId = entityId
        this.sectionIds = data.sectionIds ? data.sectionIds : []
        this.admin = this.setEntityUsers(admin)
        this.provider = this.setEntityUsers(provider)
        this.learner = this.setEntityUsers(learner)
    }

    get(): EntityAnalyticsInterface {
        return {
            groupId: this.groupId,
            sectionIds: this.sectionIds,
            subjectId: this.subjectId,
            entityId: this.entityId,
            admin: this.admin,
            provider: this.provider,
            learner: this.learner
        }
    }

    private setEntityUsers(data: EntityUsersType | undefined): EntityUsersInterface {
        return {
            ids: data && data.ids ? data.ids : [],
            usersNotViewed: data && data.usersNotViewed ? data.usersNotViewed : [],
            usersNotDownloaded: data && data.usersNotDownloaded ? data.usersNotDownloaded : [],
            usersNotWatched: data && data.usersNotWatched ? data.usersNotWatched : [],
            lastSeenId: data && data.lastSeenId ? data.lastSeenId : '',
            lastOpenedTime: data && data.lastOpenedTime ? data.lastOpenedTime : 0,
            // current: data ? this.setEntityCount(data.current) : this.setEntityCount(data),
            // historic: data ? this.setEntityCount(data.historic) : this.setEntityCount(data)
        }
    }

    // private setEntityCount(data: EntityCountType | undefined): EntityCountInterface {
    //     if (data && data.topViewers) {
    //         data.topViewers.slice(0, 10)
    //     }
    //     return {
    //         totalTimesPlayed: data && data.totalTimesPlayed ? data.totalTimesPlayed : 0,
    //         totalTimesViewed: data && data.totalTimesViewed ? data.totalTimesViewed : 0,
    //         totalWatchTime: data && data.totalWatchTime ? data.totalWatchTime : 0,
    //         totalTimeSpent: data && data.totalTimeSpent ? data.totalTimeSpent : 0,
    //         totalDownloads: data && data.totalDownloads ? data.totalDownloads : 0,
    //         totalUniqueDownloads: data && data.totalUniqueDownloads ? data.totalUniqueDownloads : 0,
    //         avgWatchTime: data && data.avgWatchTime ? data.avgWatchTime : 0,
    //         avgTimeSpent: data && data.avgTimeSpent ? data.avgTimeSpent : 0,
    //         totalViewers: data && data.totalViewers ? data.totalViewers : 0,
    //         totalUsers: data && data.totalUsers ? data.totalUsers : 0,
    //         totalComments: data && data.totalComments ? data.totalComments : 0,
    //         topViewers: data && data.topViewers ? data.topViewers : []
    //     }
    // }

}