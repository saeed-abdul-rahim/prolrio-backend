import { TimestampInterface, TimestampType } from "../common/schema"
import { Timestamp } from "../common"

type Limit = {
    priceId: string
    allowed: number
    amount: number
}

type Amount = {
    month: number,
    year: number
}

export interface TierInterface extends TimestampInterface {
    tierId: string
    productId: string
    name: string
    user: Limit
    group: Limit
    section: Limit
    subject: Limit
    entity: Limit
    storage: Limit
    amount: Amount
    duration: number
    transactionReduction: number
}

export type TierType = TimestampType & {
    tierId?: string
    productId?: string
    name?: string
    user?: Limit
    group?: Limit
    section?: Limit
    subject?: Limit
    entity?: Limit
    storage?: Limit
    amount?: Amount
    duration?: number
    transactionReduction?: number
}

export class Tier extends Timestamp implements TierInterface {
    tierId: string
    productId: string
    name: string
    amount: Amount
    user: Limit
    group: Limit
    section: Limit
    subject: Limit
    entity: Limit
    storage: Limit
    duration: number
    transactionReduction: number

    constructor(data: TierType) {
        super(data)
        this.tierId = data.tierId ? data.tierId : ''
        this.productId = data.productId ? data.productId : ''
        this.name = data.name ? data.name : ''
        this.amount = this.setAmount(data.amount)
        this.user = this.setLimit(data.user)
        this.group = this.setLimit(data.group)
        this.section = this.setLimit(data.section)
        this.subject = this.setLimit(data.subject)
        this.entity = this.setLimit(data.entity)
        this.storage = this.setLimit(data.storage)
        this.duration = data.duration ? data.duration : -1
        this.transactionReduction = data.transactionReduction ? data.transactionReduction : 0
    }

    get(): TierInterface {
        return {
            ...super.get(),
            tierId: this.tierId,
            productId: this.productId,
            name: this.name,
            amount: this.amount,
            user: this.user,
            group: this.group,
            section: this.section,
            subject: this.subject,
            entity: this.entity,
            storage: this.storage,
            duration: this.duration,
            transactionReduction: this.transactionReduction
        }
    }

    setAmount(amount: Amount | undefined): Amount {
        if (amount) {
            let { month, year } = amount
            month = month ? month : 0
            year = year ? year : 0
            return { month, year }
        } else {
            return { month: 0, year: 0 }
        }
    }

    setLimit(limit: Limit | undefined): Limit {
        if (limit) {
            let { allowed, amount, priceId } = limit
            priceId = priceId ? priceId : ''
            allowed = allowed ? allowed : -1
            amount = amount ? amount : 0
            return { priceId, allowed, amount }
        } else {
            return { priceId: '', allowed: -1, amount: 0 }
        }
    }
}