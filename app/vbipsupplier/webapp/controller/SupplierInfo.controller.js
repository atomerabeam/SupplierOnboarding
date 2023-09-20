sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Models, MessageToast) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.SupplierInfo", {
            onInit: function () {
                this._onInit();
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("SupplierInfo").attachPatternMatched(this._onObjectMatched, this);
            },
            onContinue: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                let vAcceptCard = this.getView().byId('idAcceptCard.Select').getSelectedKey();
                if (vAcceptCard === "true") {
                    this.getView().getModel("PageModel").setProperty("/pageFlow/complete", true);
                } else {
                    this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", true);
                }
				
            },
            onConfirmInfo: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", true);
            },
            onContinueStep1: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", true);
            },
            onContinueStep2: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/complete", true);
                this._updateSupplier("noMessage");
            },
            onReportInfo: function () {

            },
            onSaveAndExit: async function () {
                this._updateSupplier("message");
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", true);
            },

            onChangeShareCount: function () {
                let oShareholderModel = new JSONModel;
                this.getView().setModel(oShareholderModel, "ShareholderModel");

                var vShareholderCount = this.getView().getModel('F4').getProperty('/shareholder/count');
                var aShareholder = [];
                for (var i = 1; i <= vShareholderCount; i++) {
                    aShareholder.push({
                        "name": "",
                        "sharePercentage": "",
                        "enterInfo": true,
                        "completed": false,
                        "Documents":
                            [
                                {
                                    "documentName": "",
                                    "documentType": "",
                                    "nameonDocument": "",
                                    "documentNumber": ""
                                }
                            ]
                    });
                }
                this.getView().getModel('ShareholderModel').setProperty('/item', aShareholder);
            },
            onUploadFileButton: async function (oEvent) {
                let strID = oEvent.getParameter("id");
                let fileNumber = strID.split('idUploadFile')[1].split('.Button')[0];
    
                let input = document.createElement('input'); // Create input element
                input.type = 'file'; // Important to be type File
                input.multiple = true // Alow only one file at a time
                input.accept = "image/*" // Only accept image file
                let fileInfo;
                input.onchange = async function () {
                    let file = input.files; // get the file
                    fileInfo = file;
                    for (let i = 0; i < file.length; i++) {
                        let data = file[i]
                        let dataArr = await data.arrayBuffer()
                        let textData = await data.text()
                        var bytes = new Uint8Array(dataArr);
                        var len = bytes.byteLength;
                        var base64 = '';
                        for (let i = 0; i < len; i++) {
                            base64 += String.fromCharCode(bytes[i]);
                        }
                        base64 = btoa(base64);
                        // console.log(dataArr)
                        // console.log(textData)
                        // console.log(base64)
                    }
    
                    let oFile = this.getView().getModel('FileModel');
                    oFile.setProperty("/file" + fileNumber, {
                        // "fileID1": result.value,
                        "fileName": fileInfo[0].name,
                        "fileType": fileInfo[0].type,
                        "fileData": base64,
                        "uploadVisible": false,
                        "fileVisible": true,
                    });
                }.bind(this)
    
                input.click();
            },
            onDeleteFileButton: async function (oEvent) {
                //File Number
                let strID = oEvent.getParameter("id");
                let fileNumber = strID.split('idDeleteFile')[1].split('.Icon')[0];
    
                let oFile = this.getView().getModel('FileModel');
                oFile.setProperty("/file" + fileNumber, {
                    "fileName": null,
                    "fileType": null,
                    "fileData": null,
                    "uploadVisible": true,
                    "fileVisible": false,
                });
    
                //Set model
                this.getView().setModel(oFile, "FileModel");
            },
            onDownloadFileButton: async function (oEvent) {
                //File Number
                let strID = oEvent.getParameter("id");
                let fileNumber = strID.split('idDownloadFile')[1].split('.Icon')[0];
    
                //File
                let oFile = this.getView().getModel('FileModel');
                let vFile = oFile.getProperty("/file" + fileNumber);
    
                const downloadLink = document.createElement('a');
                let MimeType = vFile.fileType;
                downloadLink.href = "data:" + MimeType + ";base64," + vFile.fileData; //base64 file content
                downloadLink.download = vFile.fileName;
                // Trigger the download
                downloadLink.click();
            },
            onEnterShareholderPopup: function (oEvent) {
                let oBinding = oEvent.getSource().getBindingContext("ShareholderModel");
                let oCurrentItem = this.getView().getModel("ShareholderModel").getProperty(oBinding.getPath());
                oCurrentItem.path = oBinding.getPath();

                let oShareholderPopupModel = new JSONModel;
                oShareholderPopupModel.setProperty('/popup', oCurrentItem);
                this.getView().setModel(oShareholderPopupModel, "ShareholderPopupModel");

                if (!this._oDialog) {
                    this._oDialog = new sap.ui.xmlfragment("vbipsupplier.view.fragment.ShareholderPopup", this);
                    this.getView().addDependent(this._oDialog);
                }
                this._oDialog.open();
            },
            onDialogAfterClose: function () {
                this._oDialog.destroy();
                this._oDialog = null;
            },
            onSave: function () {
                let oShareholder = {
                    "name": this.getView().getModel("ShareholderPopupModel").getProperty("/popup/name"),
                    "sharePercentage": this.getView().getModel("ShareholderPopupModel").getProperty("/popup/sharePercentage"),
                    "enterInfo": false,
                    "completed": true,
                    "Documents":
                        [
                            {
                                "documentName": "",
                                "documentType": "",
                                "nameonDocument": "",
                                "documentNumber": ""
                            }
                        ]
                };
                let sPath = this.getView().getModel("ShareholderPopupModel").getProperty("/popup/path");
                
                this.getView().getModel("ShareholderModel").setProperty(`${sPath}`, oShareholder);

                this.onDialogAfterClose();
            },
            onCancel: function () {
                this.onDialogAfterClose();
            },
            _onInit: async function () {
                // Page flow
                let oPageModel = new JSONModel();
                let oPageFlow = {
                    "infoRequest": false,
                    "infoConfirm": false,
                    "corporate": false,
                    "shareholder": false,
                    // "shareholder": true,
                    "complete": false
                };
                oPageModel.setProperty("/pageFlow", oPageFlow);
                this.getView().setModel(oPageModel, "PageModel");

                //F4
                let oF4Model = new JSONModel();
                oF4Model.setProperty("/shareholder", {
                    "count": 1
                });
                
                let oBusinessNatureRead = await Models.getBusinessNature();
                let aBusinessNature;
                if (oBusinessNatureRead.response.value) {
                    aBusinessNature = oBusinessNatureRead.response.value.businessNature.value;
                }
                oF4Model.setProperty("/businessNature", aBusinessNature);

                this.getView().setModel(oF4Model, "F4");
                this.onChangeShareCount();
    
                //File
                let oFileModel = new JSONModel();
                for (let i = 1; i <= 2; i++) {
                    oFileModel.setProperty("/file" + i, {
                        // "fileID": null,
                        "fileName": null,
                        "fileType": null,
                        "fileData": null,
                        "uploadVisible": true,
                        "fileVisible": false,
                    });
                }
    
                //Set model
                this.getView().setModel(oFileModel, "FileModel");

                // Get select key request info
                let oPageInfoModel = new JSONModel();
                let vSAPCustomer, vAcceptCard;
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                if (oSupplier !== undefined) {
                    if (oSupplier.SAPCustomer === "true") {
                        vSAPCustomer = "true";
                    } else if (oSupplier.SAPCustomer === "false") {
                        vSAPCustomer = "false";
                    } else if (oSupplier.SAPCustomer === null) {
                        vSAPCustomer = "true";
                    }

                    if (oSupplier.status === null || oSupplier.status === "Sent") {
                        vAcceptCard = "false";
                    } else {
                        vAcceptCard = "true";
                    }

                    let oSupplierInfo = {
                        "SAPCustomer": vSAPCustomer,
                        "acceptCard": vAcceptCard
                    };
                    oPageInfoModel.setProperty("/requestInfo", oSupplierInfo);
                    this.getView().setModel(oPageInfoModel, "RequestInfo");

                    this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", true);
                } else {
                    let oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Supplier", {
                        GUID: "NotFound"
                    });
                }
            },
            _onObjectMatched: function (oEvent) {
                this._onInit();
            },

            _updateSupplier: async function (sMessage) {
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                delete oSupplier["@odata.context"];
                delete oSupplier["createdAt"];
                delete oSupplier["createdBy"];
                delete oSupplier["modifiedAt"];
                delete oSupplier["modifiedBy"];
                delete oSupplier["countryCode_code"];
                delete oSupplier["businessNature_selectKey"];

                let vID = oSupplier.ID;
                delete oSupplier["ID"];
                
                let oParameter = {
                    "pID": vID,
                    "oSupplier": oSupplier
                };
                let oSupplierUpdate = await Models.updateSupplier(oParameter);
                if (Object.keys(oSupplierUpdate.catchError).length === 0 &&
                    oSupplierUpdate.catchError.constructor === Object) {
                    if (oSupplierUpdate.response.error) {
                        // Error
                        let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError code ${oSupplierUpdate.response.error.code}`;
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
                    let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError catched`;
                    // MessageToast.show(msgError);
                }
            }
        });
    });
