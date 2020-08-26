import { stripe } from '../../config'
import { StripeItem, StripeUsage, IdempotencyKeyType } from './schema'
import { UsageDataType, SubscriptionItem, SignInType } from '../common/schema'

export async function createStripeUser(firebaseUID: string, auth: SignInType) {
    try {
        const { email, phone } = auth
        const data = {
            email,
            phone,
            metadata: { firebaseUID }
        }
        return await stripe.customers.create(data)
    } catch (err) {
        throw err
    }
}

export async function getPaymentMethod(stripeId: string) {
    try {
        return await stripe.paymentMethods.list({
            customer: stripeId,
            type: 'card'
        })
    } catch (err) {
        throw err
    }
}

export async function getUpcomingInvoice(stripeId: string) {
    try {
        return await stripe.invoices.retrieveUpcoming({ customer: stripeId })
    } catch (err) {
        throw err
    }
}

export async function attachPayment(stripeId: string, paymentMethodId: string) {
    try {
        const pm =  await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeId })
        await stripe.customers.update(stripeId, {
            invoice_settings: {
                default_payment_method: pm.id
            }
        })
        return pm
    } catch (err) {
        throw err
    }
}

export async function detachPayment(paymentMethodId: string) {
    try {
        return await stripe.paymentMethods.detach(paymentMethodId)
    } catch (err) {
        throw err
    }
}

export async function createPaymentIntent(stripeId: string) {
    try {
        return await stripe.paymentIntents.create({
            amount: 100,
            currency: 'inr',
            customer: stripeId
        })
    } catch (err) {
        throw err
    }
}

export async function refundPaymentIntent(intentId: string) {
    try {
        return await stripe.refunds.create({
            payment_intent: intentId
        })
    } catch (err) {
        throw err
    }
}

export async function createSubscription(stripeId: string, items: StripeItem[]) {
    try {
        return await stripe.subscriptions.create({
            customer: stripeId,
            items
        })
    } catch (err) {
        throw err
    }
}

export async function cancelSubscription(subscriptionId: string) {
    try {
        return await stripe.subscriptions.del(subscriptionId)
    } catch (err) {
        throw err
    }
}

export function findSubscriptionItemId(type: UsageDataType, subscriptionItems: SubscriptionItem[]): string {
    try {
        const item = subscriptionItems.find(i => i.type === type)
        if (!item) throw new Error('Subscription Item not found')
        return item.itemId
    } catch (err) {
        throw err
    }
}

export async function createUsage(data: StripeUsage) {
    try {
        const { subscriptionItemId, idempotencyKey, quantity, action } = data
        const idKey = getIdempotencyKey(idempotencyKey, action)
        return await createUsageRecord(subscriptionItemId, quantity, idKey)
    } catch (err) {
        throw err
    }
}

export async function newUsage(subscriptionItemId: string, quantity: number, idempotencyKey: string) {
    try {
        return await createUsage({
            subscriptionItemId,
            quantity,
            idempotencyKey,
            action: 'create',
        })
    } catch (err) {
        throw err
    }
}

export async function updateUsage(subscriptionItemId: string, quantity: number, idempotencyKey: string) {
    try {
        const lastUsage = await getLastUsage(subscriptionItemId)
        const newQuantity = lastUsage + quantity
        return await createUsage({
            subscriptionItemId,
            quantity: newQuantity,
            idempotencyKey,
            action: 'update',
        })
    } catch (err) {
        throw err
    }
}

export async function removeUsage(subscriptionItemId: string, quantity: number, idempotencyKey: string) {
    try {
        const lastUsage = await getLastUsage(subscriptionItemId)
        if (lastUsage === 0) return
        let newQuantity = lastUsage - quantity
        if (newQuantity < 0) newQuantity = 0
        return await createUsage({
            subscriptionItemId,
            quantity: newQuantity,
            idempotencyKey,
            action: 'delete',
        })
    } catch (err) {
        throw err
    }
}

export async function getLastUsage(subscriptionItemId: string) {
    try {
        const itemData = await getLastUsageRecord(subscriptionItemId, 1)
        if (itemData.data.length === 0) return 0
        else return itemData.data[0].total_usage
    } catch (err) {
        throw err
    }
}

async function createUsageRecord(subscriptionItemId: string, quantity: number, idempotencyKey: string) {
    try {
        return await stripe.subscriptionItems.createUsageRecord(
            subscriptionItemId, {
                quantity,
                timestamp: Math.floor(Date.now() / 1000),
                action: 'set'
            }, {
                idempotencyKey
            }
        )
    } catch (err) {
        console.log(err.message)
        throw err
    }
}

async function getLastUsageRecord(subscriptionItemId: string, limit: number) {
    try {
        return await stripe.subscriptionItems.listUsageRecordSummaries(subscriptionItemId, { limit })
    } catch (err) {
        throw err
    }
}

function getIdempotencyKey(key: string, action: IdempotencyKeyType): string {
    return `${action}_${key}`
}
