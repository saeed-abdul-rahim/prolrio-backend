import { Application } from 'express'

import {
    create,
    update,
    remove
} from '../controllers/tier'
import routes from '../config/routes'

export function tierHandler(app: Application) {

    const tierRoute = routes.tier

    app.post(tierRoute, create)
    app.patch(tierRoute, update)
    app.delete(tierRoute, remove)
}