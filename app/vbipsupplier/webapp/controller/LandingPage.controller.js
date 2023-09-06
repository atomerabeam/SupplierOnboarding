sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/models"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Models) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.LandingPage", {
            onInit: function () {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Supplier").attachPatternMatched(this._onObjectMatched, this);
            },

            onResendOTPLinkPress: async function () {
                let oParameter = {
                    "pID": this._GUID
                };
                let oResult = await Models.getSupplier(oParameter);
                console.log(oResult);

                let digits = '0123456789';
                let vOTP = '';
                for (let i = 0; i < 6; i++) {
                    vOTP += digits[Math.floor(Math.random() * 10)];
                }
                
                let oMail = {
                    "smtpDestination": "MAILTRAP2",
                    "mailTo": oResult.response.value.supplier.emailID,
                    "mailSubject": "VBIP Supplier OTP",
                    "mailContent": `<strong>Dear Supplier</strong>
                    <br/>
                    <br/>
                    <p>Your OTP code is ${vOTP}</p>
                    <br/>
                    <p>Thanks</p>`
                };
                let oSendMail = await Models.sendMailOTP(oMail);
                console.log(oSendMail);
            },

            _onObjectMatched: async function (oEvent) {
                this._GUID = oEvent.getParameter("arguments").GUID;
            },
        });
    });
