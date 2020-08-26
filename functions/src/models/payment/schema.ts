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
