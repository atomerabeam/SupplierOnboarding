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

            testAPI: async function () {
                let oResult = { "response": {}, "catchError": {} }
                let userLogin = Buffer.from("sb-VISAProcesses!t3546" + ":" + "Xn3ZaMxhBaOA4rT6XM3MdeqF1X8=").toString("base64");
                const bearer = await fetch(`https://vbip-development-env-7hhai7s7.authentication.ap11.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Authorization": "Basic " + userLogin
                    }
                });
                try {
                    const response = await fetch(`${serviceUrl}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },
        };
    });