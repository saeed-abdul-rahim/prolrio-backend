import { Application, Request, Response } from 'express'
import { addCard } from '../hooks/payment'
import { updateSubscriptionStatus } from '../hooks/subscription'
import { paymentFailed } from '../hooks/invoice'
import { badRequest } from '../responseHandler/errorHandler'
import { stripeSuccess } from '../responseHandler/successHandler'
import routes from '../config/routes'

export function webhookHandler(app: Application) {

    const { webhook } = routes

    app.post(webhook,
        async (req: Request, res: Response) => {
            try {
                const { type, data } = req.body
                const { object } = data
                switch(type) {
                    case 'payment_intent.succeeded':
                        await addCard(object)
                        break
                    case 'customer.subscription.updated':
                        await updateSubscriptionStatus(object)
                        break
                    case 'invoice.payment_action_required':
                        await paymentFailed(object)
                        break
                    case 'invoice.payment_failed':
                        await paymentFailed(object)
                        break
                    default:
                        return res.status(400)
                }
                return stripeSuccess(res)
            } catch (err) {
                return badRequest(res, err)
            }
        }
    )
    
}
