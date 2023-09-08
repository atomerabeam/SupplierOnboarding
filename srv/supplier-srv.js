const cds = require("@sap/cds");
const vbipService = require("./lib/vbipService");
const OTPService = require("./lib/OTPService");
const cryptoService = require("./lib/webCrypto");

module.exports = cds.service.impl(async (service) => {
    // cryptoService.generateOTP();
    
    service.on("getSupplier", async (req) => {
        let oAuthToken = await vbipService.getToken();
        let pID = req.data.pID;
        let oResult = { "supplier": {}, "catchError": {} }
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/BuyerInfo(buyerID='${pID}')`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            
            oResult.supplier = await response.json();
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    }),

    service.on("sendMail", async (req) => {
        // send mail
        let smtpDestination = req.data.smtpDestination;
        let mailTo = req.data.mailTo;
        let mailSubject = req.data.mailSubject;
        let mailContent = req.data.mailContent;
        // OTPService.sendEmail(smtpDestination, mailTo, mailSubject, mailContent);
    }),

    service.on("sendMailOTP", async (req) => {
        // send mail
        let pID = req.data.pID;
        let smtpDestination = req.data.smtpDestination;
        let mailTo = req.data.mailTo;
        let mailSubject = req.data.mailSubject;
        let mailContent = req.data.mailContent;
        OTPService.sendEmailOTP(pID, smtpDestination, mailTo, mailSubject, mailContent);
    }),

    service.on("checkOTP", async (req) => {
        // send mail
        let pID = req.data.pID;
        let pOTP = req.data.pOTP;
        let result = OTPService.checkOTP(pID, pOTP);
        return result;
    })
})