import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import {
    create,
    acceptRequest,
    updateGroupName,
    cancelRequest,
    removeUser,
    remove
} from '../controllers/group'
import routes from '../config/routes'

export function groupHandler(app: Application) {

    const groupRoute = routes.group

    app.post(groupRoute, isAuthenticated, create)

    app.patch(`${groupRoute}/request`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        acceptRequest
    )
    app.patch(groupRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        updateGroupName
    )

    app.delete(`${groupRoute}/request/:userId`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        cancelRequest
    )
    app.delete(`${groupRoute}/:groupId/user/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
        removeUser
    )
    app.delete(`${groupRoute}/:groupId`,
        isAuthenticated,
        remove
    )
}