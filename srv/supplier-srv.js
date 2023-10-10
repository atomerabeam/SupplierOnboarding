const cds = require("@sap/cds");
const vbipService = require("./lib/vbipService");
const OTPService = require("./lib/OTPService");
const cryptoService = require("./lib/webCrypto");
const malwareScanner = require("./lib/malwareScan")

module.exports = cds.service.impl(async (service) => {
    service.on("getSupplier", async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        let buyerID = req.data.buyerID;
        let supplierID = req.data.supplierID;
        let oResult = {};
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/supplier-onboarding/SupplierInfo(buyerID='${buyerID}',supplierID='${supplierID}')?$expand=supplierDocuments,shareholderDetails`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });

            oResult.supplier = await response.json();
        } catch (error) {
            oResult.error = error;
        }
        return oResult;
    }),

        service.on("getBuyer", async (req) => {
            let oAuthToken = await vbipService.getToken("VBIP-API");
            let buyerID = req.data.buyerID;
            let oResult = { "buyer": {}, "catchError": {} }
            try {
                const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/BuyerInfo(buyerID='${buyerID}')`, {
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
            let oAuthToken = await vbipService.getToken("VBIP-API");
            let buyerID = req.data.buyerID;
            let oResult = { "buyerOnboarding": {}, "catchError": {} };
            try {
                const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/BuyerOnboarding?$filter=buyerID eq '${buyerID}'`, {
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
            let oAuthToken = await vbipService.getToken("VBIP-API");
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
            let oAuthToken = await vbipService.getToken("VBIP-API");
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
            let oAuthToken = await vbipService.getToken("VBIP-API");
            let buyerID = req.data.buyerID;
            let supplierID = req.data.supplierID;
            let oSupplier = req.data.oSupplier;
            let oResult = {}
            try {
                const response = await fetch(`${oAuthToken.url}/odata/v4/supplier-onboarding/SupplierInfo(buyerID='${buyerID}',supplierID='${supplierID}')`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": oAuthToken.token
                    },
                    body: JSON.stringify(oSupplier)
                });

                oResult.response = await response.json();
            } catch (error) {
                oResult.catchError = error;
            }
            return oResult;
        }),

        service.on("checkService", async () => {
            return "OK";
        }),

        service.on("sendMail", async (req) => {
            // send mail
            let smtpDestination = req.data.smtpDestination;
            let mailTo = req.data.mailTo;
            let mailSubject = req.data.mailSubject;
            let mailContent = req.data.mailContent;
            // OTPService.sendEmail(smtpDestination, mailTo, mailSubject, mailContent);
        }),

        // service.on("sendMailOTP", async (req) => {
        //     // send mail
        //     let pID = req.data.pID;
        //     let smtpDestination = req.data.smtpDestination;
        //     let mailTo = req.data.mailTo;
        //     let mailSubject = req.data.mailSubject;
        //     let mailContent = req.data.mailContent;
        //     let oResult = OTPService.sendEmailOTP(pID, smtpDestination, mailTo, mailSubject, mailContent);
        //     return oResult;
        // }),

        service.on("sendMailOTP", async (req) => {
            // send mail
            let pID = req.data.pID;
            if (! await OTPService.isOTPAvailable(pID)) {
                req.error(900, "Reach OTP generation limit")
            } else {
                let smtpDestination = req.data.smtpDestination;
                let mailTo = req.data.mailTo;
                let mailSubject = req.data.mailSubject;
                let mailContent = req.data.mailContent;
                let oResult = OTPService.sendEmailOTP(pID, smtpDestination, mailTo, mailSubject, mailContent);
                return oResult;
            }
        }),

        service.on("checkOTP", async (req) => {
            // send mail
            let pID = req.data.pID;
            let pOTP = req.data.pOTP;
            let result = OTPService.checkOTP(pID, pOTP);
            return result;
        }),

        service.on("decryptID", async (req) => {
            let pID = req.data.pID;
            let result = await vbipService.decryptID(pID);
            return result;
        }),

        service.on("encryptFile", async (req) => {
            try {
                let vID = req.data.ID;
                let fileContent = req.data.fileContent;
                if (!fileContent) {
                    return ""
                }
                // Encrypt fileContent
                let oEncryptResult = await cryptoService.encryptData(vID, fileContent);
                // Update encrypted Base64 content to Database
                return oEncryptResult;
            } catch (error) {
                req.error(error)
            }

        }),

        service.on("decryptFile", async (req) => {
            try {
                let vID = req.data.ID;
                // Get fileContent from Database
                // let documentDetails = await service.get(DocumentDetails).where({ ID: vID });
                let encodedContent = req.data.fileContent;
                if (!encodedContent) {
                    return ""
                }
                // let encodedContent = await service.run( SELECT.from(DocumentDetails).columns("encodedContent").where({ ID: vID }))
                let fileContent = await cryptoService.decryptData(vID, encodedContent);
                return fileContent;
            } catch (error) {
                req.error(error);
            }
        })
    /**
     * Detect file content contains malware or not
     * Input:
     * fileContent(LargeBinary): file Content as Base64 format
     * Output: 
     * isMalwareDetected(Boolean): returns true/false indicate whether fileContent consists Malware
     */
    service.on("malwareScanning", async (req) => {
        let { fileContent } = req.data
        let isMalwareDetected = await malwareScanner.mediaMalwareScanner(fileContent)
        return isMalwareDetected
    })

    service.on("submitSupplier", async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-CPI");
        let oSupplier = req.data.oSupplier;
        let oResult = {};
        try {
            const response = await fetch(`${oAuthToken.url}/if4003/router/vbpe/v1/api/onBoard/supplier`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                },
                body: JSON.stringify(oSupplier)
            });

            oResult.supplier = await response.json();
        } catch (error) {
            oResult.error = error;
        }
        return oResult;
    })

    service.on("getCardInfo", async (req) => {
        // let encodedRequestID = req.data.vbipRequestID
        // console.log(req.data.errorPayload)
        //Decode URL to VBIPRequestID
        // let sVbipRequestID = await vbipService.decryptID(encodedRequestID)
        let sVbipRequestID = req.data.vbipRequestID
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/CASupplierPaymentDetails?$filter=vbipRequestId eq '${sVbipRequestID}'`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            let oJsonResponse = await response.json()
            let oCardInfo = oJsonResponse.value[0]
            if (oCardInfo) {
                oCardInfo.cardNumber = await vbipService.decryptData(sVbipRequestID, oCardInfo.cardNumber)
                oCardInfo.cvv2 = await vbipService.decryptData(sVbipRequestID, oCardInfo.cvv2)
                oCardInfo.expiredate = await vbipService.decryptData(sVbipRequestID, oCardInfo.expiredate)
                delete oCardInfo["vbipRequestId"]

                //Update Payment Status
                await fetch(`${oAuthToken.url}/odata/v4/catalog/cardInfoCallback`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": oAuthToken.token
                    },
                    body: JSON.stringify({ "vbipRequestId": oCardInfo.vbipRequestId })
                })
            } else {
                oCardInfo = {}
            }
            return oCardInfo
        } catch (error) {
            req.error(400, error)
        }
    })

    service.on('getCountries', async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/Countries`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            let oJsonResponse = await response.json()
            console.log(oJsonResponse)
            return oJsonResponse.value
        } catch (error) {
            req.error(error)
        }
    })

})