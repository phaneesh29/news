import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

export const sendEmail = async ({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) => {
  try {
    const data = await resend.emails.send({
      from: 'verify@tsindia.org',
      to,
      subject,
      html: html || '',
      text: text || ''
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
