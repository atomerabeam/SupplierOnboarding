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

            getNothing: async function () {
                try {
                    const response = await fetch("/odata/v4/supplier/getNothing", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                } catch (error) {
                }
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

            getBuyer: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/getBuyer", {
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

            getBuyerOnboarding: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/getBuyerOnboarding", {
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

            getVBIP: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/getVBIP", {
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

            getBusinessNature: async function () {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/getBusinessNature", {
                        method: "POST",
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

            updateSupplier: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/updateSupplier", {
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
                    const response = await fetch("/odata/v4/supplier/sendMailOTP", {
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
            
            checkOTP: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} }
                try {
                    const response = await fetch("/odata/v4/supplier/checkOTP", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();;
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },
        };
    });