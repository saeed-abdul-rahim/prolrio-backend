import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp();

import * as express from 'express'
import * as cors from 'cors'
import { routes } from './routes'

import { sendSupportMessage } from './controllers/support'
import { supportRoute, usersRoute } from './models/db';
import { ENTITIES } from './models/constants';
import { createEntityAnalytics } from './controllers/analytics';

const app = express()
app.use(express.json())
app.use(cors({ origin: true }))
routes(app)

export const support = functions.region('asia-east2').firestore
.document(`${supportRoute}/{addKey}`)
.onCreate(snap => {
    return sendSupportMessage(snap)
})

export const userEntityAnalytics = functions.region('asia-east2').firestore
.document(`${usersRoute}/{uid}/${ENTITIES}/{entityId}`)
.onWrite((change, context) => {
    const { params } = context
    const { uid, entityId } = params
    return createEntityAnalytics(change, uid, entityId)
})

export const api = functions.region('asia-east2').runWith({ memory: '1GB' }).https.onRequest(app)
