import { CommonInterface, CommonType, SubscriptionItem, SubscriptionStatus } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

type Gender = 'Male' | 'Female' | 'Transgender' | ''

export interface UserInterface extends CommonInterface {
    uid: string
    name: string
    email: string
    phone: string
    dob: string
    gender: Gender
    photoUrl: string
    online: boolean
    lastSeen: number
    stripeId: string
    sudo: string[]
    groupId: string[]
    sectionId: string[]
    subjectId: string[]
    entityId: string[]
    requests: string[]
    groupRequests: string[]
    tierId: string
    subscriptionId: string
    subscriptionStatus: SubscriptionStatus
    subscriptionItems: SubscriptionItem[]
    paymentMethodId: string
    groupSubscriptions: string[]
}

export type UserType = CommonType & {
    uid?: string
    name?: string
    email?: string
    phone?: string
    dob?: string
    gender?: Gender
    photoUrl?: string
    online?: boolean
    lastSeen?: number
    stripeId?: string
    sudo?: string[]
    groupId?: string[]
    sectionId?: string[]
    subjectId?: string[]
    entityId?: string[]
    requests?: string[]
    groupRequests?: string[]
    tierId?: string
    subscriptionId?: string
    subscriptionStatus?: SubscriptionStatus
    subscriptionItems?: SubscriptionItem[]
    paymentMethodId?: string
    groupSubscriptions?: string[]
}

export class User extends Common implements UserInterface {
    uid: string
    name: string
    email: string
    phone: string
    dob: string
    gender: Gender
    photoUrl: string
    online: boolean
    lastSeen: number
    stripeId: string
    sudo: string[]
    groupId: string[]
    sectionId: string[]
    subjectId: string[]
    entityId: string[]
    requests: string[]
    groupRequests: string[]
    tierId: string
    subscriptionId: string
    subscriptionStatus: SubscriptionStatus
    subscriptionItems: SubscriptionItem[]
    paymentMethodId: string
    groupSubscriptions: string[]

    constructor(data: UserType) {
        super(data)
        this.uid = data.uid ? data.uid : ''
        this.name = data.name ? data.name : ''
        this.email = data.email ? data.email : ''
        this.phone = data.phone ? data.phone : ''
        this.dob = data.dob ? data.dob : ''
        this.gender = data.gender ? data.gender : ''
        this.photoUrl = data.photoUrl ? data.photoUrl : ''
        this.online = data.online ? true : false
        this.lastSeen = data.lastSeen ? data.lastSeen : 0
        this.stripeId = data.stripeId ? data.stripeId : ''
        this.sudo = data.sudo ? uniqueArr(data.sudo) : []
        this.groupId = data.groupId ? uniqueArr(data.groupId) : []
        this.sectionId = data.sectionId ? uniqueArr(data.sectionId) : []
        this.subjectId = data.subjectId ? uniqueArr(data.subjectId) : []
        this.entityId = data.entityId ? uniqueArr(data.entityId) : []
        this.requests = data.requests ? uniqueArr(data.requests) : []
        this.groupRequests = data.groupRequests ? uniqueArr(data.groupRequests) : []
        this.tierId = data.tierId ? data.tierId : ''
        this.subscriptionId = data.subscriptionId ? data.subscriptionId : ''
        this.subscriptionStatus = data.subscriptionStatus ? data.subscriptionStatus : 'active'
        this.subscriptionItems = data.subscriptionItems ? data.subscriptionItems : []
        this.paymentMethodId = data.paymentMethodId ? data.paymentMethodId : ''
        this.groupSubscriptions = data.groupSubscriptions ? uniqueArr(data.groupSubscriptions) : []
    }

    get(): UserInterface {
        return {
            ...super.get(),
            uid: this.uid,
            name: this.name,
            email: this.email,
            phone: this.phone,
            dob: this.dob,
            gender: this.gender,
            photoUrl: this.photoUrl,
            online: this.online,
            lastSeen: this.lastSeen,
            stripeId: this.stripeId,
            sudo: this.sudo,
            groupId: this.groupId,
            sectionId: this.sectionId,
            subjectId: this.subjectId,
            entityId: this.entityId,
            requests: this.requests,
            groupRequests: this.groupRequests,
            tierId: this.tierId,
            subscriptionId: this.subscriptionId,
            subscriptionStatus: this.subscriptionStatus,
            subscriptionItems: this.subscriptionItems,
            paymentMethodId: this.paymentMethodId,
            groupSubscriptions: this.groupSubscriptions
        }
    }

}
