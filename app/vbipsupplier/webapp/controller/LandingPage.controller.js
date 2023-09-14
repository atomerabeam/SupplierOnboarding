sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "../model/models",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Models, MessageToast) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.LandingPage", {
            onInit: function () {
                this._onInit();
            },

            onResendOTPLinkPress: async function () {
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                let oVBIP = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");

                let vEmail = oSupplier.emailID;
                // let oResult = await Models.getSupplier(oParameter);

                let oMail = {
                    "pID": this._GUID,
                    "smtpDestination": oVBIP.smtpDestination,
                    "mailTo": vEmail,
                    "mailSubject": "VBIP Supplier OTP",
                    "mailContent": `<strong>Dear Supplier</strong><br/><br/>
                                    <p>Your OTP code is [OTP]</p><br/><p>Thanks</p>`
                };

                let oResult = await Models.sendMailOTP(oMail);
                if (oResult.response.ok === true) {
                    MessageToast.show("Sent OTP");
                } else {
                    MessageToast.show("Failed to send OTP");
                }
            },
            onContinueButtonPress: async function () {
                let inputOTP = this.getView().byId("idOTP.Input").getValue();
                let oParameter = {
                    "pID": this._GUID,
                    "pOTP": inputOTP
                };
                let oResult = await Models.checkOTP(oParameter);
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
                            oRouter.navTo("SupplierInfo");
                        }
                    }
                } else {
                    // Catch error
                    let msgError = `Failed to process \nError catched`;
                    MessageToast.show(msgError);
                }
            },
            _onObjectMatched: function (oEvent) {
                this._GUID = oEvent.getParameter("arguments").GUID;
            },

            _onInit: async function () {
                // Page flow
                let oPageModel = new JSONModel();
                let oPageFlow = {
                    "otp": false,
                    "landing": false
                };
                oPageModel.setProperty("/pageFlow", oPageFlow);
                this.getView().setModel(oPageModel, "PageModel");

                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Supplier").attachPatternMatched(this._onObjectMatched, this);
                await Models.getNothing();
                let oParameter = {
                    "pID": this._GUID
                };

                let oSupplierRead = await Models.getSupplier(oParameter);
                if (Object.keys(oSupplierRead.catchError).length === 0 &&
                    oSupplierRead.catchError.constructor === Object) {
                    if (oSupplierRead.response.error) {
                        // Error
                        let msgError = `Failed to get Supplier information \nError code ${oSupplierRead.response.error.code}`;
                        // MessageToast.show(msgError);
                        this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);

                    } else {
                        if (oSupplierRead.response.value.supplier.error) {
                            this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);

                        } else {
                            // Success
                            this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier", oSupplierRead.response.value.supplier);
                            await this._getBuyerInfo(oSupplierRead.response.value.supplier.buyerID);
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
            },

            _getBuyerInfo: async function (pID) {
                let oBuyerParameter = {
                    "pID": pID
                };
                let oBuyerRead = await Models.getBuyer(oBuyerParameter);
                if (oBuyerRead.response.value) {
                    // Get Buyer Info
                    this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer", oBuyerRead.response.value.buyer);
                }

                // Get Buyer Onboarding
                let oBuyerOnRead = await Models.getBuyerOnboarding(oBuyerParameter);
                if (oBuyerOnRead.response.value.buyerOnboarding.value[0]) {
                    // Set Model Buyer Onboarding
                    // this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyerOnboarding", oBuyerOnRead.response.value.buyerOnboarding.value[0]);

                    // Get VBIP
                    let oVBIPParameter = {
                        "pID": oBuyerOnRead.response.value.buyerOnboarding.value[0].vbipID
                    };
                    let oVBIP = await Models.getVBIP(oVBIPParameter);
                    if (oVBIP.response.value) {
                        // Get Buyer Info
                        this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP", oVBIP.response.value.vbip);
                    }
                }
            }
        });
    });
