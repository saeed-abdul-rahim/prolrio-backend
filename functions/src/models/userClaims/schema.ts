import { Role } from "../common/schema"

export interface CustomClaimsInterface {
    groupId: string
    role: Role,
    sudo: boolean
}

export interface AllCustomClaimsInterface {
    claims: CustomClaimsInterface[]
}

export type CustomClaimsType = {
    groupId: string,
    role: Role,
    sudo?: boolean
}

export class CustomClaims implements CustomClaimsInterface {
    groupId: string
    role: Role
    sudo: boolean

    constructor(data: CustomClaimsType) {
        this.groupId = data.groupId
        this.role = data.role
        this.sudo = data.sudo ? true : false
    }

    get(): CustomClaimsInterface {
        return {
            groupId: this.groupId,
            role: this.role,
            sudo: this.sudo
        }
    }
}