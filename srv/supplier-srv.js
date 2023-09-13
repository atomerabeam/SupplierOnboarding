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
            const response = await fetch(`${oAuthToken.url}/odata/v4/supplier-onboarding/SupplierInfo(${pID})`, {
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
    
    service.on("getBuyer", async (req) => {
        let oAuthToken = await vbipService.getToken();
        let pID = req.data.pID;
        let oResult = { "buyer": {}, "catchError": {} }
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/BuyerInfo(buyerID='${pID}')`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            
            oResult.buyer = await response.json();
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    }),
    
    service.on("getBuyerOnboarding", async (req) => {
        let oAuthToken = await vbipService.getToken();
        let pID = req.data.pID;
        let oResult = { "buyerOnboarding": {}, "catchError": {} };
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/BuyerOnboarding?$filter=buyerID eq '${pID}'`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            
            oResult.buyerOnboarding = await response.json();
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    }),

    service.on("getVBIP", async (req) => {
        let oAuthToken = await vbipService.getToken();
        let pID = req.data.pID;
        let oResult = { "vbip": {}, "catchError": {} };
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/btponboarding/BTPOnboarding(vbipID='${pID}')`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            
            oResult.vbip = await response.json();
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    }),

    service.on("getBusinessNature", async () => {
        let oAuthToken = await vbipService.getToken();
        let oResult = { "businessNature": {}, "catchError": {} };
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/BusinessNature`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            
            oResult.businessNature = await response.json();
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    }),

    service.on("updateSupplier", async (req) => {
        let oAuthToken = await vbipService.getToken();
        let pID = req.data.pID;
        let oSupplier = req.data.oSupplier;
        let oResult = { "supplier": {}, "catchError": {} }
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/supplier-onboarding/SupplierInfo(${pID})`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                },
                body: JSON.stringify(oSupplier)
            });
            
            oResult.supplier = response;
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    }),

    service.on("getNothing", async () => {
        // Nothing
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
        let oResult = OTPService.sendEmailOTP(pID, smtpDestination, mailTo, mailSubject, mailContent);
        return oResult;
    }),

    service.on("checkOTP", async (req) => {
        // send mail
        let pID = req.data.pID;
        let pOTP = req.data.pOTP;
        let result = OTPService.checkOTP(pID, pOTP);
        return result;
    })
})