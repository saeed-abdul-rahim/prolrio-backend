export function mailOptions(to: string, subject: string, html: string) {
    return { to, subject, html };
}