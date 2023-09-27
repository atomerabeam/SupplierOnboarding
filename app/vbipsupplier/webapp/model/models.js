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
        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            getSupplier: async function (oParameter) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/getSupplier", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(oParameter),
                    });

                    try {
                        let oResponse = await response.json();
                        oResult.response = oResponse.value;
                    } catch (error) {
                        oResult.response = response;
                        oResult.error = error;
                    }
                } catch (error) {
                    oResult.error = error;
                }
                return oResult;
            },

            getBuyer: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} };
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
                let oResult = { "response": {}, "catchError": {} };
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
                let oResult = { "response": {}, "catchError": {} };
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
                let oResult = { "response": {}, "catchError": {} };
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
                let oResult = { "response": {}, "catchError": {} };
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
                let oResult = { "response": {}, "catchError": {} };
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
                let oResult = { "response": {}, "catchError": {} };
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

            decryptID: async function (oParameter) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/decryptID", {
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

            encryptFile: async function (oParameter) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/encryptFile", {
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

            decryptFile: async function (oParameter) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/decryptFile", {
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

            checkMalware: async function (oParameter) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/malwareScanning", {
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

            submitSupplier: async function (oParameter) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/submitSupplier", {
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

            checkService: async function () {
                try {
                    const response = await fetch("/odata/v4/supplier/checkService", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                } catch (error) {
                }
            },
        };
    });