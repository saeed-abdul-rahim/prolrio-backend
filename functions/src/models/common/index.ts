import {
    Role,
    CommonInterface,
    CommonType,
    TimestampInterface,
    TimestampType,
    Status
} from './schema'
import { uniqueArr } from '../../utils/uniqueArr'

export const roles: Role[] = ['admin', 'provider', 'learner']

export class Timestamp implements TimestampInterface {
    createdAt: number
    updatedAt: number

    constructor(data: TimestampType) {
        this.createdAt = data.createdAt && data.createdAt !== 0 ? data.createdAt : Date.now()
        this.updatedAt = data.updatedAt && data.updatedAt !== 0 ? data.updatedAt : Date.now()
    }

    get(): TimestampInterface {
        return {
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

export class Common extends Timestamp implements CommonInterface {
    admin: string[]
    provider: string[]
    learner: string[]
    users: string[]
    status: Status

    constructor(data: CommonType) {
        super(data)
        this.admin = data.admin ? uniqueArr(data.admin) : []
        this.provider = data.provider ? uniqueArr(data.provider) : []
        this.learner = data.learner ? uniqueArr(data.learner) : []
        this.users = data.users ? uniqueArr(data.users) : []
        this.status = data.status ? data.status : 'active'
    }

    get(): CommonInterface {
        return {
            ...super.get(),
            admin: this.admin,
            provider: this.provider,
            learner: this.learner,
            users: this.users,
            status: this.status
        }
    }

}
