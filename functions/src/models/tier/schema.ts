type Limit = {
    priceId: string
    allowed: number
    amount: number
}

type Amount = {
    month: number,
    year: number
}

export interface TierInterface {
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
    createdAt: number
    updatedAt: number
}

export type TierType = {
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
    createdAt?: number
    updatedAt?: number
}

export class Tier implements TierInterface {
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
    createdAt: number
    updatedAt: number

    constructor(data: TierType) {
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
        this.createdAt = data.createdAt && data.createdAt !== 0 ? data.createdAt : Date.now()
        this.updatedAt = data.updatedAt && data.updatedAt !== 0 ? data.updatedAt : Date.now()
    }

    get(): TierInterface {
        return {
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
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
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