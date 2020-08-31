import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

export type ProductType = {
    productId: string
    priceId: string
    amount: number
    recurring: boolean
}

export interface EarningInterface extends TimestampInterface, ProductType {
    groupId: string
    currentEarning: number
}

export type EarningType = TimestampType & ProductType & {
    groupId: string
    currentEarning?: number
}

export class Earning extends Timestamp implements EarningInterface {
    groupId: string
    currentEarning: number
    productId: string
    priceId: string
    amount: number
    recurring: boolean

    constructor(data: EarningType) {
        super(data)
        this.groupId = data.groupId
        this.currentEarning = data.currentEarning ? data.currentEarning : 0
        this.productId = data.productId ? data.productId : ''
        this.priceId = data.priceId ? data.priceId : ''
        this.amount = data.amount ? data.amount : 0
        this.recurring = data.recurring ? true : false
    }

    get(): EarningInterface {
        return {
            ...super.get(),
            groupId: this.groupId,
            currentEarning: this.currentEarning,
            productId: this.productId,
            priceId: this.priceId,
            amount: this.amount,
            recurring: this.recurring
        }
    }

}