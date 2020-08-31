import { TimestampType } from "../common/schema"
import { Timestamp } from "../common"

export type IdempotencyKeyType = 'create' | 'update' | 'delete'

export type StripeUsage = {
    subscriptionItemId: string,
    idempotencyKey: string,
    quantity: number,
    action: IdempotencyKeyType
}

export type StripeItem = {
    price: string,
    quantity?: number
}

export type QueryType = 'groupId' | 'productId' | 'priceId'

export type GroupPriceInterface = TimestampType & {
    groupId: string
    productId: string
    priceId: string
}

export class GroupPrice extends Timestamp implements GroupPriceInterface {
    groupId: string
    productId: string
    priceId: string

    constructor(data: GroupPriceInterface) {
        super(data)
        this.groupId = data.groupId
        this.productId = data.productId
        this.priceId = data.priceId
    }

    get(): GroupPriceInterface {
        return {
            ...super.get(),
            groupId: this.groupId,
            productId: this.productId,
            priceId: this.priceId
        }

    }
}