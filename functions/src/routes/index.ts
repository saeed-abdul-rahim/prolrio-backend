import { Application } from 'express'

import { userHandler } from './user'
import { groupHandler } from './group'
import { sectionHandler } from './section'
import { subjectHandler } from './subject'
import { entityHandler } from './entity'
import { webhookHandler } from './hook'
// import { tierHandler } from './tier'

export function routes(app: Application) {
    userHandler(app)
    groupHandler(app)
    sectionHandler(app)
    subjectHandler(app)
    entityHandler(app)
    webhookHandler(app)
    // tierHandler(app)
}
