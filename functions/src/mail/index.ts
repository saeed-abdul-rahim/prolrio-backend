import { gmail, clientId, clientSecret, refreshToken, accessToken } from '../config'
import { createTransport } from 'nodemailer'

const mailTransport = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: gmail,
    clientId,
    clientSecret,
    refreshToken,
    accessToken
  },
})

export async function sendMail(options: {}) {
  try {
    await mailTransport.verify()
    return await mailTransport.sendMail({ from: 'noreply@prolr.io', ...options })
  } catch (err) {
    throw err
  }
}
