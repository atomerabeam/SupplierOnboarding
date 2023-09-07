sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/models",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Models, MessageToast) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.SupplierInfo", {
            onInit: function () {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Supplier").attachPatternMatched(this._onObjectMatched, this);
            },

            onResendOTPLinkPress: async function () {
                let oParameter = {
                    "pID": this._GUID
                };
                let vEmail; 
                let oResult = await Models.getSupplier(oParameter);
                if (Object.keys(oResult.catchError).length === 0 &&
                    oResult.catchError.constructor === Object) {
                    if (oResult.response.error) {
                        // Error
                        let msgError = `Failed to get Supplier information \nError code ${oResult.response.error.code}`;
                        MessageToast.show(msgError);

                    } else {
                        // Success
                        vEmail = oResult.response.value.supplier.emailID;
                    }
                } else {
                    // Catch error
                    let msgError = `Failed to get Supplier information \nError catched`;
                    MessageToast.show(msgError);
                }
                
                let oMail = {
                    "pID": this._GUID,
                    "smtpDestination": "MAILTRAP2",
                    "mailTo": vEmail,
                    "mailSubject": "VBIP Supplier OTP",
                    "mailContent": `<strong>Dear Supplier</strong><br/><br/>
                                    <p>Your OTP code is [OTP]</p><br/><p>Thanks</p>`
                };
                await Models.sendMailOTP(oMail);
            },
            onContinueButtonPress: async function () {
                let inputOTP = this.getView().byId("idOTP.Input").getValue();
                // let inputOTP = sap.ui.getCore().byId("idOTP.Input").getValue();
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
                            vMessage = "Correct OTP !!!";
                            MessageToast.show(vMessage);
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
        });
    });
