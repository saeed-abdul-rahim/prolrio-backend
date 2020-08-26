import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import {
    create,
    addUser,
    updateName,
    remove,
    removeUser
} from '../controllers/subject'
import routes from '../config/routes'

export function subjectHandler(app: Application) {

    const subjectRoute = routes.subject

    app.post(subjectRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        create
    )
    app.post(`${subjectRoute}/user`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        addUser
    )

    app.patch(`${subjectRoute}/name`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        updateName
    )

    app.delete(`${subjectRoute}/:subjectId/user/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        removeUser
    )
    app.delete(`${subjectRoute}/:subjectId`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        remove
    )
}