import { TimestampInterface, TimestampType } from "../common/schema"
import { Timestamp } from "../common"

type CollectionType = 'group' | 'section' | 'subject' | 'entity' | 'user'

export interface MetadataInterface extends TimestampInterface {
    id: string
    name: string
    type: CollectionType
    email: string
    phone: string
    description?: string
    subscriptionStatus?: string
    paid: boolean
}

export type MetadataType = TimestampType & {
    id: string
    name?: string
    type?: CollectionType
    email?: string
    phone?: string
    description?: string
    subscriptionStatus?: string
    paid?: boolean
}

export class Metadata extends Timestamp implements MetadataInterface {
    id: string
    name: string
    type: CollectionType
    description: string
    email: string
    phone: string
    subscriptionStatus: string
    paid: boolean

    constructor(data: MetadataInterface) {
        super(data)
        this.id = data.id
        this.name = data.name
        this.type = data.type
        this.email = data.email ? data.email : ''
        this.phone = data.phone ? data.phone : ''
        this.description = data.description ? data.description : ''
        this.subscriptionStatus = data.subscriptionStatus ? data.subscriptionStatus : ''
        this.paid = data.paid ? true : false
    }

    get(): MetadataInterface {
        const data: MetadataInterface = {
            ...super.get(),
            id: this.id,
            name: this.name,
            type: this.type,
            email: this.email,
            phone: this.phone,
            paid: this.paid
        }
        if (this.description) data.description = this.description
        if (this.subscriptionStatus) data.subscriptionStatus = this.subscriptionStatus
        return data
    }
}