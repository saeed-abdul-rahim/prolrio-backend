import { Request, Response } from 'express'
import * as tier from '../../models/tier'
import { serverError } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated } from '../../responseHandler/successHandler';
import { TierInterface } from '../../models/tier/schema';

export async function create(req: Request, res: Response) {
    try {
        const { data }: { data: TierInterface } = req.body
        const { tierId } = data
        await tier.add(tierId, data)
        return successCreated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { data: TierInterface } = req.body
        const { tierId } = data
        await tier.update(tierId, data)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id } = req.body
        await tier.remove(id)
        return successUpdated(res)
    } catch (err) {
        console.log(err)
        return serverError(res, err)
    }
}
