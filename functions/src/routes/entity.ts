import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import {
    create,
    updateEntities,
    updateTitleDesc,
    remove,
    sendContentMessage
} from '../controllers/entity'
import routes from '../config/routes'

export function entityHandler(app: Application) {

    const entityRoute = routes.entity

    app.post(entityRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'provider']}),
        create
    )

    app.post(`${entityRoute}/:id/message`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'provider']}),
        sendContentMessage
    )

    app.patch(`${entityRoute}/all`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'provider']}),
        updateEntities
    )
    app.patch(`${entityRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'provider']}),
        updateTitleDesc
    )

    app.delete(`${entityRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'provider']}),
        remove
    )
}