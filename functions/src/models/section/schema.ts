import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface SectionInterface extends CommonInterface {
    groupId: string
    sectionId: string
    parentId: string
    parentIds: string[]
    childIds: string[]
    sectionName: string
    subjectId: string[]
}

export type SectionType = CommonType & {
    groupId: string
    sectionId?: string
    parentId?: string
    parentIds?: string[]
    childIds?: string[]
    sectionName?: string
    subjectId?: string[]
}

export class Section extends Common implements SectionInterface {
    groupId: string
    sectionId: string
    parentId: string
    parentIds: string[]
    childIds: string[]
    sectionName: string
    subjectId: string[]

    constructor(data: SectionType) {
        super(data)
        this.groupId = data.groupId
        this.sectionId = data.sectionId ? data.sectionId : ''
        this.parentId = data.parentId ? data.parentId : ''
        this.parentIds = data.parentIds ? uniqueArr(data.parentIds) : []
        this.childIds = data.childIds ? uniqueArr(data.childIds) : []
        this.sectionName = data.sectionName ? data.sectionName : ''
        this.subjectId = data.subjectId ? uniqueArr(data.subjectId) : []
    }

    get(): SectionInterface {
        return {
            ...super.get(),
            groupId: this.groupId,
            sectionId: this.sectionId,
            parentId: this.parentId,
            parentIds: this.parentIds,
            childIds: this.childIds,
            sectionName: this.sectionName,
            subjectId: this.subjectId
        }
    }

}
