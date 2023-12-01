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
            authorize: async function (oParameter) {
                try {
                    const response = await fetch("/odata/v4/auth/Authorize", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(oParameter),
                    });
                    return await response.json()
                } catch (error) {
                    return error
                }
            },
            getSupplier: async function (oParameter, sAuthToken) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/getSupplier", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
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

            getBuyer: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/getBuyer", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            getBuyerOnboarding: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/getBuyerOnboarding", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            getVBIP: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/getVBIP", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            getBusinessNature: async function (sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/getBusinessNature", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        }
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            getDocumentType: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/getDocumentType", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            updateSupplier: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/updateSupplier", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            updateSupplierB1: async function (oParameter, sAuthToken) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/updateSupplierB1", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            sendMailOTP: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/sendMailOTP", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = response;
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            checkOTP: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/checkOTP", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                    if(response.ok){
                        return oResult.response;
                    } else {
                        throw new Error(oResult.response.error.message)
                    }
                } catch (error) {
                    throw new Error(error)
                }
            },

            decryptID: async function (oParameter, sAuthToken) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/decryptID", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });
                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            encryptFile: async function (oParameter, sAuthToken) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/encryptFile", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            decryptFile: async function (oParameter, sAuthToken) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/decryptFile", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            checkMalware: async function (oParameter, sAuthToken) {
                let oResult = {};
                try {
                    const response = await fetch("/odata/v4/supplier/malwareScanning", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json();
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            submitSupplier: async function (oParameter, sAuthToken) {
                let oResult = { "response": {}, "catchError": {} };
                try {
                    const response = await fetch("/odata/v4/supplier/submitSupplier", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
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
            getCardInfo: async function (oParameter, sAuthToken) {
                let oResult = {}
                try {
                    const response = await fetch("/odata/v4/supplier/getCardInfo", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        },
                        body: JSON.stringify(oParameter),
                    });

                    oResult.response = await response.json()
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            },

            reportInfo: async function (oParameter, sAuthToken) {

                try {
                    const response = await fetch(`/odata/v4/supplier/reportInfo(buyerID='${oParameter.sBuyerID}',supplierID='${oParameter.sSupplierID}')`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        }
                    });
                    return response
                } catch (error) {
                    return error
                }
            },
            getCountries: async function (oModel, sAuthToken) {
                try {
                    const response = await fetch("/odata/v4/supplier/getCountries()", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        }
                    });
                    let oJsonResponse = await response.json()
                    oModel.setData(oJsonResponse.value)
                } catch (error) {
                    return null
                }
            },
            
            get3DigitCountry: async function (oParameter, sAuthToken) {

                try {
                    const response = await fetch(`/odata/v4/supplier/get3DigitCountry(code2='${oParameter}'`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": sAuthToken
                        }
                    });
                    let oJsonResponse = await response.json()
                    return oJsonResponse.value
                } catch (error) {
                    return error
                }
            },
        };
    });