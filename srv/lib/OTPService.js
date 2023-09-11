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
    const mailClientOptions = {
        requireTLS: true
    };

    // mailClient.sendMail({ destinationName: destinationName }, [mailConfig], [mailClientOptions]);

}

async function genOTP(pID) {
    const expireIn = 30000; // miliseconds
    let vDigits = "0123456789";
    let vOTP = "";
    for (let i = 0; i < 6; i++) {
        vOTP += vDigits[Math.floor(Math.random() * 10)];
    }
    let vExpiredTime = Date.now() + expireIn;

    console.log("pID: " + pID);
    let index = aOTP.findIndex(item => item.uID === pID);
    console.log("index " + index);
    console.log(aOTP);
    // remove current OTP by supplier ID
    if (index >= 0) {
        console.log("splice " + pID);
        aOTP.splice(index, 1);
    }
    console.log(aOTP);

    aOTP.push({
        "uID": pID,
        "OTP": vOTP,
        "expiredTime": vExpiredTime
    });
    console.log(aOTP);

    return vOTP;
}

async function checkOTP(pID, inputOTP) {
    let oValidOTP = aOTP.find(item => item.uID === pID && item.OTP === inputOTP);
    console.log(oValidOTP);
    if (oValidOTP === undefined) {
        return "Invalid";
    } else {
        if (Date.now() < oValidOTP.expiredTime) {
            let index = aOTP.findIndex(item => item.uID === pID && item.OTP === inputOTP);
            aOTP.splice(index, 1);
            return "OK";
        } else {
            return "Expired";
        }
    }
}
module.exports = { sendEmail, sendEmailOTP, checkOTP };



