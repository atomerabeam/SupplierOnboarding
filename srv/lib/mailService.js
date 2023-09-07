
const mailClient = require("@sap-cloud-sdk/mail-client");
const oConnect = require('@sap-cloud-sdk/connectivity');
let aOTP = [];

async function sendEmail(destinationName, mailTo, subject, htmlBody) {

    let oDestinationInf = await oConnect.getDestination({ destinationName: destinationName })
    const mailConfig = {
        from: oDestinationInf.originalProperties['mail.smtp.from'],
        to: mailTo,
        subject: subject,
        html: htmlBody
    };

    mailClient.sendMail({ destinationName: destinationName }, [mailConfig]);
}

async function sendEmailOTP(pID, destinationName, mailTo, subject, htmlBody) {
    let vOTP = await genOTP(pID);
    let vContentOTP = htmlBody.replace("[OTP]", vOTP);
    let oDestinationInf = await oConnect.getDestination({ destinationName: destinationName })
    const mailConfig = {
        from: oDestinationInf.originalProperties['mail.smtp.from'],
        to: mailTo,
        subject: subject,
        html: vContentOTP
    };

    mailClient.sendMail({ destinationName: destinationName }, [mailConfig]);

}

async function genOTP(pID) {
    let vDigits = '0123456789';
    let vOTP = '';
    for (let i = 0; i < 6; i++) {
        vOTP += vDigits[Math.floor(Math.random() * 10)];
    }
    let vTime = Date.now() + 30000;

    // remove current OTP by supplier ID
    aOTP.splice(aOTP.findIndex(item => item.supplierID === pID), 1);
    console.log(aOTP);

    aOTP.push({
        "supplierID": pID,
        "OTP": vOTP,
        "expiredTime": vTime
    });
    console.log(aOTP);

    return vOTP;
}

async function checkOTP(pID, inputOTP) {
    let oValidOTP = aOTP.find(item => item.supplierID === pID && item.OTP === inputOTP );
    console.log(oValidOTP);
    if (oValidOTP === undefined) {
        return "Invalid";
    } else {
        if (Date.now() < oValidOTP.expiredTime) {
            return "OK";
        } else {
            return "Expired";
        }
    }
}
module.exports = { sendEmail, sendEmailOTP, checkOTP };



