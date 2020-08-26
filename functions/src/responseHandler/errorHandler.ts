import { Response } from 'express'
import { getErrorResponse } from './responseData';

export function serverError(res: Response, err: any) {
    return res.status(500).send(getErrorResponse(`${err.code} - ${err.message}`))
}

export function badRequest(res: Response, message: any) {
    return res.status(400).send(getErrorResponse(message))
}

export function notAllowed(res: Response, message: any) {
    return res.status(405).send(getErrorResponse(message))
}

export function nothingFound(res: Response) {
    return res.status(404).send(getErrorResponse('Nothing found'))
}

export function unauthorized(res: Response) {
    return res.status(401).send(getErrorResponse('Unauthorized'))
}

export function forbidden(res: Response) {
    return res.status(403).send(getErrorResponse('Forbidden'))
}

export function limitExceeded(res: Response) {
    return res.status(403).send(getErrorResponse('Limit Exceeded'))
}

export function tierExpired(res: Response, message: string) {
    return res.status(403).send(getErrorResponse(`Tier Inactive. Subscription Status: ${message}`))
}
