import { getByStripeId, update as updateUser } from '../models/user'
import { update as updateGroup } from '../models/group'
import { update as updateMetadata } from '../models/metadata'
import Stripe from 'stripe'

export async function updateSubscriptionStatus(subscription: Stripe.Subscription) {
    try {
        const { customer, status } = subscription

        let customerId
        if (typeof(customer) !== 'string')
            customerId = customer.id
        else customerId = customer

        const user = await getByStripeId(customerId)
        const { sudo } = user
        const subStatus = { subscriptionStatus: status }
        await Promise.all(sudo.map(async grp => {
            await updateGroup({ groupId: grp, ...subStatus })
            await updateMetadata({ id: grp, ...subStatus })
        }))
        user.subscriptionStatus = status
        await updateUser(user)
    } catch (err) {
        throw err
    }
}
