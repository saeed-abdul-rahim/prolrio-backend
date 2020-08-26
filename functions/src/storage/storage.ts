import * as admin from 'firebase-admin'

const bucket = admin.storage().bucket()

export async function removeFile(contentName: string, contentType: string, groupId: string) {
    try {
        const file = bucket.file(`${groupId}/${contentType}/${contentName}`)
        await file.delete()
    } catch (err) {
        throw err
    }
}
