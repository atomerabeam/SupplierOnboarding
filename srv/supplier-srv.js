const cds = require("@sap/cds");
const vbipService = require("./lib/vbipService");
const mailService = require("./lib/mailService");

module.exports = cds.service.impl(async (service) => {
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
        mailService.sendEmail(smtpDestination, mailTo, mailSubject, mailContent);
    })
})