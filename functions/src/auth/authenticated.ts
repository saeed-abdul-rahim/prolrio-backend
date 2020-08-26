import { Request, Response } from "express";
import * as admin from 'firebase-admin'
import * as claims from '../models/userClaims'
import { unauthorized } from '../responseHandler/errorHandler';

export async function isAuthenticated(req: Request, res: Response, next: Function) {
   const { authorization } = req.headers

   if (!authorization)
       return unauthorized(res)
    else if (!authorization.startsWith('Bearer'))
        return unauthorized(res)
    else {
        const split = authorization.split('Bearer ')
        if (split.length !== 2)
            return unauthorized(res)
        else {
            const token = split[1]
            try {
                const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);
                const userData = await claims.get(decodedToken.uid)
                res.locals = { ...res.locals, uid: decodedToken.uid, claims: userData.customClaims, email: decodedToken.email }
                return next();
            }
            catch (err) {
                console.error(`${err.code} -  ${err.message}`)
                return unauthorized(res)
            }
        }
    }

}