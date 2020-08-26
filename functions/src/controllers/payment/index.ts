import { Request, Response } from 'express'
import addObjArr from '../../utils/addObjArr'
import * as user from '../../models/user'
import * as tier from '../../models/tier'
import * as group from '../../models/group'
import * as metadata from '../../models/metadata'
import * as payment from '../../models/payment'
import { serverError, badRequest, nothingFound } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated, successResponse } from '../../responseHandler/successHandler'
import { getSubWherePropertyExists } from '../../utils/getSubWherePropertyExists'
import { isDefined } from '../../utils/isDefined'
import { UsageDataType, Usage } from '../../models/common/schema'
import Stripe from 'stripe'

export async function createPaymentIntent(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const userData = await user.get(uid)
        const { stripeId } = userData
        const { client_secret } = await payment.createPaymentIntent(stripeId)
        return successResponse(res, { secret: client_secret })
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function getPaymentMethod(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const userData = await user.get(uid)
        const { stripeId, paymentMethodId } = userData
        if (!paymentMethodId)
            return nothingFound(res)
        const paymentMethod = await payment.getPaymentMethod(stripeId)
        return successResponse(res, paymentMethod)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function addPaymentMethod(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { token } = req.body
        if (!token)
            return badRequest(res, 'Token required')
        const userData = await user.get(uid)
        const { stripeId } = userData
        const source = await payment.attachPayment(stripeId, token)
        await user.addPayment(userData, source.id)
        return successCreated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function removePaymentMethod(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { id } = req.params
        if (!id)
            return badRequest(res, 'SourceId required')
        const userData = await user.get(uid)
        const { paymentMethodId, tierId } = userData
        if (paymentMethodId && tierId !== 'free')
            return badRequest(res, 'Switch to free tier to delete card')
        await payment.detachPayment(id)
        await user.removePayment(userData, id)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function getUpcomingInvoice(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const userData = await user.get(uid)
        const { stripeId } = userData
        const invoice = await payment.getUpcomingInvoice(stripeId)
        const { amount_due, lines } = invoice
        const { data } = lines
        const invoiceItems = data.map(d => {
            return {
                amount: d.amount,
                quantity: d.quantity,
                description: d.description,
            }
        })
        const upcomingInvoice = {
            amount: amount_due,
            items: invoiceItems
        }
        return successResponse(res, upcomingInvoice)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function createSubscription(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { tierId } = req.body
        if (!tierId)
            return badRequest(res, 'ID and token required')
        const userData = await user.get(uid)
        const tierData = await tier.get(tierId)
        const allGroups = await group.getAll(userData.sudo)

        // Setup price for stripe
        const priceId = 'priceId'
        const tierPriceId = getSubWherePropertyExists(tierData as any, priceId)
        const priceIds = Object.keys(tierPriceId).map(tpId => {
            const pid = tierPriceId[tpId][priceId]
            return { price: pid }
        }).filter(isDefined).filter(p => p.price)
        if (priceIds.length === 0)
            return badRequest(res, 'Nothing to subscribe to')

        // Create subscription and format for saving in db
        const { stripeId } = userData
        const subscriptionStatus = 'active'
        const subscription = await payment.createSubscription(stripeId, priceIds)
        const subscriptionItems = subscription.items.data.map(subItems => {
            const type = Object.keys(tierPriceId).map(key => tierPriceId[key][priceId] === subItems.price.id ? key : '').filter(p => p)[0]
            return {
                itemId: subItems.id,
                priceId: subItems.price.id,
                type
            }
        })

        // If any usage exist: update usage in stripe
        if (allGroups.length > 0) {
            await Promise.all(allGroups.map(async grp => {
                await group.updateSubscription(grp, tierId, subscriptionItems, subscriptionStatus)
                const { groupId } = grp
                await metadata.update({ id: groupId, subscriptionStatus })
            }))
            const allGroupsUsage = allGroups.map(grp => group.getUsage(grp))
            const totalUsage = addObjArr(allGroupsUsage) as Usage
            await Promise.all(Object.keys(totalUsage).map(async tu => {
                const type = tu as UsageDataType
                const subscriptionItemId = payment.findSubscriptionItemId(type, subscriptionItems)
                const idempotencyKey = subscriptionItemId
                await payment.newUsage(subscriptionItemId, totalUsage[type], idempotencyKey)
            }))
        }

        await user.updateSubscription(userData, tierId, subscription.id, subscriptionItems, subscriptionStatus)

        return successResponse(res, subscription)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function cancelSubscription(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const userData = await user.get(uid)
        const { subscriptionId, stripeId, sudo } = userData
        const invoice = await payment.getUpcomingInvoice(stripeId)
        const { amount_due } = invoice
        if (amount_due > 0)
            return badRequest(res, 'You need to clear the bill first, Try removing groups, subjects etc.')
        await payment.cancelSubscription(subscriptionId)
        const subscriptionStatus: Stripe.Subscription.Status = 'active'
        const updateData = {
            tierId: 'free',
            subscriptionStatus,
            subscriptionItems: []
        }
        await Promise.all(sudo.map(async groupId => {
            await group.update({ groupId, ...updateData })
            await metadata.update({ id: groupId, subscriptionStatus })
        }))
        await user.update({ ...userData, ...updateData, subscriptionId: '' })
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}