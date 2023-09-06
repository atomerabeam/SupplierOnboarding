
const mailClient = require("@sap-cloud-sdk/mail-client");
const oConnect = require('@sap-cloud-sdk/connectivity')

async function sendEmail(destinationName, mailTo, subject, htmlBody) {
    
    let oDestinationInf = await oConnect.getDestination({destinationName: destinationName })
    const mailConfig = {
        from: oDestinationInf.originalProperties['mail.smtp.from'],
        to: mailTo,
        subject: subject,
        html: htmlBody
    };

    mailClient.sendMail({ destinationName: destinationName }, [mailConfig]);
}
module.exports = { sendEmail };



