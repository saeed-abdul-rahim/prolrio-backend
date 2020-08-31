import { CommonInterface, CommonType, SubscriptionItem, SubscriptionStatus } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface GroupInterface extends CommonInterface {
    groupId: string
    groupName: string
    sudo: string
    sectionId: string[]
    subjectId: string[]
    accredited: string
    city: string
    fullLocation: string
    sinceDate: number
    requests: string[]
    groupRequests: string[]
    blacklist: string[]
    currentStorage: number
    tierId: string
    subscriptionStatus: SubscriptionStatus
    subscriptionItems: SubscriptionItem[]
    paid: boolean
}

export type GroupType = CommonType & {
    groupId: string
    groupName?: string
    sudo?: string
    sectionId?: string[]
    subjectId?: string[]
    accredited?: string
    city?: string
    fullLocation?: string
    sinceDate?: number
    requests?: string[]
    groupRequests?: string[]
    blacklist?: string[]
    currentStorage?: number
    tierId?: string
    subscriptionStatus?: SubscriptionStatus
    subscriptionItems?: SubscriptionItem[]
    paid?: boolean
}

export class Group extends Common implements GroupInterface {
    groupId: string
    groupName: string
    sudo: string
    sectionId: string[]
    subjectId: string[]
    accredited: string
    city: string
    fullLocation: string
    sinceDate: number
    requests: string[]
    groupRequests: string[]
    blacklist: string[]
    currentStorage: number
    tierId: string
    subscriptionStatus: SubscriptionStatus
    subscriptionItems: SubscriptionItem[]
    paid: boolean

    constructor(data: GroupType) {
        super(data)
        this.groupId = data.groupId ? data.groupId : ''
        this.groupName = data.groupName ? data.groupName : ''
        this.sudo = data.sudo ? data.sudo : ''
        this.sectionId = data.sectionId ? uniqueArr(data.sectionId) : []
        this.subjectId = data.subjectId ? uniqueArr(data.subjectId) : []
        this.accredited = data.accredited ? data.accredited : ''
        this.city = data.city ? data.city : ''
        this.fullLocation = data.fullLocation ? data.fullLocation : ''
        this.sinceDate = data.sinceDate ? data.sinceDate : 0
        this.requests = data.requests ? uniqueArr(data.requests) : []
        this.groupRequests = data.groupRequests ? uniqueArr(data.groupRequests) : []
        this.blacklist = data.blacklist ? uniqueArr(data.blacklist) : []
        this.currentStorage = data.currentStorage ? data.currentStorage : 0
        this.tierId = data.tierId ? data.tierId : ''
        this.subscriptionStatus = data.subscriptionStatus ? data.subscriptionStatus : 'active'
        this.subscriptionItems = data.subscriptionItems ? data.subscriptionItems : []
        this.paid = data.paid ? true : false
    }

    get(): GroupInterface {
        return {
            ...super.get(),
            groupId: this.groupId,
            groupName: this.groupName,
            sudo: this.sudo,
            sectionId: this.sectionId,
            subjectId: this.subjectId,
            accredited: this.accredited,
            city: this.city,
            fullLocation: this.fullLocation,
            sinceDate: this.sinceDate,
            requests: this.requests,
            groupRequests: this.groupRequests,
            blacklist: this.blacklist,
            currentStorage: this.currentStorage,
            tierId: this.tierId,
            subscriptionStatus: this.subscriptionStatus,
            subscriptionItems: this.subscriptionItems,
            paid: this.paid
        }
    }

}