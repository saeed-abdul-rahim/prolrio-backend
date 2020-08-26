import { sendMail } from '../../mail'
import { gmail } from '../../config'

export const sendSupportMessage = async (snap: any) => {
    try {
        const data = snap.data()
        const mailOptions = {
            to: gmail,
            subject: `Support email by ${data.name}`,
            html: data.html
        }
        await sendMail(mailOptions)
    } catch (err) {
        console.log(err)
    }
}
