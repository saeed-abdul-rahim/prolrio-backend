import * as user from '../models/user'
import * as group from '../models/group'
import * as tier from '../models/tier'
import * as metadata from '../models/metadata'
import * as payment from '../models/payment'
import * as earning from '../models/earning'
import * as groupController from '../controllers/group'
import Stripe from 'stripe'

export async function updateSubscriptionStatus(subscription: Stripe.Subscription) {
    try {
        const { customer, status, id, items } = subscription

        let customerId
        if (typeof(customer) !== 'string')
            customerId = customer.id
        else customerId = customer

        const userData = await user.getByStripeId(customerId)
        const { uid, sudo, subscriptionId, groupSubscriptions } = userData

        if (id === subscriptionId) {
            const subStatus = { subscriptionStatus: status }
            await Promise.all(sudo.map(async grp => {
                await group.update({ groupId: grp, ...subStatus })
                await metadata.update({ id: grp, ...subStatus })
            }))
            userData.subscriptionStatus = status
            await user.update(userData)
        } else if (groupSubscriptions && groupSubscriptions.includes(id)) {
            const { data } = items
            data.forEach(async item => {
                const { price } = item
                const { unit_amount } = price
                const priceData = await payment.getPrice(price.id)
                const { groupId } = priceData
                if (status === 'active') {
                    const groupData = await group.get(groupId)
                    const earningData = await earning.get(groupId)
                    const { tierId } = groupData
                    const tierData = await tier.get(tierId)
                    const { transactionReduction } = tierData
                    if (transactionReduction && unit_amount && transactionReduction > 0 && unit_amount > 0) {
                        const value = unit_amount * transactionReduction
                        earningData.currentEarning += value
                        await earning.update(earningData)
                    }
                } else if (status === 'unpaid') {
                    await groupController.removeUserFromGroup(uid, groupId)
                }
            })
        }
    } catch (err) {
        throw err
    }
}
