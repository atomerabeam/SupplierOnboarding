const cds = require("@sap/cds");
const vbipService = require("./lib/vbipService");
const OTPService = require("./lib/OTPService");
const cryptoService = require("./lib/webCrypto");
const malwareScanner = require("./lib/malwareScan")

module.exports = cds.service.impl(async (service) => {
    service.on("getSupplier", async (req) => {
        // const vbipSrv = await cds.connect.to("VBIP-API")
        let oAuthToken = await vbipService.getToken("VBIP-API");
        let buyerID = req.data.buyerID;
        let supplierID = req.data.supplierID;
        let oResult = {};
        // console.log(oAuthToken);
        try {
            // console.log(await vbipSrv.read('SupplierInfo'))
            // console.log(await vbipSrv.get())
            let sParam1 = `(buyerID='${buyerID}',supplierID='${supplierID}')`; 
            let sParam2 = `?$expand=supplierDocuments,shareholderDetails($expand=shareholderDocuments)`;
            const response = await fetch(`${oAuthToken.url}/odata/v4/supplier-onboarding/SupplierInfo${sParam1}${sParam2}`, {
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
    });

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
    });

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
    });

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
    });

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
    });

    service.on("getDocumentType", async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        let country = req.data.pCountry;
        let businessNature = req.data.pBusinessNature;
        let oResult = { "documentType": {}, "catchError": {} };
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/ValidIDProof?$filter=countryCode_code eq '${country}' and businessNature eq '${businessNature}'`, {
                
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });

            oResult.documentType = await response.json();
        } catch (error) {
            oResult.catchError = error;
        }
        return oResult;
    });

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
    });


    service.on("updateSupplierB1", async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        let supplierID = req.data.supplierID;
        let vbipID = req.data.vbipID;
        let companyCode = req.data.companyCode;
        let b1Info;
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/btponboarding/B1Onboarding(vbipID='${vbipID}',companyCode='${companyCode}')`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });

            b1Info = await response.json();
        } catch (error) {

        }

        let oAuthTokenCPI = await vbipService.getToken("VBIP-CPI");
        let oSupplier = {
            "SystemName": b1Info.dbName,
            "Method": "PATCH",
            "Payload": [
                {
                    "U_PMETH": "Y",
                    "supplierId": supplierID,
                    "BPPaymentMethods": [
                        {
                            "PaymentMethodCode": "VBIP001"
                        }
                    ]
                }
            ]

        };
        console.log(oSupplier);
        // console.log(oAuthTokenCPI);
        let oResult = {};
        try {
            const response = await fetch(`${oAuthTokenCPI.url}/if3001/router/b1s/v1/BusinessPartners`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthTokenCPI.token
                },
                body: JSON.stringify(oSupplier)
            });

            oResult.supplier = response;
            
        } catch (error) {
            oResult.error = error;
        }
        console.log(oResult);
        return oResult;
    });

    service.on("checkService", async () => {
        return "OK";
    });

    service.on("sendMail", async (req) => {
        // send mail
        let smtpDestination = req.data.smtpDestination;
        let mailTo = req.data.mailTo;
        let mailSubject = req.data.mailSubject;
        let mailContent = req.data.mailContent;
        // OTPService.sendEmail(smtpDestination, mailTo, mailSubject, mailContent);
    });

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
        const bCardInfoOTP = req.data.bCardInfoOTP
        const pID = req.data.pID;
        const smtpDestination = req.data.smtpDestination;
        const mailTo = req.data.mailTo;
        const mailSubject = req.data.mailSubject;
        const mailContent = req.data.mailContent;
        // send mail

        if (! await OTPService.isOTPAvailable(bCardInfoOTP, pID)) {

            req.error(900, "Reach OTP generation limit")
        } else {

            let oResult = OTPService.sendEmailOTP(bCardInfoOTP, pID, smtpDestination, mailTo, mailSubject, mailContent);
            return oResult;
        }
    });

    service.on("sendEmailOTP", async (req) => {
        const bCardInfoOTP = req.data.bCardInfoOTP
        const pID = await vbipService.decryptID(req.data.pID);
        const [sBuyerID, sSupplierID, sInviteDate] = pID.split("_")
        const smtpDestination = req.data.smtpDestination;
        // const mailTo = req.data.mailTo;
        // const mailSubject = req.data.mailSubject;
        // const mailContent = req.data.mailContent;
       
        // send mail

        let oAuthToken = await vbipService.getToken("VBIP-API");

        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/SupplierInfo(buyerID='${sBuyerID}',supplierID='${sSupplierID}')`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            var oSupplierInfo = await response.json();
            // 
            if(oSupplierInfo?.emailID){
                var mailTo = oSupplierInfo?.emailID;
            }else if(oSupplierInfo?.error){
                oSupplierInfo.error.message = 'SupplierInfo/Email not found'
              return  req.error(oSupplierInfo.error);
            }

            try {
                const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/EmailTemplate?$filter=type eq 'OTP1'`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": oAuthToken.token
                    }
                });
                var oJsonResponse = await response.json()

                if(oJsonResponse?.value[0]){                    
                var mailSubject = oJsonResponse?.value[0]?.emailSubject;
                var mailContent = oJsonResponse?.value[0]?.emailBody.replace("[SUPPLIER NAME]", oSupplierInfo?.supplierName);
                }else {
                  const  error ={
                        "code" : '404',
                        "message" : 'Email Template OTP1 not found'
                    }
                   
                  return  req.error(error);
                }

                
                // console.log(oJsonResponse)
                if (! await OTPService.isOTPAvailable(bCardInfoOTP, pID)) {

                    req.error(900, "Reach OTP generation limit")
                } else {
        
                    let oResult = OTPService.sendEmailOTP(bCardInfoOTP, pID, smtpDestination, mailTo, mailSubject, mailContent);
                    return oResult;
                }
                 
            } catch (error) {
                req.error(error)
            }
            
        } catch (error) {
            req.error(error)
        }
       
        
    });

    service.on("checkOTP", async (req) => {
        const bCardInfoOTP = req.data.bCardInfoOTP
        const pID = req.data.pID;
        const pOTP = req.data.pOTP;
        try {
            let result = OTPService.checkOTP(bCardInfoOTP, pID, pOTP);
            return result;
        } catch (error) {
            throw error
        }

    });

    service.on("decryptID", async (req) => {
        let pID = req.data.pID;
        let result = await vbipService.decryptID(pID);
        return result;
    });

    service.on("encryptString", async (req) => {
        let sValue = req.data.sValue;
        let result = await vbipService.encryptString(sValue);
        return result;
    });

    service.on("decryptString", async (req) => {
        let sValue = req.data.sValue;
        let result = await vbipService.decryptString(sValue);
        return result;
    });

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

    });

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
    });
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
    });

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
    });

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
            console.log(oCardInfo)
            if (oCardInfo) {
                oCardInfo.cardNumber = await vbipService.decryptData(sVbipRequestID, oCardInfo.cardNumber)
                oCardInfo.cvv2 = await vbipService.decryptData(sVbipRequestID, oCardInfo.cvv2)
                oCardInfo.expiredate = await vbipService.decryptData(sVbipRequestID, oCardInfo.expiredate)
                // delete oCardInfo["vbipRequestId"]

                console.log(oCardInfo)
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
    });

    service.on("reportInfo", async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        const sBuyerID = req.data.buyerID
        const sSupplierID = req.data.supplierID
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/SupplierInfo(buyerID='${sBuyerID}',supplierID='${sSupplierID}')`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                },
                body: JSON.stringify({ status: "REP" })
            });
            let oJsonResponse = await response.json()
            // console.log(oJsonResponse)
            return oJsonResponse.value
        } catch (error) {
            req.error(error)
        }
    });

    service.on('getCountries', async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/CountryMapping`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            let oJsonResponse = await response.json()
            // console.log(oJsonResponse)
            return oJsonResponse.value
        } catch (error) {
            req.error(error)
        }
    });


    service.on('get3DigitCountry', async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/CountryMapping?$filter=Code2 eq '${req.data.code2}'`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            let oJsonResponse = await response.json()
            // console.log(oJsonResponse)
            return oJsonResponse.value
        } catch (error) {
            req.error(error)
        }
    });
    
    service.on('getEmailTemplate', async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/EmailTemplate?$filter=type eq '${req.data.type}'`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            let oJsonResponse = await response.json()
            // console.log(oJsonResponse)
            return oJsonResponse.value
        } catch (error) {
            req.error(error)
        }
    });

    service.on('getCountryDocument', async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/CountryDocumentConfig?$filter=country eq '${req.data.country}' and businessNature eq '${req.data.businessNature}' `, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
           
            let oJsonResponse = await response.json()
            // console.log(oJsonResponse)
            return oJsonResponse
        } catch (error) {
            req.error(error)
        }
    });
    service.on('getDocRequired', async (req) => {
        let oAuthToken = await vbipService.getToken("VBIP-API");
        try {
            const response = await fetch(`${oAuthToken.url}/odata/v4/catalog/DocumentRequired?$filter=countryCode_code eq '${req.data.country}' `, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": oAuthToken.token
                }
            });
            
            let oJsonResponse = await response.json()
            // console.log(oJsonResponse)
            return oJsonResponse.value
        } catch (error) {
            req.error(error)
        }
    });
    
})