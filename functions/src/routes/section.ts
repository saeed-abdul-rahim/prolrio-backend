import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import {
    create,
    addUser,
    updateName,
    removeUser,
    remove
} from '../controllers/section'
import routes from '../config/routes'

export function sectionHandler(app: Application) {

    const sectionRoute = routes.section

    app.post(sectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        create
    )
    app.post(`${sectionRoute}/user`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        addUser
    )

    app.patch(`${sectionRoute}/name`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        updateName
    )

    app.delete(`${sectionRoute}/:sectionId/user/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        removeUser
    )
    app.delete(`${sectionRoute}/:sectionId`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        remove
    )
}