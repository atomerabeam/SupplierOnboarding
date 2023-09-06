sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";
        let serviceUrl = "https://visa-worldwide-pte--limited--vbip-development-env-7hhai1854224b.cfapps.ap11.hana.ondemand.com/odata/v4/btponboarding/BTPOnboarding";
        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            getSupplier: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/getSupplier", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },
            
            sendMailOTP: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/sendMail", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = response;
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },
        };
    });