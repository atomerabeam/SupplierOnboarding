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
                            "Content-Type": "application/json",
                            "Authorization" :"Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmJpcC1kZXZlbG9wbWVudC1lbnYtN2hoYWk3czcuYXV0aGVudGljYXRpb24uYXAxMS5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LTg1Njk4MDQwMSIsInR5cCI6IkpXVCIsImppZCI6ICJiSlJSbHdJdk1NcGY4bHZWaUVQYU5DVmUyWThlR2V5UFgwRzRsenVId0VzPSJ9.eyJqdGkiOiI5YzczNGY5MjdiZGI0YzExYmZjMTdhMDczZjgxOWZkZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI1MDQwMTNmMi1mNjVmLTQ1NjgtYmQzNy0yZWZiOWMzOGY3ZDAiLCJ6ZG4iOiJ2YmlwLWRldmVsb3BtZW50LWVudi03aGhhaTdzNyJ9LCJzdWIiOiJzYi1WQklQU1VQUExJRVIhdDM1NDYiLCJhdXRob3JpdGllcyI6WyJ1YWEucmVzb3VyY2UiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIl0sImNsaWVudF9pZCI6InNiLVZCSVBTVVBQTElFUiF0MzU0NiIsImNpZCI6InNiLVZCSVBTVVBQTElFUiF0MzU0NiIsImF6cCI6InNiLVZCSVBTVVBQTElFUiF0MzU0NiIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiM2U2NjY3YzYiLCJpYXQiOjE2OTYwNDkyOTMsImV4cCI6MTY5NjA5MjQ5MywiaXNzIjoiaHR0cHM6Ly92YmlwLWRldmVsb3BtZW50LWVudi03aGhhaTdzNy5hdXRoZW50aWNhdGlvbi5hcDExLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiemlkIjoiNTA0MDEzZjItZjY1Zi00NTY4LWJkMzctMmVmYjljMzhmN2QwIiwiYXVkIjpbInNiLVZCSVBTVVBQTElFUiF0MzU0NiIsInVhYSJdfQ.FWlU7c2Pm7FCoLWnPh3WtppDaQpD1ZDud0gTEAq9nhY8UmBArghyMAPTvcVP_BpY99LuSesHs-XjQZ-qbb3AkjLpy1VYO--ugbnWcEiB8_KZOtkD4vPPtqvitUZHsmM58snhPhtfDgA7MkoHHFgKHmB4sioS3Y1Fbnuw_fZTTgrLA-eKVtwqut46Ijo0kwA5gkU8vL-b05hnAUUYzKqzrH7eL9RnhLh2jhVqeiHA-JRKStMT5xnFUG8eC1CfNB31Nv2bpRAiq411LkBUk7GKY3FiWhsHS0hNdiRwzG0DNT8xTSTi33qaBw06bxhX9mTAXuxsee_KNmDC3Ky_H5tc9g"
                        },
                        body: JSON.stringify(oParameter),
                    });
                    console.log(await response.json())
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
            getCardInfo: async function(oParameter){
                let oResult = {}
                try {
                    const response = await fetch("/odata/v4/supplier/getCardInfo", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(oParameter),
                    });
                    
                    oResult.response =  await response.json()
                } catch (error) {
                    oResult.catchError = error;
                }
                return oResult;
            }
        };
    });