sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "../model/models",
    "sap/m/MessageToast"
], function (
    Controller, JSONModel, Models, MessageToast
) {
    "use strict";
 
    return Controller.extend("vbipsupplier.controller.CardLandingPage", {
        /**
         * @override
         */
        onInit: async function () {
            //Auth Model
            this.getOwnerComponent().setModel(new JSONModel({ "authToken": "" }), "AuthModel")
            let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
            // Reset SupplierInfo Model
            this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier", {})
            this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer", {});
            this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP", {});
            // Page flow
            let oPageModel = new JSONModel();
            let oPageFlow = {
                "otp": false,
                "landing": false,
                "landingText": {
                    "invalid": true,
                    "expire": false
                }
            };
            oPageModel.setProperty("/pageFlow", oPageFlow);
            this.getView().setModel(oPageModel, "PageModel");

            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Card").attachPatternMatched(this._onObjectMatched, this);
            await Models.checkService();
            let oParameter1 = {
                "pID": this._GUID
            };

            //Authorize
            let oToken = await Models.authorize({
                "encryptedUrl": this._GUID
            })
            if (oToken.error && oToken.error.code != "900") { 
                this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);
            } else {
                //For production
                // this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken", oToken.value)
                // sAuthToken = oToken.value
                //For production
                //For local test
                this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken", "")
                sAuthToken = ""
                //For local test
                let oDecrypt = await Models.decryptID(oParameter1, sAuthToken);
                let oParameter = {
                    "buyerID": oDecrypt.response.value.split("_")[0],
                    "supplierID": oDecrypt.response.value.split("_")[1]
                };

                let oSupplierRead = await Models.getSupplier(oParameter, sAuthToken);
                // if (Object.keys(oSupplierRead.catchError).length === 0 &&
                //     oSupplierRead.catchError.constructor === Object) {
                if (oSupplierRead.response) {
                    if (oSupplierRead.response.error) {
                        // Error
                        let msgError = `Failed to get Supplier information \nError code ${oSupplierRead.response.error.code}`;
                        // MessageToast.show(msgError);
                        this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);

                    } else {
                        if (oSupplierRead.response.supplier.error) {
                            this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);

                        } else if (oSupplierRead.response.supplier) {
                            // Success
                            this.getView().getModel("PageModel").setProperty("/pageFlow/landing", false);
                            this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier", oSupplierRead.response.supplier);
                            console.log(this.getOwnerComponent().getModel("SupplierInfo"))
                            await this._getBuyerInfo(oSupplierRead.response.supplier.buyerID);
                            this.onResendOTPLinkPress();
                            this.getView().getModel("PageModel").setProperty("/pageFlow/otp", true);
                        }
                    }
                } else {
                    // Catch error
                    let msgError = `Failed to get Supplier information \nError catched`;
                    // MessageToast.show(msgError);
                    this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);
                }
            }




        },
        onResendOTPLinkPress: async function () {
            let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
            let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
            let oVBIP = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");

            let vEmail = oSupplier.emailID;
            // let oResult = await Models.getSupplier(oParameter);

            let oMail = {
                "bCardInfoOTP": true,
                "pID": this._GUID,
                "smtpDestination": oVBIP.smtpDestination,
                "mailTo": vEmail,
                "mailSubject": "VBIP Supplier OTP",
                "mailContent": `<strong>Dear Supplier</strong><br/><br/>
                                <p>Your OTP code is [OTP]</p><br/><p>Thanks</p>`
            };

            let oResult = await Models.sendMailOTP(oMail, sAuthToken);
            if (oResult.response.ok === true) {
                MessageToast.show("Sent OTP");
            } else {
                let error = await oResult.response.json()
                    if (error.error.code == "900") {
                        MessageToast.show("Reach OTP limit");
                    } else{ 
                        MessageToast.show("Failed to send OTP");
                    }
            }
        },
        onContinueButtonPress: async function () {
            let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
            let inputOTP = this.getView().byId("idOTP.Input").getValue();
            let oParameter = {
                "bCardInfoOTP": true,
                "pID": this._GUID,
                "pOTP": inputOTP
            };
            let oResult = await Models.checkOTP(oParameter, sAuthToken);
            if (Object.keys(oResult.catchError).length === 0 &&
                oResult.catchError.constructor === Object) {
                if (oResult.response.error) {
                    // Error
                    let msgError = `Failed to process \nError code ${oResult.response.error.code}`;
                    MessageToast.show(msgError);

                } else {
                    // Success
                    let vResult = oResult.response.value;
                    let vMessage;
                    if (vResult === "Invalid") {
                        vMessage = "Invalid OTP";
                        MessageToast.show(vMessage);
                    } else if (vResult === "Expired") {
                        vMessage = "Your OTP is expired";
                        MessageToast.show(vMessage);
                    } else if (vResult === "OK") {
                        // vMessage = "Correct OTP !!!";
                        // MessageToast.show(vMessage);
                        let oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("CardInfo");
                    }
                }
            } else {
                // Catch error
                let msgError = `Failed to process \nError catched`;
                MessageToast.show(msgError);
            }
        },
        _getBuyerInfo: async function (pID) {
            let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
            let oBuyerParameter = {
                "buyerID": pID
            };
            let oBuyerRead = await Models.getBuyer(oBuyerParameter, sAuthToken);
            if (oBuyerRead.response.value) {
                // Get Buyer Info
                this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer", oBuyerRead.response.value.buyer);
            }

            // Get Buyer Onboarding
            let oBuyerOnRead = await Models.getBuyerOnboarding(oBuyerParameter, sAuthToken);
            if (oBuyerOnRead.response.value.buyerOnboarding.value[0]) {
                // Set Model Buyer Onboarding
                // this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyerOnboarding", oBuyerOnRead.response.value.buyerOnboarding.value[0]);

                // Get VBIP
                let oVBIPParameter = {
                    "pID": oBuyerOnRead.response.value.buyerOnboarding.value[0].vbipID
                };
                let oVBIP = await Models.getVBIP(oVBIPParameter, sAuthToken);
                if (oVBIP.response.value) {
                    // Get Buyer Info
                    this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP", oVBIP.response.value.vbip);
                }
            }
        },
        _onObjectMatched: function (oEvent) {
            this._GUID = oEvent.getParameter("arguments").token;
        },

    });
});