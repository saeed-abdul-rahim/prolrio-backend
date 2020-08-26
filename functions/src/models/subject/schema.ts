import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface SubjectInterface extends CommonInterface {
    groupId: string
    sectionId: string
    sectionIds: string[]
    subjectId: string
    subjectName: string
    entityId: string[]
}

export type SubjectType = CommonType & {
    groupId: string
    sectionId?: string
    sectionIds?: string[]
    subjectId?: string
    subjectName?: string
    entityId?: string[]
}

export class Subject extends Common implements SubjectInterface {
    groupId: string
    sectionId: string
    sectionIds: string[]
    subjectId: string
    subjectName: string
    entityId: string[]

    constructor(data: SubjectType) {
        super(data)
        this.groupId = data.groupId
        this.subjectId = data.subjectId ? data.subjectId : ''
        this.sectionId = data.sectionId ? data.sectionId : ''
        this.sectionIds = data.sectionIds ? uniqueArr(data.sectionIds) : []
        this.subjectName = data.subjectName ? data.subjectName : ''
        this.entityId = data.entityId ? uniqueArr(data.entityId) : []
    }

    get(): SubjectInterface {
        return {
            ...super.get(),
            groupId: this.groupId,
            sectionId: this.sectionId,
            sectionIds: this.sectionIds,
            subjectId: this.subjectId,
            subjectName: this.subjectName,
            entityId: this.entityId
        }
    }

}
