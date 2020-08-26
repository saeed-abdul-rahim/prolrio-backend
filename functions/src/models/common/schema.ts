import Stripe from "stripe"

export type Role = 'admin' | 'provider' | 'learner'
export type Status = 'active' | 'inactive'

export type SignInType = {
    email?: string
    phone?: string
}

export type TimestampType = {
    createdAt?: number
    updatedAt?: number
}

export interface TimestampInterface {
    createdAt?: number
    updatedAt?: number
}

export type AuthType = {
    [key in Role]?: string[]
};

export type AuthTypeImp = {
    [key in Role]: string[]
};

export type CommonType = AuthType & TimestampType & {
    users?: string[]
    status?: Status
}

export interface CommonInterface extends AuthTypeImp, TimestampInterface {
    users: string[]
    status: Status
}

export type SubscriptionItem = {
    itemId: string
    priceId: string
    type: string
}

export type SubscriptionStatus = Stripe.Subscription.Status

export type UsageDataType = 'group' | 'user' | 'section' | 'subject' | 'storage'

export type Usage = {
    [key in UsageDataType]: number
}
