import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import {
    signUp,
    create,
    request,
    updateRole,
    cancelRequest,
    acceptRequest,
    updateUser
} from '../controllers/user'
import {
    addPaymentMethod,
    removePaymentMethod,
    createSubscription,
    getPaymentMethod,
    getUpcomingInvoice,
    cancelSubscription,
    createPaymentIntent
} from '../controllers/payment'
import routes from '../config/routes'

export function userHandler(app: Application) {

    const userRoute = routes.user

    app.post(`${userRoute}/signUp`, signUp)
    app.post(userRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        create
    )
    app.post(`${userRoute}/request`,
        isAuthenticated,
        request
    )

    app.patch(`${userRoute}/request`,
        isAuthenticated,
        acceptRequest
    )

    app.patch(`${userRoute}/role`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        updateRole
    )

    app.patch(`${userRoute}/:id`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        updateUser
    )

    app.delete(`${userRoute}/request/:groupId`,
        isAuthenticated,
        cancelRequest
    )

    // Payment
    app.get(`${userRoute}/payment`,
        isAuthenticated,
        getPaymentMethod
    )
    app.get(`${userRoute}/invoice`,
        isAuthenticated,
        getUpcomingInvoice
    )
    app.post(`${userRoute}/payment/intent`,
        isAuthenticated,
        createPaymentIntent
    )
    app.post(`${userRoute}/payment`,
        isAuthenticated,
        addPaymentMethod
    )
    app.post(`${userRoute}/subscription`,
        isAuthenticated,
        createSubscription
    )
    app.delete(`${userRoute}/payment/:id`,
        isAuthenticated,
        removePaymentMethod
    )
    app.delete(`${userRoute}/subscription`,
        isAuthenticated,
        cancelSubscription
    )
}
