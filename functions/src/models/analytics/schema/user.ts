import { Role, TimestampType, TimestampInterface, Status } from '../../common/schema'
import { Timestamp } from '../../common'

export type DateCount = {
    date: number
    count: number
}

export interface UserAnalyticsInterface extends TimestampInterface {
    uid: string
    role: Role
    groupId: string
    sectionIds: string[]
    subjectId: string
    entityId: string
    status: Status
    name: string
    email: string
    phone: string
    lastSeen: number
    recentWatchTime: number
    recentTimeSpent: number
    totalWatchTime: number
    totalTimeSpent: number
    totalDownloads: number
    totalTimesPlayed: number
    totalTimesViewed: number
    downloaded: boolean
    viewed: boolean
    watched: boolean
    avgWatchTime: number
    avgTimeSpent: number
    totalComments: number
    dateViewed: DateCount[]
    datePlayed: DateCount[]
}

export type UserAnalyticsType = TimestampType & {
    uid: string
    role: Role
    entityId: string
    groupId?: string
    sectionIds?: string[]
    subjectId?: string
    status?: Status
    name?: string
    email?: string
    phone?: string
    lastSeen?: number
    recentWatchTime?: number
    recentTimeSpent?: number
    totalWatchTime?: number
    totalTimeSpent?: number
    totalDownloads?: number
    totalTimesPlayed?: number
    totalTimesViewed?: number
    downloaded?: boolean
    viewed?: boolean
    watched?: boolean
    avgWatchTime?: number
    avgTimeSpent?: number
    topViewers?: string[]
    totalComments?: number
    dateViewed?: DateCount[]
    datePlayed?: DateCount[]
}

export class UserAnalytics extends Timestamp implements UserAnalyticsInterface {
    uid: string
    role: Role
    entityId: string
    groupId: string
    sectionIds: string[]
    subjectId: string
    status: Status
    name: string
    email: string
    phone: string
    lastSeen: number
    recentWatchTime: number
    recentTimeSpent: number
    totalWatchTime: number
    totalTimeSpent: number
    totalDownloads: number
    totalTimesPlayed: number
    totalTimesViewed: number
    downloaded: boolean
    viewed: boolean
    watched: boolean
    avgWatchTime: number
    avgTimeSpent: number
    totalComments: number
    dateViewed: DateCount[]
    datePlayed: DateCount[]

    constructor(data: UserAnalyticsType) {
        super(data)
        this.uid = data.uid
        this.role = data.role
        this.entityId = data.entityId
        this.groupId = data.groupId ? data.groupId : ''
        this.sectionIds = data.sectionIds ? data.sectionIds : []
        this.subjectId = data.subjectId ? data.subjectId : ''
        this.status = data.status ? data.status : 'active'
        this.name = data.name ? data.name : ''
        this.email = data.email ? data.email : ''
        this.phone = data.phone ? data.phone : ''
        this.lastSeen = data.lastSeen ? data.lastSeen : 0
        this.recentWatchTime = data.recentWatchTime ? data.recentWatchTime : 0
        this.recentTimeSpent = data.recentTimeSpent ? data.recentTimeSpent : 0
        this.totalWatchTime = data.totalWatchTime ? data.totalWatchTime : 0
        this.totalTimeSpent = data.totalTimeSpent ? data.totalTimeSpent : 0
        this.totalDownloads = data.totalDownloads ? data.totalDownloads : 0
        this.totalTimesPlayed = data.totalTimesPlayed ? data.totalTimesPlayed : 0
        this.totalTimesViewed = data.totalTimesViewed ? data.totalTimesViewed : 0
        this.downloaded = data.downloaded ? data.downloaded : false
        this.viewed = data.viewed ? data.viewed : false
        this.watched = data.watched ? data.watched : false
        this.avgWatchTime = data.avgWatchTime ? data.avgWatchTime : 0
        this.avgTimeSpent = data.avgTimeSpent ? data.avgTimeSpent : 0
        this.totalComments = data.totalComments ? data.totalComments : 0
        this.dateViewed = data.dateViewed ? data.dateViewed : []
        this.datePlayed = data.datePlayed ? data.datePlayed : []
    }

    get(): UserAnalyticsInterface {
        return {
            ...super.get(),
            uid: this.uid,
            role: this.role,
            entityId: this.entityId,
            groupId: this.groupId,
            sectionIds: this.sectionIds,
            subjectId: this.subjectId,
            status: this.status,
            name: this.name,
            email: this.email,
            phone: this.phone,
            lastSeen: this.lastSeen,
            recentWatchTime: this.recentWatchTime,
            recentTimeSpent: this.recentTimeSpent,
            totalWatchTime: this.totalWatchTime,
            totalTimeSpent: this.totalTimeSpent,
            totalDownloads: this.totalDownloads,
            totalTimesPlayed: this.totalTimesPlayed,
            totalTimesViewed: this.totalTimesViewed,
            downloaded: this.downloaded,
            viewed: this.viewed,
            watched: this.watched,
            avgWatchTime: this.avgWatchTime,
            avgTimeSpent: this.avgTimeSpent,
            totalComments: this.totalComments,
            dateViewed: this.dateViewed,
            datePlayed: this.datePlayed
        }
    }

}