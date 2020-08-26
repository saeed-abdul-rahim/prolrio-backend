import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'

export type ContentType = 'video' | 'image' | 'document' | ''

export interface EntityInterface extends CommonInterface {
    groupId: string
    sectionIds: string[]
    subjectId: string
    entityId: string
    subjectName: string
    author: string
    divider: boolean
    title: string
    description: string
    duration: number
    contentLength: number
    contentProvider: string
    contentName: string
    contentUrl: string
    contentType: ContentType
    contentSize: number
    thumbnailName: string
    thumbnailImageUrl: string
    otherUrls: string[]
    order: number
}

export type EntityType = CommonType & {
    groupId: string
    sectionIds?: string[]
    subjectId: string
    entityId?: string
    subjectName: string
    author: string
    divider: boolean
    title: string
    description?: string
    duration?: number
    contentLength?: number
    contentName?: string
    contentProvider?: string
    contentUrl?: string
    contentType?: ContentType
    contentSize?: number
    thumbnailName?: string
    thumbnailImageUrl?: string
    otherUrls?: string[]
    order: number
}

export class Entity extends Common implements EntityInterface {
    groupId: string
    sectionIds: string[]
    subjectId: string
    entityId: string
    subjectName: string
    author: string
    divider: boolean
    title: string
    description: string
    duration: number
    contentLength: number
    contentName: string
    contentProvider: string
    contentUrl: string
    contentType: ContentType
    contentSize: number
    thumbnailName: string
    thumbnailImageUrl: string
    otherUrls: string[]
    order: number

    constructor(data: EntityType) {
        super(data)
        this.groupId = data.groupId
        this.sectionIds = data.sectionIds ? data.sectionIds : []
        this.subjectId = data.subjectId
        this.author = data.author
        this.subjectName = data.subjectName
        this.entityId = data.entityId ? data.entityId : ''
        this.divider = data.divider ? true : false
        this.title = data.title
        this.description = data.description ? data.description : ''
        this.duration = data.duration ? data.duration : 0
        this.contentLength = data.contentLength ? data.contentLength : 0
        this.contentName = data.contentName ? data.contentName : ''
        this.contentProvider = data.contentProvider ? data.contentProvider : ''
        this.contentUrl = data.contentUrl ? data.contentUrl : ''
        this.contentType = data.contentType ? data.contentType : ''
        this.contentSize = data.contentSize ? data.contentSize : 0
        this.thumbnailName = data.thumbnailName ? data.thumbnailName : ''
        this.thumbnailImageUrl = data.thumbnailImageUrl ? data.thumbnailImageUrl : ''
        this.otherUrls = data.otherUrls ? data.otherUrls : []
        this.order = data.order
    }

    get(): EntityInterface {
        return {
            ...super.get(),
            groupId: this.groupId,
            sectionIds: this.sectionIds,
            subjectId: this.subjectId,
            entityId: this.entityId,
            subjectName: this.subjectName,
            author: this.author,
            divider: this.divider,
            title: this.title,
            description: this.description,
            duration: this.duration,
            contentLength: this.contentLength,
            contentName: this.contentName,
            contentProvider: this.contentProvider,
            contentUrl: this.contentUrl,
            contentType: this.contentType,
            contentSize: this.contentSize,
            thumbnailName: this.thumbnailName,
            thumbnailImageUrl: this.thumbnailImageUrl,
            otherUrls: this.otherUrls,
            order: this.order
        }
    }
    
}