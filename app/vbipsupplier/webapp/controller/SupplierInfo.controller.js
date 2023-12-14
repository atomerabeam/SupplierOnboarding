sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Models, MessageToast, formatter, MessageBox) {
        "use strict";
        var vbipRequestId;
        return Controller.extend("vbipsupplier.controller.SupplierInfo", {
            formatter: formatter,
            onInit: function () {
                // this._onInit();
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("SupplierInfo").attachPatternMatched(this._onObjectMatched, this);

                this.getView().addEventDelegate({
                    onBeforeShow: this.onBeforeShow,
                }, this);
            },

            onBeforeShow: function () {
                // Page flow
                let oPageModel = new JSONModel();
                let oPageFlow = {
                    "infoRequest": false,
                    "infoConfirm": false,
                    "corporate": false,
                    "shareholder": false,
                    "complete": false
                };
                oPageModel.setProperty("/pageFlow", oPageFlow);
                this.getView().setModel(oPageModel, "PageModel");

                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                if (!oSupplier) {
                    let oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Supplier", {
                        GUID: "NotFound"
                    });
                }
            },

            onContinue: async function () {
                let vAcceptCard = this.getView().byId("idAcceptCard.Select").getSelectedKey();
                if (vAcceptCard === "true") {
                    let vReturnCode = await this._submitSupplier("message");
                    if (vReturnCode === "Success") {
                        await this._updateSupplier("noMessage", "CAC", false, false);
                        await this._updateSupplierB1("noMessage");
                    }
                    // this.getView().getModel("PageModel").setProperty("/pageFlow/complete", true);
                    // this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                } else {
                    let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                    let oBuyer = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyer");
                    if (oSupplier.countryCode_code === oBuyer.countryCode_code) {
                        this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", true);
                        this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                    } else {
                        const sMessageTitle = "Cannot be onboarded";
                        const sMessage = `As your country is different from Buyer's country, and you are not accepting card payments.\n
                                          Cannot continue the process, please contact to VISA about this case`;

                        let callback = async function (oAction) {

                            await this._updateSupplier("noMessage", "NOB", false, false);
                            await this.getOwnerComponent().getModel("SupplierInfo").destroy();
                            await this._endSession();
                        }.bind(this)
                        this.showErrorMessageBox(sMessageTitle, sMessage, callback)
                    }
                }

            },
            onConfirmInfo: function () {
                // this._setDefaultF4();
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", true);
            },
            onContinueStep1: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", true);
            },
            onSubmit: async function () {
                let vReturnCode = await this._submitSupplier("message");
                if (vReturnCode === "Success") {
                    await this._updateSupplier("noMessage", "SUB", true, true);
                }
                
            },
            onReportInfo: function () {
                const sMessageTitle = this.getOwnerComponent().getModel("i18n").getProperty("reportInfoMessageTitle")
                let sBuyerName = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyer/legalName")
                const sMessage = this.getOwnerComponent().getModel("i18n").getProperty("reportInfoMessage").replaceAll("[Buyer]", sBuyerName)
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                let oParameter = {
                    "sBuyerID": oSupplier.buyerID,
                    "sSupplierID": oSupplier.supplierID
                }
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");

                let callback = async function (oAction) {
                    if (oAction == "OK") {
                        let oResponse = await Models.reportInfo(oParameter, sAuthToken)
                        if (oResponse.ok) {
                            this._endSession();
                        } else {
                            MessageToast.show(`Failed to update, please try again`)
                        }
                    } else {
                        MessageToast.show(`Action is cancelled by user`)
                    }
                }.bind(this)
                this.showErrorMessageBox(sMessageTitle, sMessage, callback);

            },
            onSaveAndExit: async function () {
                let vReturnCode = await this._updateSupplier("message", "SAV", true, true);
                if (vReturnCode === "Success") {
                    this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", false);
                    this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                    this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", true);
                }
                
            },

            showErrorMessageBox: function (title, errorMessage, callback) {
                MessageBox.error(errorMessage, {
                    title: title,
                    actions: [sap.m.MessageBox.Action.OK],
                    onClose: callback
                });
            },
            onChangeAcceptCard: function () {
                let vAcceptCard = this.getView().byId("idAcceptCard.Select").getSelectedKey();

                if (vAcceptCard.toLowerCase() === "true") {
                    this.getView().getModel("RequestInfo").setProperty("/requestInfo/infoBoxVisible", false);
                } else {
                    this.getView().getModel("RequestInfo").setProperty("/requestInfo/infoBoxVisible", true);
                }
            },

            onChangeBusinessNature: async function () {
                let vBusinessNature = parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());
                if (isNaN(vBusinessNature)) {
                    vBusinessNature = 1;
                }

                let vCount;
                let aDocument = this.getView().getModel("DocumentModel").getProperty("/docKeys");
                if (vBusinessNature === 1) {
                    vCount = 4;
                    aDocument = [1, 2, 3];
                } else if (vBusinessNature === 2) {
                    vCount = 6;
                    aDocument = [1, 6];
                } else if (vBusinessNature === 3) {
                    vCount = 1;
                    aDocument = [7, 8, 9];
                } else {
                    vCount = 4;
                    aDocument = [1, 2, 3];
                }

                let aShareholderCount = [];
                for (let i = 1; i <= vCount; i++) {
                    aShareholderCount.push({
                        "count": i
                    });
                }

                for (let i = 1; i <= 9; i++) {
                    let oDocumentItem = this.getView().getModel("DocumentModel").getProperty("/doc" + i);
                    if (aDocument.includes(i)) {
                        oDocumentItem.visible = true;
                    } else {
                        oDocumentItem.visible = false;
                    }
                    this.getView().getModel("DocumentModel").setProperty("/doc" + i, oDocumentItem);
                }

                this.getView().getModel("DocumentModel").setProperty("/docKeys", aDocument);
                this.getView().getModel("F4").setProperty("/shareholderItem", aShareholderCount);

                
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");
                let oParam = {
                    "pCountry": oSupplier.countryCode_code,
                    "pBusinessNature": vBusinessNature.toString()
                }
                let oDocType = await Models.getDocumentType(oParam, sAuthToken);
                    let aDocType;
                    if (oDocType.response.value) {
                        aDocType = oDocType.response.value.documentType.value;
                    }
                
                this.getView().getModel("F4").setProperty("/docType", aDocType);
            },
            onInitShareCount: async function () {
                let oShareholderModel = new JSONModel;
                this.getView().setModel(oShareholderModel, "ShareholderModel");
                
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");

                // let vShareholderCount = this.getView().getModel("F4").getProperty("/shareholderCount");
                let vShareholderCount = parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());
                if (vShareholderCount === null) {
                    vShareholderCount = 1;
                }

                let aShareholder = [];
                for (let i = 0; i <= (vShareholderCount - 1); i++) {
                    let oDocNum = {
                        "sValue": oSupplier?.shareholderDetails[i]?.shareholderDocuments[0]?.documentNumber,
                    };
                    let oDocNumDecrypt = await Models.decryptString(oDocNum, sAuthToken); 

                    let oDateofBirth, oIssuingDate, oExpireDate;
                    let vDateOfBirth = oSupplier?.shareholderDetails[i]?.shareholderDocuments[0].dateOfBirth;

                    if (vDateOfBirth !== null && vDateOfBirth !== undefined) {
                        let oDOB = {
                            "sValue": vDateOfBirth,
                        };
                        let oDOBDecrypt = await Models.decryptString(oDOB, sAuthToken); 
                        vDateOfBirth = oDOBDecrypt?.response?.value;
                        vDateOfBirth = vDateOfBirth + `T00:00:00.000Z`;
                        oDateofBirth = new Date(vDateOfBirth);
                    }
                    
                    let vIssuingDate = oSupplier?.shareholderDetails[i]?.shareholderDocuments[0].issuingDate;
                    if (vIssuingDate !== null) {
                        vIssuingDate = vIssuingDate + `T00:00:00.000Z`;
                        oIssuingDate = new Date(vIssuingDate);
                    }
                    
                    let vExpiryDate = oSupplier?.shareholderDetails[i]?.shareholderDocuments[0].expiryDate;
                    if (vExpiryDate !== null) {
                        vExpiryDate = vExpiryDate + `T00:00:00.000Z`;
                        oExpireDate = new Date(vExpiryDate);
                    }
                    
                    let vEnterInfo, vCompleted;
                    if (oSupplier?.shareholderDetails[i]?.shareholderName &&
                        oSupplier?.shareholderDetails[i]?.sharePercentage ) {
                        vEnterInfo = false;
                        vCompleted = true;
                    } else {
                        vEnterInfo = true;
                        vCompleted = false;
                    }
                    aShareholder.push({
                        "enterInfo": vEnterInfo,
                        "completed": vCompleted,
                        "name": oSupplier?.shareholderDetails[i]?.shareholderName,
                        "sharePercentage": oSupplier?.shareholderDetails[i]?.sharePercentage,
                        "address": "",
                        "docType": oSupplier?.shareholderDetails[i]?.shareholderDocuments[0]?.documentType,
                        "docNum": oDocNumDecrypt?.response?.value,
                        "nameOnDoc": oSupplier?.shareholderDetails[i]?.shareholderDocuments[0]?.nameOnDocument,
                        "dateOfBirth": oDateofBirth,
                        "issuingDate": oIssuingDate,
                        "expiryDate": oExpireDate,
                        "fileName": oSupplier?.shareholderDetails[i]?.shareholderDocuments[0]?.fileName,
                        "fileType": oSupplier?.shareholderDetails[i]?.shareholderDocuments[0]?.fileType,
                        "fileData": oSupplier?.shareholderDetails[i]?.shareholderDocuments[0]?.encodedContent,
                        "uploadVisible": true,
                        "fileVisible": false,
                    });
                }
                this.getView().getModel("ShareholderModel").setProperty("/item", aShareholder);
            },
            onChangeShareCount: async function () {
                let aShareholder = this.getView().getModel("ShareholderModel").getProperty("/item");
                let vShareholderCount = parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());
                if (vShareholderCount === null) {
                    vShareholderCount = 1;
                }

                if (vShareholderCount < aShareholder.length) {
                    while (vShareholderCount < aShareholder.length) {
                        aShareholder.pop();
                    }
                } else if (vShareholderCount > aShareholder.length) {
                    while (aShareholder.length < vShareholderCount) {
                        // let oDateofBirth, oIssuingDate, oExpireDate;
                        aShareholder.push({
                            "enterInfo": true,
                            "completed": false,
                            "name": "",
                            "sharePercentage": "",
                            "address": "",
                            "docType": "",
                            "docNum": "",
                            "nameOnDoc": "",
                            "dateOfBirth": undefined,
                            "issuingDate": undefined,
                            "expiryDate": undefined,
                            "fileName": "",
                            "fileType": "",
                            "fileData": "",
                            "uploadVisible": true,
                            "fileVisible": false,
                        });
                    }
                }
                this.getView().getModel("ShareholderModel").setProperty("/item", aShareholder);
            },
            onUploadFileButton: async function (oEvent) {
                
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let strID = oEvent.getParameter("id");
                let docID = strID.split("idUploadFile")[1].split(".Button")[0];
                let allowedTypes = ['image/png', 'application/pdf', 'image/jpeg', 'image/gif'];
                let input = document.createElement("input"); // Create input element
                input.type = "file"; // Important to be type File
                input.multiple = false // Alow only one file at a time
                input.accept = "image/*" // Only accept image file
                let fileInfo;
                input.onchange = async function () {
                    await sap.ui.core.BusyIndicator.show();
                    let file = input.files; // get the file
                    fileInfo = file;
                    for (let i = 0; i < file.length; i++) {
                        if (allowedTypes.includes(file[i].type)) {
                            let data = file[i]
                            let dataArr = await data.arrayBuffer()
                            let textData = await data.text()
                            var bytes = new Uint8Array(dataArr);
                            var len = bytes.byteLength;
                            var base64 = "";
                            for (let i = 0; i < len; i++) {
                                base64 += String.fromCharCode(bytes[i]);
                            }
                            base64 = btoa(base64);
                            let oFileCheck = { "fileContent": base64 };
                            let isMalwareDetected = await Models.checkMalware(oFileCheck, sAuthToken);
                            if (isMalwareDetected === "true") {
                                let msgError = "Malware is detected";
                                MessageToast.show(msgError);
                            } else {
                                let oDocument = this.getView().getModel("DocumentModel").getProperty("/doc" + docID);
                                oDocument.fileName = fileInfo[0].name;
                                oDocument.fileType = fileInfo[0].type;
                                oDocument.fileData = base64;
                                oDocument.uploadVisible = false;
                                oDocument.fileVisible = true;
                                this.getView().getModel("DocumentModel").setProperty("/doc" + docID, oDocument);
                                this.onCheckComplete();
                            }
                        } else {
                            this.showErrorMessageBox('Error', 'Invalid file type. Please select a PNG, PDF, or JPEG file.', null);
                        }
                    }
                    await sap.ui.core.BusyIndicator.hide();
                }.bind(this)

                input.click();
                
            },
            onDeleteFileButton: async function (oEvent) {
                //File Number
                let strID = oEvent.getParameter("id");
                let docID = strID.split("idDeleteFile")[1].split(".Icon")[0];

                let oDocument = this.getView().getModel("DocumentModel").getProperty("/doc" + docID);
                oDocument.fileName = null;
                oDocument.fileType = null;
                oDocument.fileData = null;
                oDocument.uploadVisible = true;
                oDocument.fileVisible = false;

                this.getView().getModel("DocumentModel").setProperty("/doc" + docID, oDocument);
                this.onCheckComplete();

            },
            onDownloadFileButton: async function (oEvent) {
                //File Number
                let strID = oEvent.getParameter("id");
                let docID = strID.split("idDownloadFile")[1].split(".Icon")[0];

                //File
                let oDocument = this.getView().getModel("DocumentModel").getProperty("/doc" + docID);

                const downloadLink = document.createElement("a");
                let MimeType = oDocument.fileType;
                downloadLink.href = "data:" + MimeType + ";base64," + oDocument.fileData; //base64 file content
                downloadLink.download = oDocument.fileName;
                // Trigger the download
                downloadLink.click();
            },
            onUploadFileSH: async function () {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let oShareholderPopup = this.getView().getModel("ShareholderPopupModel").getProperty("/popup");
                let allowedTypes = ['image/png', 'application/pdf', 'image/jpeg', 'image/gif'];
                let input = document.createElement("input"); // Create input element
                input.type = "file"; // Important to be type File
                input.multiple = false // Alow only one file at a time
                input.accept = "image/*" // Only accept image file
                let fileInfo;
                let base64;
                input.onchange = async function () {
                    await sap.ui.core.BusyIndicator.show();
                    let file = input.files; // get the file
                    fileInfo = file;
                    for (let i = 0; i < file.length; i++) {
                        if (allowedTypes.includes(file[i].type)) {
                            let data = file[i]
                            let dataArr = await data.arrayBuffer()
                            let textData = await data.text()
                            let bytes = new Uint8Array(dataArr);
                            let len = bytes.byteLength;
                            for (let i = 0; i < len; i++) {
                                base64 += String.fromCharCode(bytes[i]);
                            }
                            base64 = btoa(base64);
                            let oFileCheck = { "fileContent": base64 };
                            let isMalwareDetected = await Models.checkMalware(oFileCheck, sAuthToken);
                            if (isMalwareDetected === "true") {
                                let msgError = "Malware is detected";
                                MessageToast.show(msgError);
                            } else {
                                oShareholderPopup.fileName = fileInfo[0].name;
                                oShareholderPopup.fileType = fileInfo[0].type;
                                oShareholderPopup.fileData = base64;
                                oShareholderPopup.uploadVisible = false;
                                oShareholderPopup.fileVisible = true;
                                this.getView().getModel("ShareholderPopupModel").setProperty("/popup", oShareholderPopup);
                            }
                        } else {
                            this.showErrorMessageBox('Error', 'Invalid file type. Please select a PNG, PDF, or JPEG file.', null);
                        }
                    }
                    
                    await sap.ui.core.BusyIndicator.hide();
                }.bind(this)

                input.click();
            },
            onDeleteFileSH: async function (oEvent) {
                let oShareholderPopup = this.getView().getModel("ShareholderPopupModel").getProperty("/popup");

                oShareholderPopup.fileName = null;
                oShareholderPopup.fileType = null;
                oShareholderPopup.fileData = null;
                oShareholderPopup.uploadVisible = true;
                oShareholderPopup.fileVisible = false;
                this.getView().getModel("ShareholderPopupModel").setProperty("/popup", oShareholderPopup);
            },
            onDownloadFileSH: async function (oEvent) {
                let oShareholderPopup = this.getView().getModel("ShareholderPopupModel").getProperty("/popup");

                const downloadLink = document.createElement("a");
                downloadLink.href = "data:" + oShareholderPopup.fileType + ";base64," + oShareholderPopup.fileData; //base64 file content
                downloadLink.download = oShareholderPopup.fileName;
                // Trigger the download
                downloadLink.click();
            },
            onEnterShareholderPopup: function (oEvent) {
                let oBinding = oEvent.getSource().getBindingContext("ShareholderModel");
                let oCurrentItem = this.getView().getModel("ShareholderModel").getProperty(oBinding.getPath());
                oCurrentItem.path = oBinding.getPath();

                let oShareholderPopupModel = new JSONModel;
                oShareholderPopupModel.setProperty("/popup", oCurrentItem);
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
                let oShareholderPopup = this.getView().getModel("ShareholderPopupModel").getProperty("/popup");
                let vEnterInfo, vCompleted;
                if (oShareholderPopup.name.trim().length > 0 && 
                    oShareholderPopup.sharePercentage.trim().length > 0 ) {
                    vEnterInfo = false;
                    vCompleted = true;
                } else {
                    vEnterInfo = true;
                    vCompleted = false;
                }

                let vUpload, vFile;
                if (oShareholderPopup.fileName) {
                    vUpload = false;
                    vFile = true;
                } else {
                    vUpload = true;
                    vFile = false;
                }
                let oShareholder = {
                    "path": oShareholderPopup.path,
                    "enterInfo": vEnterInfo,
                    "completed": vCompleted,
                    "name": oShareholderPopup.name,
                    "sharePercentage": oShareholderPopup.sharePercentage,
                    "address": oShareholderPopup.address,
                    "docType": oShareholderPopup.docType,
                    "docNum": oShareholderPopup.docNum,
                    "nameOnDoc": oShareholderPopup.nameOnDoc,
                    "dateOfBirth": oShareholderPopup.dateOfBirth,
                    "issuingDate": oShareholderPopup.issuingDate,
                    "expiryDate": oShareholderPopup.expiryDate,
                    "fileName": oShareholderPopup.fileName,
                    "fileType": oShareholderPopup.fileType,
                    "fileData": oShareholderPopup.fileData,
                    "uploadVisible": vUpload,
                    "fileVisible": vFile,
                };
                // let sPath = this.getView().getModel("ShareholderPopupModel").getProperty("/popup/path");

                this.getView().getModel("ShareholderModel").setProperty(`${oShareholderPopup.path}`, oShareholder);

                this.onDialogAfterClose();
            },
            onCancel: function () {
                this.onDialogAfterClose();
            },
            onBackButtonPress: function (oEvent) {
                const btnId = oEvent.getSource().getId()
                const onPage = btnId.split(".")[2]
                console.log(onPage)
                switch (onPage) {
                    case "InfoConfirm":
                        this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", false);
                        this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", true);
                        break;
                    case "Corporate":
                        this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", false);
                        this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", true);
                        break;
                    case "Shareholder":
                        this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                        this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", true);
                        break;
                    default:
                        break;
                }
            },
            onCheckComplete: function () {
                for (let i = 1; i <= 9; i++) {
                    let oDocument = this.getView().getModel("DocumentModel").getProperty("/doc" + i);
                    if (oDocument.nameOnDocument !== "" &&
                        oDocument.documentNumber !== "" &&
                        oDocument.fileName !== null) {
                        //Set true if these fields have values
                        this.getView().getModel("DocumentModel").setProperty("/doc" + i + "/checked", true);
                    } else {
                        this.getView().getModel("DocumentModel").setProperty("/doc" + i + "/checked", false);
                    }
                }
            },

            _onInit: async function () {
                let sAuthToken = ""
                // Page flow
                let oPageModel = new JSONModel();
                let oPageFlow = {
                    "infoRequest": false,
                    "infoConfirm": false,
                    "corporate": false,
                    "shareholder": false,
                    "complete": false
                };
                oPageModel.setProperty("/pageFlow", oPageFlow);
                this.getView().setModel(oPageModel, "PageModel");

                //Document
                let oDocumentModel = new JSONModel();
                for (let i = 1; i <= 9; i++) {
                    oDocumentModel.setProperty("/doc" + i, {
                        "visible": false,
                        "nameOnDocument": null,
                        "documentNumber": null,
                        "fileName": null,
                        "fileType": null,
                        "fileData": null,
                        "uploadVisible": true,
                        "fileVisible": false,
                    });
                }
                oDocumentModel.setProperty("/docKeys", []);

                //Set model
                this.getView().setModel(oDocumentModel, "DocumentModel");

                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                // Get select key request info
                let oPageInfoModel = new JSONModel();

                //F4
                let oF4Model = new JSONModel();

                let vSAPCustomer, vAcceptCard, vInfoBoxVisible;
                if (oSupplier !== undefined) {
                    sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");
                    let oBusinessNatureRead = await Models.getBusinessNature(sAuthToken);
                    let aBusinessNature;
                    if (oBusinessNatureRead.response.value) {
                        aBusinessNature = oBusinessNatureRead.response.value.businessNature.value;
                    }
                    oF4Model.setProperty("/businessNature", aBusinessNature);
                    if (oSupplier.SAPCustomer === "true") {
                        vSAPCustomer = "true";
                    } else if (oSupplier.SAPCustomer === "false") {
                        vSAPCustomer = "false";
                    } else if (oSupplier.SAPCustomer === null) {
                        vSAPCustomer = "true";
                    }

                    let vShareholderCount = oSupplier.shareholderCount;
                    if (vShareholderCount === null) {
                        vShareholderCount = 1;
                    }
                    oF4Model.setProperty("/shareholderCount", vShareholderCount);
                    this.getView().setModel(oF4Model, "F4");

                    if (oSupplier.status === "CAC") {
                        vAcceptCard = "true";
                        vInfoBoxVisible = false;
                    } else {
                        vAcceptCard = "false";
                        vInfoBoxVisible = true;
                    }

                    let oSupplierInfo = {
                        "SAPCustomer": vSAPCustomer,
                        "acceptCard": vAcceptCard,
                        "infoBoxVisible": vInfoBoxVisible,
                    };
                    oPageInfoModel.setProperty("/requestInfo", oSupplierInfo);
                    this.getView().setModel(oPageInfoModel, "RequestInfo");

                    this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", true);

                    let aDocument = oSupplier.supplierDocuments;
                    for (let i = 0; i <= (aDocument.length - 1); i++) {

                        let oFile = {
                            "ID": oSupplier.supplierID,
                            "fileContent": aDocument[i].encodedContent
                        };
                        let oFileDecrypt = await Models.decryptFile(oFile, sAuthToken);
                        
                        let oDocNum = {
                            "sValue": aDocument[i].documentNumber,
                        };
                        let oDocNumDecrypt = await Models.decryptString(oDocNum, sAuthToken);

                        let vUploadVisible, vFileVisible;
                        if (aDocument[i].fileName) {
                            vUploadVisible = false;
                            vFileVisible = true;
                        } else {
                            vUploadVisible = true;
                            vFileVisible = false;
                        }

                        let oDocumentItem = {
                            "visible": true,
                            "nameOnDocument": aDocument[i].nameOnDocument,
                            "documentNumber": oDocNumDecrypt.response.value,
                            "fileName": aDocument[i].fileName,
                            "fileType": aDocument[i].fileType,
                            "fileData": oFileDecrypt.response.value,
                            "uploadVisible": vUploadVisible,
                            "fileVisible": vFileVisible,
                        };

                        this.getView().getModel("DocumentModel").setProperty("/doc" + aDocument[i].documentKey, oDocumentItem);
                    }

                    this.onCheckComplete();
                } else {
                    let oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Supplier", {
                        GUID: "NotFound"
                    });
                }

                await this.onChangeBusinessNature();
                await this.onInitShareCount();
            },
            _setDefaultF4: async function () {
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                if (oSupplier !== undefined) {

                    if (oSupplier.shareholderCount === null) {
                        oSupplier.shareholderCount = 1;
                    }
                    if (oSupplier.businessNature_selectKey === null) {
                        oSupplier.businessNature_selectKey = 1;
                    }
                }
            },
            _onObjectMatched: function (oEvent) {
                this._onInit();
            },
            _updateSupplier: async function (sMessage, vStatus, vBizNature, vSHCount) {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                // let aShareholder = this.getView().getModel("ShareholderModel").getProperty("/item");
                // aShareholder.forEach((element) => element.sharePercentage = parseInt(element.sharePercentage));

                // Document
                let aDocumentKey = this.getView().getModel("DocumentModel").getProperty("/docKeys");
                let aSupplierDocument = [];

                let vBusinessNature, vShareholderCount;
                let aShareholder = [];

                if (vBizNature === true) {
                    vBusinessNature = parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());

                    for (let i = 0; i <= (aDocumentKey.length - 1); i++) {
                        let oDocumentItem = this.getView().getModel("DocumentModel").getProperty("/doc" + aDocumentKey[i]);

                        let oFile = {
                            "ID": oSupplier.supplierID,
                            "fileContent": oDocumentItem.fileData
                        };
                        let oFileEncrypt = await Models.encryptFile(oFile, sAuthToken);
                        
                        let oDocNum = {
                            "sValue": oDocumentItem.documentNumber,
                        };
                        let oDocNumEncrypt = await Models.encryptString(oDocNum, sAuthToken);

                        aSupplierDocument.push({
                            "documentName": "doc" + aDocumentKey[i],
                            "documentType": aDocumentKey[i].toString(),
                            "documentKey": aDocumentKey[i].toString(),
                            "nameOnDocument": oDocumentItem.nameOnDocument,
                            "documentNumber": oDocNumEncrypt.response.value,
                            "fileName": oDocumentItem.fileName,
                            "fileType": oDocumentItem.fileType,
                            "encodedContent": oFileEncrypt.response.value
                        });
                    }
                } else {
                    vBusinessNature = null;
                }

                if (vSHCount === true) {
                    vShareholderCount = parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());
                    for (let i = 0; i <= (vShareholderCount - 1); i++) {
                        let oShareholder = this.getView().getModel("ShareholderModel").getProperty("/item/" + i);
                        if (oShareholder) {
                            let oFile = {
                                "ID": oSupplier.supplierID,
                                "fileContent": oShareholder.fileData
                            };
                            let oFileEncrypt = await Models.encryptFile(oFile, sAuthToken);

                            let vDateOfBirth, vIssuingDate, vExpiryDate;
                            vDateOfBirth = oShareholder?.dateOfBirth?.toISOString()?.split("T")[0];
                            vIssuingDate = oShareholder?.issuingDate?.toISOString()?.split("T")[0];
                            vExpiryDate = oShareholder?.expiryDate?.toISOString()?.split("T")[0];

                            let oDOBEncrypt;
                            if (vDateOfBirth !== undefined) {
                                let oDOB = {
                                    "sValue": vDateOfBirth,
                                };
                                oDOBEncrypt = await Models.encryptString(oDOB, sAuthToken);
                                vDateOfBirth = oDOBEncrypt.response.value;
                            }
                            // if (oShareholder.dateOfBirth !== null) {
                            //     if (!isNaN(oShareholder.dateOfBirth.getDate())) {
                            //         vDateOfBirth = oShareholder?.dateOfBirth?.toISOString()?.split("T")[0];
                            //     }
                            // }
                            
                            // if (!isNaN(oShareholder.issuingDate.getDate())) {
                            //     vIssuingDate = oShareholder?.issuingDate?.toISOString()?.split("T")[0];
                            // }
                            
                            // if (!isNaN(oShareholder.expiryDate.getDate())) {
                            //     vExpiryDate = oShareholder?.expiryDate?.toISOString()?.split("T")[0];
                            // }
                            let oDocNum = {
                                "sValue": oShareholder.docNum,
                            };
                            let oDocNumEncrypt = await Models.encryptString(oDocNum, sAuthToken);

                            aShareholder.push({
                                "shareholderName": oShareholder.name,
                                "sharePercentage": parseInt(oShareholder.sharePercentage),
                                "shareholderDocuments":
                                    [
                                        {
                                            "documentType": oShareholder.docType,
                                            "documentKey": i.toString(),
                                            "nameOnDocument": oShareholder.nameOnDoc,
                                            "documentNumber": oDocNumEncrypt.response.value,
                                            "fileName": oShareholder.fileName,
                                            "fileType": oShareholder.fileType,
                                            "encodedContent": oFileEncrypt.response.value,
                                            "dateOfBirth": vDateOfBirth,
                                            "issuingDate": vIssuingDate,
                                            "expiryDate": vExpiryDate,
                                        }
                                    ]
                            });
                        }
                    }
                } else {
                    vShareholderCount = null;
                }

                let oSupplierData = {
                    "requestID": vbipRequestId,
                    "status": vStatus,
                    "SAPCustomer": (this.getView().byId("idSAPCustomer.Select").getSelectedKey().toLowerCase() === 'true'),
                    "businessRegNum": oSupplier.businessRegNum,
                    "businessNature_selectKey": vBusinessNature,
                    "shareholderCount": vShareholderCount,
                    "supplierDocuments": aSupplierDocument,
                    "shareholderDetails": aShareholder
                };

                let oParameter = {
                    "buyerID": oSupplier.buyerID,
                    "supplierID": oSupplier.supplierID,
                    "oSupplier": oSupplierData
                };

                await sap.ui.core.BusyIndicator.show();
                let oSupplierUpdate = await Models.updateSupplier(oParameter, sAuthToken);
                let sShowMessage, vReturnCode;
                if (Object.keys(oSupplierUpdate.catchError).length === 0 &&
                    oSupplierUpdate.catchError.constructor === Object) {
                    if (oSupplierUpdate.response.error) {
                        // Error
                        sShowMessage = `Operation failed Supplier ${oSupplier.supplierID} \nError code ${oSupplierUpdate.response.error.code}`;
                        
                    } else {
                        // Success
                        sShowMessage = `Supplier ${oSupplier.supplierID} information is update`;
                        vReturnCode = "Success"
                        // Exit
                    }
                } else {
                    // Catch error
                    sShowMessage = `Operation failed Supplier ${oSupplier.supplierID} \nError catched`;
                }
                if (sMessage === "message") {
                    MessageToast.show(sShowMessage);
                }
                
                await sap.ui.core.BusyIndicator.hide();
                return vReturnCode;
            },
            _updateSupplierB1: async function (sMessage) {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
                let oBuyerOnboarding = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyerOnboarding");
                let oVBIP = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");

                let oParameter = {
                    "supplierID": oSupplier.visaSupplierID,
                    "vbipID": oVBIP.vbipID,
                    "companyCode": oBuyerOnboarding.companyCode
                };

                let oSupplierUpdate = await Models.updateSupplierB1(oParameter, sAuthToken);
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
            },
            _submitSupplier: async function (sMessage) {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                let vAcceptCard = (this.getView().byId("idAcceptCard.Select").getSelectedKey().toLowerCase() === 'true');

                let vBusinessNature, iAddressDoc;
                if (oSupplier.businessNature_selectKey == 1) {
                    vBusinessNature = "COMPANY";
                    iAddressDoc = 1;
                } else if (oSupplier.businessNature_selectKey == 2) {
                    vBusinessNature = "PARTNERSHIP";
                    iAddressDoc = 6;
                } else if (oSupplier.businessNature_selectKey == 3) {
                    vBusinessNature = "INDIVIDUAL";
                    iAddressDoc = 9;
                }
                
                let sTime = Math.round(new Date().getTime() / 1000);
                vbipRequestId = oSupplier.buyerID + oSupplier.supplierID + sTime;
                let oCountry = await Models.get3DigitCountry(oSupplier.countryCode_code, sAuthToken)
                let oSupplierOnboarding = {
                    "vbipRequestId": vbipRequestId,
                    "businessNature": vBusinessNature,
                    "shareHolderCount": oSupplier.businessNature_selectKey == 3 ? 0 : parseInt(oSupplier.shareholderCount),
                    "isCardAcceptor": vAcceptCard,
                    "buyerId": oSupplier.buyerID,
                    "supplierInfo": {
                        "supplierId": oSupplier.visaSupplierID,
                        "firstName": oSupplier.firstName,
                        "lastName": oSupplier.lastName,
                        "legalName": oSupplier.supplierName,
                        "emailAddress": oSupplier.emailID,
                        "mobileNumberCountryCode": oSupplier.mobileCountryCode,
                        "mobileNumber": oSupplier.mobileNumber,
                        // "website": "",
                        "completeAddress": oSupplier.completeAddress,
                        "zipCode": oSupplier.zipCode,
                        "countryCode": oCountry.Code3,
                        // "countryCode": "IND",
                        "city": oSupplier.city,
                        "state": oSupplier.state,
                        // "companyAdditionalEmailAddress": ""
                    }
                }

                let aShareholder = [];
                let oAddressProof = this.getView().getModel("DocumentModel").getProperty("/doc" + iAddressDoc);
                if (vAcceptCard === false) {

                    // Document
                    let aDocument = this.getView().getModel("DocumentModel").getProperty("/docKeys");
                    let aSupplierDocument = [];
                    let oShareholderDocument = {}; // Document proof for shareholder

                    for (let i = 0; i <= (aDocument.length - 1); i++) {
                        let oDocumentItem = this.getView().getModel("DocumentModel").getProperty("/doc" + aDocument[i]);
                        if (i == 0) {
                            oShareholderDocument = oDocumentItem;
                        }
                        // let oFile = {
                        //     "ID": oSupplier.supplierID,
                        //     "fileContent": oDocumentItem.fileData
                        // };
                        // let oFileEncrypt = await Models.decryptFile(oFile, sAuthToken);

                        let sDocumentName = this.getOwnerComponent().getModel("i18n").getProperty("documentName" + aDocument[i]);
                        aSupplierDocument.push({
                            "documentName": sDocumentName,
                            "nameOnDocument": oDocumentItem.nameOnDocument,
                            "documentNumber": oDocumentItem.documentNumber,
                            "fileName": oDocumentItem.fileName,
                            "encodedContent": oDocumentItem.fileData
                        });
                    }


                    let vShareholderCount = parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());

                    for (let i = 0; i <= (vShareholderCount - 1); i++) {
                        let oShareholder = this.getView().getModel("ShareholderModel").getProperty("/item/" + i);
                        
                        let vDateOfBirth, vIssuingDate, vExpiryDate;
                        vDateOfBirth = oShareholder?.dateOfBirth?.toISOString()?.split("T")[0];
                        vIssuingDate = oShareholder?.issuingDate?.toISOString()?.split("T")[0];
                        vExpiryDate = oShareholder?.expiryDate?.toISOString()?.split("T")[0];
                        
                        // if (oShareholder.dateOfBirth !== null) {
                        //     if (!isNaN(oShareholder.dateOfBirth.getDate())) {
                        //         vDateOfBirth = oShareholder?.dateOfBirth?.toISOString()?.split("T")[0];
                        //     }
                        // }
                        
                        // if (!isNaN(oShareholder.issuingDate.getDate())) {
                        //     vIssuingDate = oShareholder?.issuingDate?.toISOString()?.split("T")[0];
                        // }
                        
                        // if (!isNaN(oShareholder.expiryDate.getDate())) {
                        //     vExpiryDate = oShareholder?.expiryDate?.toISOString()?.split("T")[0];
                        // }

                        if (oShareholder) {
                            aShareholder.push({
                                "name": oShareholder.name,
                                "sharePercentage": parseInt(oShareholder.sharePercentage),
                                "identityProof": {
                                    "documentName": oShareholder.docType,
                                    "nameOnDocument": oShareholder.nameOnDoc,
                                    "documentNumber": oShareholder.docNum,
                                    "fileName": oShareholder.fileName,
                                    "encodedContent": oShareholder.fileData,
                                    "dateOfBirth": this.toVisaDateFormat(vDateOfBirth),
                                    "issuingDate": this.toVisaDateFormat(vIssuingDate),
                                    "expiryDate": this.toVisaDateFormat(vExpiryDate)
                                },
                                "documentProof": {
                                    "documentName": "COPY_OF_BUSINESS_REGISTRATION",
                                    "nameOnDocument": oShareholderDocument.nameOnDocument,
                                    "documentNumber": oShareholderDocument.documentNumber,
                                    "fileName": oShareholderDocument.fileName,
                                    "encodedContent": oShareholderDocument.fileData
                                }

                            });
                        }
                    }
                    
                    oSupplierOnboarding.kycDetails = {
                        "addressProof": {
                            "documentName": "COPY_OF_BUSINESS_REGISTRATION",
                            "nameOnDocument": oAddressProof.nameOnDocument,
                            "documentNumber": oAddressProof.documentNumber,
                            "fileName": oAddressProof.fileName,
                            "encodedContent": oAddressProof.fileData
                        },
                        "businessProof": aSupplierDocument,
                        "shareHolderProof": aShareholder
                    };

                    oSupplierOnboarding.supplierBankingInfo = {
                        "accountHolderName": oSupplier.supplierName,
                        "accountNumber": oSupplier.accountNumber,
                        "branchCity": "",
                        "bankCode": oSupplier.bankCode
                    };
                }
                
                if (vBusinessNature === "INDIVIDUAL") {
                    delete oSupplierOnboarding.kycDetails.shareHolderProof;
                    
                    oSupplierOnboarding.kycDetails.identityProof = aShareholder[0].identityProof;
                    oSupplierOnboarding.kycDetails.businessProof = [{
                        "documentName": "COPY_OF_BUSINESS_REGISTRATION",
                        "nameOnDocument": oAddressProof.nameOnDocument,
                        "documentNumber": oAddressProof.documentNumber,
                        "fileName": oAddressProof.fileName,
                        "encodedContent": oAddressProof.fileData,
                        "registrationDate" : "1970-01-01",
                        "expiryDate" : "9999-12-31"
                    }]
                }

                let oParameter = {
                    "oSupplier": oSupplierOnboarding
                };
                let vReturnCode;
                
                await sap.ui.core.BusyIndicator.show();
                let oSupplierSubmit = await Models.submitSupplier(oParameter, sAuthToken);
                if (Object.keys(oSupplierSubmit.catchError).length === 0 &&
                    oSupplierSubmit.catchError.constructor === Object) {
                    if (oSupplierSubmit.response.error) {
                        // Error
                        let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError code ${oSupplierSubmit.response.error.code}`;
                        MessageToast.show(msgError);

                    } else {
                        // Success
                        if (oSupplierSubmit.response.value?.supplier?.errorPayload.length > 0) {
                            let errorMessage;
                            let aErrorPayload = oSupplierSubmit.response.value.supplier.errorPayload;
                            aErrorPayload.forEach((errorPayload) => {
                                if (errorMessage) {
                                    errorMessage +=
                                        "\n " + errorPayload.errorMessage;
                                } else {
                                    errorMessage = errorPayload.errorMessage;
                                }
                            })
                            
                            // MessageBox.error(errorMessage);
                            this.showErrorMessageBox("Response from VISA", errorMessage, null);
                        } else {
                            let msgSuccess = `Supplier ${oSupplier.supplierID} information is submitted`;
                            if (sMessage === "message") {
                                MessageToast.show(msgSuccess);
                            }

                            vReturnCode = "Success";
                            this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                            this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                            this.getView().getModel("PageModel").setProperty("/pageFlow/complete", true);
                        }

                        // Exit
                    }
                } else {
                    // Catch error
                    let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError catched`;
                    MessageToast.show(msgError);
                }
                
                await sap.ui.core.BusyIndicator.hide();
                return vReturnCode;
            },
            _endSession: function () {
                // this.getOwnerComponent().getModel("LandingText").setProperty("/expire", false);
                this.getOwnerComponent().getModel("LandingText").setProperty("/report", true);
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Supplier", {
                    GUID: "Info"
                });
            },

            toVisaDateFormat: function (date) {
                let regex = /^\d{4}-\d{2}-\d{2}$/;
                if (!isNaN(new Date(date).getDate()) && date !== null && regex.test(date) == true) {
                    // return  date.substr(8,2) + '-' + date.substr(5,2) + '-' + date.substr(0,4);
                    return date;
                } else {
                    if (date?.length === 10) {
                        return date.substr(6, 4) + '-' + date.substr(3, 2) + '-' + date.substr(0, 2);
                    }
                }


            },
        });
    });
