import { getByStripeId, addPayment } from '../models/user'
import { attachPayment, detachPayment, refundPaymentIntent } from '../models/payment'
import Stripe from 'stripe'

export async function addCard(intent: Stripe.PaymentIntent) {
    try {
        const { customer, payment_method, id } = intent

        if (!customer || !payment_method)
            throw new Error('Request not processable')

        let customerId
        let paymentMethodId

        if (typeof(customer) !== 'string')
            customerId = customer.id
        else customerId = customer

        if (typeof(payment_method) !== 'string')
            paymentMethodId = payment_method.id
        else paymentMethodId = payment_method

        const userData = await getByStripeId(customerId)
        const { paymentMethodId: userPaymentMethodId } = userData

        // Card added for first time or card change

        if (userPaymentMethodId && userPaymentMethodId !== paymentMethodId) {
            await detachPayment(userPaymentMethodId)
        }

        if (!userPaymentMethodId || (userPaymentMethodId && userPaymentMethodId !== paymentMethodId)) {
            await refundPaymentIntent(id)
            const source = await attachPayment(customerId, paymentMethodId)
            await addPayment(userData, source.id)
        }
    } catch (err) {
        throw err
    }
}
