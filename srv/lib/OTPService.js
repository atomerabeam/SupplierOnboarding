const mailClient = require("@sap-cloud-sdk/mail-client");
const oConnect = require('@sap-cloud-sdk/connectivity');
let aSupplierOTP = [];
let aCardOTP = [];
let aVerified = [];

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

async function sendEmailOTP(bCardInfoOTP, pID, destinationName, mailTo, subject, htmlBody) {
    let vOTP = await genOTPNew(bCardInfoOTP, pID);
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

    let oResult = await mailClient.sendMail({ destinationName: destinationName }, [mailConfig], [mailClientOptions]);
    return oResult;
}

// async function genOTP(pID) {
//     const expireIn = 30000; // miliseconds
//     let vDigits = "0123456789";
//     let vOTP = "";
//     for (let i = 0; i < 6; i++) {
//         vOTP += vDigits[Math.floor(Math.random() * 10)];
//     }
//     let vExpiredTime = Date.now() + expireIn;

//     console.log("pID: " + pID);
//     let index = aSupplierOTP.findIndex(item => item.uID === pID);
//     console.log("index " + index);
//     console.log(aSupplierOTP);
//     // increse current OTP by supplier ID
//     if (index >= 0) {
//         console.log("splice " + pID);
//         aSupplierOTP.splice(index, 1);
//     }
//     console.log(aSupplierOTP);

//     aSupplierOTP.push({
//         "uID": pID,
//         "OTP": vOTP,
//         "expiredTime": vExpiredTime
//     });
//     console.log(aSupplierOTP);

//     return vOTP;
// }


/**
 * Generate new OTP and set OTP limit
 * @param {*} pID 
 * @returns OTP
 */
async function genOTPNew(bCardInfoOTP, pID) {
    const expireIn = 300000; // miliseconds
    const nOTPLimit = 2
    let vDigits = "0123456789";
    let vOTP = "";
    for (let i = 0; i < 6; i++) {
        vOTP += vDigits[Math.floor(Math.random() * 10)];
    }
    let vExpiredTime = Date.now() + expireIn;
    let aOTP
    if (bCardInfoOTP) {
        aOTP = aCardOTP
    } else {
        aOTP = aSupplierOTP
    }
    // console.log("pID: " + pID);
    let oOTP = aOTP.find(item => item.uID === pID);
    // console.log(aOTP);
    // Set OTP Limit
    if (oOTP) {
        oOTP.OTP = vOTP
        oOTP.expiredTime = vExpiredTime
        oOTP.OTPRemain -= 1
    } else {
        aOTP.push({
            "uID": pID,
            "OTP": vOTP,
            "expiredTime": vExpiredTime,
            "OTPRemain": nOTPLimit
        });
    }
    // console.log(aOTP);
    return vOTP;
}

async function checkOTP(bCardInfoOTP, pID, inputOTP) {
    let aOTP, oValidOTP
    if (bCardInfoOTP) {
        aOTP = aCardOTP
    } else {
        aOTP = aSupplierOTP
    }
    oValidOTP = aOTP.find(item => item.uID === pID && item.OTP === inputOTP);

    if (oValidOTP === undefined) {
        throw new Error("Invalid" )
    } else {
        if (Date.now() < oValidOTP.expiredTime) {
            let index = aOTP.findIndex(item => item.uID === pID && item.OTP === inputOTP);
            aOTP.splice(index, 1);
            aVerified.push({
                "uID": pID,
            });
            return "OK";
        } else {
            throw new Error("Expired")
        }
    }
}

async function isOTPAvailable(bCardInfoOTP, pID) {
    let oOTP
    if (bCardInfoOTP) {
        oOTP = aCardOTP.find(item => item.uID === pID);
    } else {
        oOTP = aSupplierOTP.find(item => item.uID === pID);
    }
    if (oOTP) {
        if (oOTP.OTPRemain <= 0) {
            return false
        }
    }
    return true
}

module.exports = { sendEmail, sendEmailOTP, checkOTP, isOTPAvailable };



