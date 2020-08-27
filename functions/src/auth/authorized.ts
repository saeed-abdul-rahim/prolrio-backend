import { Request, Response } from "express";
import * as group from "../models/group"
import { Role } from '../models/common/schema'
import { forbidden } from '../responseHandler/errorHandler';

export function isAuthorized(opts: { hasRole?: Array<Role>, allowSameUser?: boolean }) {
   return async (req: Request, res: Response, next: Function) => {
        const { claims, uid } = res.locals
        const { id } = req.params
        const { groupid } = req.headers
        res.locals = { ...res.locals, groupId: groupid }
        if (opts.allowSameUser && id && uid === id)
            return next();
        else if (!claims)
            return forbidden(res);
        else if(!groupid)
            return forbidden(res);
        else if (groupid && typeof groupid === "string" && opts.hasRole) {
            const groupData = await group.get(groupid)
            opts.hasRole.map(role => {
                if (groupData[role].includes(uid)) {
                    res.locals = { ...res.locals, role, groupData }
                    return next();
                }
            })
        } else return forbidden(res)
   }
}