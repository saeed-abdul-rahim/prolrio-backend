import { Response } from 'express'
import { getSuccessResponse } from './responseData';

function success(res: Response, data: any) {
    return res.status(200).send(getSuccessResponse(data))
}

export function successResponse(res: Response, data: any) {
    return success(res, data);
}

export function successUpdated(res: Response) {
    return success(res, 'Updated Successfully')
}

export function successCreated(res: Response) {
    return success(res, 'Created Successfully')
}

export function stripeSuccess(res: Response) {
    return res.status(200).send({ received: true })
}