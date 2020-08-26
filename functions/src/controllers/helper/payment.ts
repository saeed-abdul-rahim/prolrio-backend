import {
    findSubscriptionItemId,
    updateUsage,
    removeUsage,
    newUsage
} from '../../models/payment'
import { UsageDataType } from '../../models/common/schema'
import { IdempotencyKeyType } from '../../models/payment/schema'
import { GroupInterface } from '../../models/group/schema'
import { UserInterface } from '../../models/user/schema'

type PaymentUsage = {
    data: GroupInterface | UserInterface
    type: UsageDataType
    action: IdempotencyKeyType
    idempotencyKey: string
    quantity: number
}

export async function paymentUsage(payment: PaymentUsage) {
    const { data, type, action, idempotencyKey, quantity } = payment
    const { tierId, subscriptionItems, subscriptionStatus } = data
    if (tierId !== 'free' && subscriptionStatus === 'active') {
        const subscriptionItemId = findSubscriptionItemId(type, subscriptionItems)
        const key = subscriptionItemId + idempotencyKey
        switch (action) {
            case 'create': return await newUsage(subscriptionItemId, quantity, key)
            case 'update': return await updateUsage(subscriptionItemId, quantity, key)
            case 'delete': return await removeUsage(subscriptionItemId, quantity, key)
        }
    }
    return
}
