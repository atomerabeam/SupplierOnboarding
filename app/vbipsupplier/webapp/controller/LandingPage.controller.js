sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "../model/models",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Models, MessageToast, formatter) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.LandingPage", {
            onInit: function () {
                // this._onInit();
                this.getView().addEventDelegate({
                    onBeforeShow: this.onBeforeShow,
                }, this);
            },

            onBeforeShow: function () {
                this._onInit();
            },

            onResendOTPLinkPress: async function () {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                let oVBIP = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");

                let vEmail = oSupplier.emailID;
                // let oResult = await Models.getSupplier(oParameter);

                let oMail = {
                    "bCardInfoOTP": false,
                    "pID": this._GUID,
                    "smtpDestination": oVBIP.smtpDestination,
                    "mailTo": vEmail,
                    "mailSubject": "OTP for your Action | Visa B2B Integrated Payments",
                    "mailContent": `<p>Dear Sir/Madam,</p>
                                    <p>Your OTP code is [OTP].</p>
                                    <p>Please key in OTP within 2 minutes.</p>
                                    <p>Congratulations on taking ${oSupplier.supplierName}'s first step towards receiving faster and more efficient invoice payments powered by Visa B2B Integrated Payments.</p>`
                };

                let oResult = await Models.sendMailOTP(oMail, sAuthToken);
                if (oResult.response.ok === true) {
                    MessageToast.show("Sent OTP");
                } else {
                    let error = await oResult.response.json()
                    if (error.error.code == "900") {
                        this._updateSupplier("noMessage", "ROL");
                        MessageToast.show("Reach OTP limit");
                    } else {
                        MessageToast.show("Failed to send OTP");
                    }
                }
            },
            onContinueButtonPress: async function () {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let inputOTP = this.getView().byId("idOTP.Input").getValue();
                let oParameter = {
                    "bCardInfoOTP": false,
                    "pID": this._GUID,
                    "pOTP": inputOTP
                };
                try {
                    let oResult = await Models.checkOTP(oParameter, sAuthToken);
                    if (oResult) {
                        let oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("SupplierInfo");
                        this.getView().byId("idOTP.Input").setValue("");
                    }
                } catch (error) {
                    debugger
                    // let oResult = await Models.checkOTP(oParameter, sAuthToken);
                    let vResult = error.message;
                    let vMessage;
                    if (vResult === "Error: Invalid") {
                        vMessage = "Invalid OTP";
                        MessageToast.show(vMessage);
                    } else {
                        vMessage = "Your OTP is expired";
                        MessageToast.show(vMessage)

                    }
                }
            },
            _onObjectMatched: function (oEvent) {
                this._GUID = oEvent.getParameter("arguments").GUID;
            },

            _onInit: async function () {
                // Auth  Model
                this.getOwnerComponent().setModel(new JSONModel({ "authToken": "" }), "AuthModel")
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
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

                this.getOwnerComponent().getModel("LandingText").setProperty("/expire", false);
                this.getOwnerComponent().getModel("LandingText").setProperty("/invalid", false);
                this.getOwnerComponent().getModel("LandingText").setProperty("/report", false);

                oPageModel.setProperty("/pageFlow", oPageFlow);
                this.getView().setModel(oPageModel, "PageModel");
                //Countries Model
                this.getOwnerComponent().setModel(new JSONModel(), "Countries")
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Supplier").attachPatternMatched(this._onObjectMatched, this);
                await Models.checkService();

                if (this._GUID === "Info") {
                    this.getOwnerComponent().getModel("LandingText").setProperty("/expire", false);
                    this.getOwnerComponent().getModel("LandingText").setProperty("/invalid", false);
                    this.getOwnerComponent().getModel("LandingText").setProperty("/report", true);
                    this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);
                    return;
                }

                let oParameter1 = {
                    "pID": this._GUID
                };

                let oToken = await Models.authorize({
                    "encryptedUrl": this._GUID
                })

                if (oToken.error) {
                    if (oToken.error.code == "900") {
                        this.getOwnerComponent().getModel("LandingText").setProperty("/expire", true);
                        this.getOwnerComponent().getModel("LandingText").setProperty("/invalid", false);
                    }
                    else {
                        this.getOwnerComponent().getModel("LandingText").setProperty("/expire", false);
                        this.getOwnerComponent().getModel("LandingText").setProperty("/invalid", true);
                    }
                    this.getView().getModel("PageModel").setProperty("/pageFlow/landing", true);
                } else {
                    //Authorize Success
                    // For production
                    this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken", oToken.value)
                    sAuthToken = oToken.value
                    //For production

                    // For local test
                    // this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken", "")
                    // sAuthToken = ""
                    //For local test

                    let oDecrypt = await Models.decryptID(oParameter1, sAuthToken);
                    let oParameter = {
                        "buyerID": oDecrypt?.response?.value.split("_")[0],
                        "supplierID": oDecrypt?.response?.value.split("_")[1]
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
                                this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier", oSupplierRead.response.supplier);
                                let oCountriesModel = this.getOwnerComponent().getModel("Countries")
                                Models.getCountries(oCountriesModel, sAuthToken)
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

            _updateSupplier: async function (sMessage, vStatus) {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                // let aSupplierDocument = [];
                // let aShareholder = [];
                

                let oSupplierData = {
                    "status": vStatus,
                    "SAPCustomer": null,
                    "businessNature_selectKey": null,
                    "shareholderCount": null,
                    "supplierDocuments": [],
                    "shareholderDetails": []
                };

                let oParameter = {
                    "buyerID": oSupplier.buyerID,
                    "supplierID": oSupplier.supplierID,
                    "oSupplier": oSupplierData
                };

                let oSupplierUpdate = await Models.updateSupplier(oParameter, sAuthToken);
                if (Object.keys(oSupplierUpdate.catchError).length === 0 &&
                    oSupplierUpdate.catchError.constructor === Object) {
                    if (oSupplierUpdate.response.error) {
                        // Error
                        // let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError code ${oSupplierUpdate.response.error.code}`;
                        // MessageToast.show(msgError);

                    } else {
                        // Success
                        let msgSuccess = `Supplier ${oSupplier.supplierID} information is update`;
                        if (sMessage === "message") {
                            MessageToast.show(msgSuccess);
                        }

                        // Exit
                    }
                } else {
                    // Catch error
                    // let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError catched`;
                    // MessageToast.show(msgError);
                }
            },
        });
    });
