import { url, title } from '../../config'
import { mailOptions } from '../../mail/mailOptions'

export const actionCodeSettings = {
    url: `${url}/set-password`
}

export function newUserEmail(to: string, name: string) {
    return mailOptions(
        to,
        'Welcome!',
        welcome(name))
}

export function contentEmail(to: string, newContent: boolean = false, name: string, entityName: string, subjectName: string, entityImgUrl?: string, action?: string) {
    let subject
    if (newContent) {
        subject = `New content added in ${subjectName}`
    } else {
        subject = `Request from ${name}`
    }
    return mailOptions(
        to,
        subject,
        viewContent(newContent, name, entityName, subjectName, entityImgUrl, action)
    )
}

function welcome(name: string, from: 'group' | 'user' = 'group') {
    const { base, support, home } = url
    let content = ''
    let type = ''
    if (from === 'group') {
        type = 'invitation'
        content = `${name} has invited you to their institution. Just press the button below to see your pending invitation.`
    } else {
        type = 'request'
        content = `${name} has requested for joining your institution. Just press the button below to see your requests.`
    }
    return `
        <!-- THIS EMAIL WAS BUILT AND TESTED WITH LITMUS http://litmus.com -->
        <!-- IT WAS RELEASED UNDER THE MIT LICENSE https://opensource.org/licenses/MIT -->
        <!-- QUESTIONS? TWEET US @LITMUSAPP -->
        <!DOCTYPE html>
        <html>
        <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        ${setStyle()}
        </head>
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">

        <!-- HIDDEN PREHEADER TEXT -->
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            You have a new ${type} from ${name}!
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- LOGO -->
            <tr>
                <td bgcolor="#66BB7F" align="center">
                    ${getMailLogo()}
                </td>
            </tr>
            <!-- HERO -->
            <tr>
                <td bgcolor="#66BB7F" align="center" style="padding: 0px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                        <tr>
                            <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 0;">New Invitation</h1>
                            </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- COPY BLOCK -->
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                    <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                        <p style="margin: 0;">${content}</p>
                        </td>
                    </tr>
                    <!-- BULLETPROOF BUTTON -->
                    <tr>
                        <td bgcolor="#ffffff" align="left">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="border-radius: 3px;" bgcolor="#66BB7F"><a href="${base}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #66BB7F; display: inline-block;">Go to Console</a></td>
                                </tr>
                                </table>
                            </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                        <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                        </td>
                    </tr>
                    <!-- COPY -->
                        <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                            <p style="margin: 0;"><a href="${base + home}" target="_blank" style="color: #66BB7F;">${base + home}</a></p>
                        </td>
                        </tr>
                    <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                        <p style="margin: 0;">If you have any questions, just reply to this email???we're always happy to help out.</p>
                        </td>
                    </tr>
                    <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                        <p style="margin: 0;">Cheers,<br>${title} Team</p>
                        </td>
                    </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- SUPPORT CALLOUT -->
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                        <!-- HEADLINE -->
                        <tr>
                        <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                            <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                            <p style="margin: 0;"><a href="${base + support}" target="_blank" style="color: #66BB7F;">We&rsquo;re here, ready to talk</a></p>
                        </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- FOOTER -->
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                    <!-- NAVIGATION -->
                    <tr>
                        <td bgcolor="#f4f4f4" align="left" style="padding: 10px 10px 10px 10px;" >
                        <p style="margin: 0;">
                        </p>
                        </td>
                    </tr>
                    ${getFooter()}
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
        </table>
            
        </body>
        </html>
    `
}

function viewContent(newContent = false, name: string, entityName: string, subjectName: string, entityImgUrl?: string, action?: string) {
    const { base, support } = url
    let imgUrl = ''
    let heading = ''
    let content = ''
    if (entityImgUrl) {
        imgUrl = `
            <!-- VIDEO -->
            <tr>
                <td bgcolor="#ffffff" align="left" style="padding: 0px 0px 0px 0px;" >
                <a href="${base}" target="_blank">
                    <img alt="${entityName}" src="${entityImgUrl}" width="600" style="display: block; width: 100%; max-width: 100%; min-width: 100px; font-family: 'Lato', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px;" border="0">
                </a>
                </td>
            </tr>
        `
    }
    if (newContent) {
        heading = `New content added in ${subjectName}`
        content = `${entityName} has been added to ${subjectName}`
    } else {
        heading = `Request from ${name}`
        content = `Please ${action} ${entityName} in subject ${subjectName}`
    }
    return `
        <!-- THIS EMAIL WAS BUILT AND TESTED WITH LITMUS http://litmus.com -->
        <!-- IT WAS RELEASED UNDER THE MIT LICENSE https://opensource.org/licenses/MIT -->
        <!-- QUESTIONS? TWEET US @LITMUSAPP -->
        <!DOCTYPE html>
        <html>
        <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        ${setStyle()}
        </head>
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">

        <!-- HIDDEN PREHEADER TEXT -->
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            ${content}
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- LOGO -->
            <tr>
                <td bgcolor="#539be2" align="center">
                    ${getMailLogo()}
                </td>
            </tr>
            <!-- HERO -->
            <tr>
                <td bgcolor="#539be2" align="center" style="padding: 0px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                        <tr>
                            <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 0;">${heading}</h1>
                            </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- COPY BLOCK -->
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                    <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                        <p style="margin: 0;">${content}</p>
                        </td>
                    </tr>
                    ${imgUrl}
                    <!-- COPY -->
                    
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- SUPPORT CALLOUT -->
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                        <!-- HEADLINE -->
                        <tr>
                        <td bgcolor="#B3E5FC" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                            <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                            <p style="margin: 0;"><a href="${base + support}" target="_blank" style="color: #539be2;">We&rsquo;re here, ready to talk</a></p>
                        </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <!-- FOOTER -->
                    <tr>
                        <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                            <!--[if (gte mso 9)|(IE)]>
                            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                            <tr>
                            <td align="center" valign="top" width="600">
                            <![endif]-->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                            <!-- NAVIGATION -->
                            <tr>
                                <td bgcolor="#f4f4f4" align="left" style="padding: 10px 10px 10px 10px;" >
                                <p style="margin: 0;">
                                </p>
                                </td>
                            </tr>
                            <!-- ADDRESS -->
                            ${getFooter()}
                            </table>
                            <!--[if (gte mso 9)|(IE)]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                    </tr>
                </table>

        </body>
        </html>
    `
}

function setStyle() {
    return `
        <style type="text/css">
            /* FONTS */
            @media screen {
                @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                }
                
                @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                }
                
                @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                }
                
                @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                }
            }
            
            /* CLIENT-SPECIFIC STYLES */
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; }

            /* RESET STYLES */
            img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            table { border-collapse: collapse !important; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

            /* iOS BLUE LINKS */
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
            
            /* MOBILE STYLES */
            @media screen and (max-width:600px){
                h1 {
                    font-size: 32px !important;
                    line-height: 32px !important;
                }
            }

            /* ANDROID CENTER FIX */
            div[style*="margin: 16px 0;"] { margin: 0 !important; }
        </style>
    `
}

function getMailLogo() {
    const { base, logo} = url
    return `
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
            <tr>
                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                    <a href="${base}" target="_blank">
                        <img alt="Logo" src="${base + logo}" width="40" height="40" style="display: block; width: 40px; max-width: 40px; min-width: 40px; font-family: 'Lato', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px;" border="0">
                    </a>
                </td>
            </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
    `
}

function getFooter() {
    return `
        <tr>
            <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;" >
            <p style="margin: 0;">${title}</p>
            </td>
        </tr>
    `
}