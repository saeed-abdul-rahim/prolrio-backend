import * as functions from 'firebase-functions'
import Stripe from 'stripe'

export const title = 'PROLR'
export const url = {
    base: 'https://prolrio-dev.web.app',
    support: '/support',
    home: '/console',
    logo: '/assets/icons/icon-72x72.png'
}
export const gmail = functions.config().gmail.email
export const clientId = functions.config().service.id
export const clientSecret = functions.config().service.secret
export const refreshToken = functions.config().service.refresh
export const accessToken = functions.config().service.access

export const stripe = new Stripe(
    functions.config().stripe.secret, 
    { apiVersion: '2020-03-02' }
)
