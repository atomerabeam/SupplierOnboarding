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

        return Controller.extend("vbipsupplier.controller.SupplierInfo", {
            formatter: formatter,
            onInit: function () {
                // this._onInit();
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("SupplierInfo").attachPatternMatched(this._onObjectMatched, this);
            },
            onContinue: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                let vAcceptCard = this.getView().byId("idAcceptCard.Select").getSelectedKey();
                if (vAcceptCard === "true") {
                    this._updateSupplier("message", "CAC");
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
            onSubmit: function () {
                this._updateSupplier("noMessage", "SUB");
                this._submitSupplier("message");
                this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/complete", true);
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
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let callback = async function (oAction) {
                    if (oAction == "OK") {
                        let oResponse = await Models.reportInfo(oParameter, sAuthToken)
                        if (oResponse.ok) {
                            MessageToast.show(`Successful report information error to ${sBuyerName}`)
                        } else {
                            MessageToast.show(`Failed report information error to ${sBuyerName}`)
                        }
                    }
                }
                this.showErrorMessageBox(sMessageTitle, sMessage, callback)

            },
            onSaveAndExit: async function () {
                this._updateSupplier("message", "Saved");
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", true);
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

            onChangeBusinessNature: function () {
                let vBusinessNature = parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());
                let vCount;
                let aDocument = this.getView().getModel("DocumentModel").getProperty("/docKeys");
                if (vBusinessNature === 1) {
                    vCount = 4;
                    aDocument = [1, 2, 3, 4, 5];
                } else if (vBusinessNature === 2) {
                    vCount = 6;
                    aDocument = [1, 5, 6];
                } else if (vBusinessNature === 3) {
                    vCount = 1;
                    aDocument = [7, 8, 9];
                } else {
                    vCount = 4;
                    aDocument = [1, 2, 3, 4, 5];
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
            },
            onChangeShareCount: function () {
                let oShareholderModel = new JSONModel;
                this.getView().setModel(oShareholderModel, "ShareholderModel");

                let vShareholderCount = this.getView().getModel("F4").getProperty("/shareholderCount");
                let aShareholder = [];
                for (let i = 1; i <= vShareholderCount; i++) {
                    aShareholder.push({
                        "enterInfo": true,
                        "completed": false,
                        "name": "",
                        "sharePercentage": "",
                        "address": "",
                        "docType": "",
                        "docNum": "",
                        "nameOnDoc": "",
                        "dateOfIssue": "",
                        "filename": "",
                        "fileType": "",
                        "fileData": "",
                        "uploadVisible": true,
                        "fileVisible": false,
                    });
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
                            // console.log(dataArr)
                            // console.log(textData)
                            // console.log(base64)
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
                            }
                        } else {
                            this.showErrorMessageBox('Error', 'Invalid file type. Please select a PNG, PDF, or JPEG file.', null);
                        }
                    }

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
            onUploadFileSH: async function (oEvent) {
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
                let oShareholder = {
                    "path": oShareholderPopup.path,
                    "enterInfo": false,
                    "completed": true,
                    "name": oShareholderPopup.name,
                    "sharePercentage": oShareholderPopup.sharePercentage,
                    "address": oShareholderPopup.address,
                    "docType": oShareholderPopup.docType,
                    "docNum": oShareholderPopup.docNum,
                    "nameOnDoc": oShareholderPopup.nameOnDoc,
                    "dateOfIssue": oShareholderPopup.dateOfIssue,
                    "filename": oShareholderPopup.fileName,
                    "fileType": oShareholderPopup.fileType,
                    "fileData": oShareholderPopup.fileData,
                    "uploadVisible": false,
                    "fileVisible": true,
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
                oDocumentModel.setProperty("/docKeys", [1, 2, 3, 4, 5, 6, 7, 8, 9]);

                //Set model
                this.getView().setModel(oDocumentModel, "DocumentModel");

                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                // Get select key request info
                let oPageInfoModel = new JSONModel();

                //F4
                let oF4Model = new JSONModel();
                oF4Model.setProperty("/shareholderCount", oSupplier.shareholderCount);
                this.getView().setModel(oF4Model, "F4");

                let vSAPCustomer, vAcceptCard, vInfoBoxVisible;
                if (oSupplier !== undefined) {
                    sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
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
                        let oDocumentItem = {
                            "visible": true,
                            "nameOnDocument": aDocument[i].nameOnDocument,
                            "documentNumber": aDocument[i].documentNumber,
                            "fileName": aDocument[i].fileName,
                            "fileType": aDocument[i].fileType,
                            "fileData": null,
                            "uploadVisible": false,
                            "fileVisible": true,
                        };

                        this.getView().getModel("DocumentModel").setProperty("/doc" + aDocument[i].documentType, oDocumentItem);
                    }
                } else {
                    let oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Supplier", {
                        GUID: "NotFound"
                    });
                }


                this.onChangeBusinessNature();
                this.onChangeShareCount();
            },
            _onObjectMatched: function (oEvent) {
                this._onInit();
            },
            _updateSupplier: async function (sMessage, vStatus) {
                let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                // let aShareholder = this.getView().getModel("ShareholderModel").getProperty("/item");
                // aShareholder.forEach((element) => element.sharePercentage = parseInt(element.sharePercentage));

                // Document
                let aDocument = this.getView().getModel("DocumentModel").getProperty("/docKeys");
                let aSupplierDocument = [];

                for (let i = 0; i <= (aDocument.length - 1); i++) {
                    let oDocumentItem = this.getView().getModel("DocumentModel").getProperty("/doc" + aDocument[i]);

                    let oFile = {
                        "ID": oSupplier.supplierID,
                        "fileContent": oDocumentItem.fileData
                    };
                    let oFileEncrypt = await Models.encryptFile(oFile, sAuthToken);

                    aSupplierDocument.push({
                        "documentName": "doc" + aDocument[i],
                        "documentType": aDocument[i].toString(),
                        "nameOnDocument": oDocumentItem.nameOnDocument,
                        "documentNumber": oDocumentItem.documentNumber,
                        "fileName": oDocumentItem.fileName,
                        "fileType": oDocumentItem.fileType,
                        "encodedContent": oFileEncrypt.response.value
                    });
                }

                let vShareholderCount = parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());
                let aShareholder = [];
                for (let i = 0; i <= (vShareholderCount - 1); i++) {
                    let oShareholder = this.getView().getModel("ShareholderModel").getProperty("/item/" + i);
                    if (oShareholder) {
                        let oFile = {
                            "ID": oSupplier.supplierID,
                            "fileContent": oShareholder.fileData
                        };
                        let oFileEncrypt = await Models.encryptFile(oFile, sAuthToken);
                        aShareholder.push({
                            "shareholderName": oShareholder.name,
                            "sharePercentage": parseInt(oShareholder.sharePercentage),
                            "shareholderDocuments":
                                [
                                    {
                                        "documentType": oShareholder.docType,
                                        "nameOnDocument": oShareholder.nameOnDoc,
                                        "documentNumber": oShareholder.docNum,
                                        "fileName": oShareholder.fileName,
                                        "fileType": oShareholder.fileType,
                                        "encodedContent": oFileEncrypt.response.value,
                                        // "dateOfIssue": oShareholder.dateOfIssue,
                                        "expiryDate": oShareholder.expiryDate,
                                    }
                                ]
                        });
                    }

                }

                let oSupplierData = {
                    "status": vStatus,
                    "SAPCustomer": (this.getView().byId("idSAPCustomer.Select").getSelectedKey().toLowerCase() === 'true'),
                    "businessNature_selectKey": parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey()),
                    "shareholderCount": vShareholderCount,
                    "supplierDocuments": aSupplierDocument,
                    "shareholderDetails": aShareholder
                };

                let oParameter = {
                    "buyerID": oSupplier.buyerID,
                    "supplierID": oSupplier.supplierID,
                    "oSupplier": oSupplierData
                };

                let oSupplierUpdate = await Models.updateSupplier(oParameter, sAuthToken);
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

                // Document
                let aDocument = this.getView().getModel("DocumentModel").getProperty("/docKeys");
                let aSupplierDocument = [];

                for (let i = 0; i <= (aDocument.length - 1); i++) {
                    let oDocumentItem = this.getView().getModel("DocumentModel").getProperty("/doc" + aDocument[i]);

                    let oFile = {
                        "ID": oSupplier.supplierID,
                        "fileContent": oDocumentItem.fileData
                    };
                    let oFileEncrypt = await Models.encryptFile(oFile, sAuthToken);

                    aSupplierDocument.push({
                        "documentName": "doc" + aDocument[i],
                        "nameOnDocument": oDocumentItem.nameOnDocument,
                        "documentNumber": oDocumentItem.documentNumber,
                        "fileName": oDocumentItem.fileName,
                        "encodedContent": oFileEncrypt.response.value
                    });
                }

                let oSupplierOnboarding = {
                    "vbipRequestId": oSupplier.buyerID + oSupplier.supplierID,
                    "businessNature": oSupplier.businessNature_selectKey,
                    "shareHolderCount": oSupplier.shareholderCount,
                    "isCardAcceptor": (this.getView().byId("idAcceptCard.Select").getSelectedKey().toLowerCase() === 'true'),
                    "buyerId": oSupplier.buyerID,
                    "supplierInfo": {
                        "supplierId": oSupplier.supplierID,
                        "firstName": oSupplier.firstName,
                        "lastName": oSupplier.lastName,
                        "legalName": oSupplier.supplierName,
                        "emailAddress": oSupplier.emailID,
                        "mobileNumberCountryCode": oSupplier.mobileCountryCode,
                        "mobileNumber": oSupplier.mobileNumber,
                        // "website": "",
                        "completeAddress": oSupplier.completeAddress,
                        "zipCode": oSupplier.zipCode,
                        "countryCode": oSupplier.countryCode_code,
                        "city": oSupplier.city,
                        "state": oSupplier.state,
                        // "companyAdditionalEmailAddress": ""
                    },
                    "kycDetails": {
                        "addressProof": {
                            "documentName": "",
                            "nameOnDocument": "",
                            "documentNumber": "",
                            "fileName": "",
                            "encodedContent": ""
                        },
                        "businessProof": aSupplierDocument,
                        // "identityProof": {
                        //     "documentName": "Passport",
                        //     "nameOnDocument": "Xavier",
                        //     "documentNumber": "HN789T",
                        //     "dateofBirth": "22-01-1987",
                        //     "issuingDate": "22-01-1987",
                        //     "expiryDate": "22-01-1987",
                        //     "fileName": "passport.jpg",
                        //     "encodedContent": "HKYT67"
                        // },
                        // "shareholderProof": [
                        //     {
                        //         "name": "",
                        //         "sharePercentage": 60,
                        //         "identityProof": {
                        //             "documentName": "Passport",
                        //             "nameOnDocument": "Xavier",
                        //             "documentNumber": "HN789T",
                        //             "dateofBirth": "22-01-1987",
                        //             "issuingDate": "22-01-1987",
                        //             "expiryDate": "22-01-1987",
                        //             "fileName": "passport.jpg",
                        //             "encodedContent": "HKYT67"
                        //         },
                        //         "documentProof": {
                        //             "documentName": "Shareholder certificate",
                        //             "nameOnDocument": "David",
                        //             "documentNumber": "KTY875VC",
                        //             "fileName": "Shareholder certificate.jpg",
                        //             "encodedContent": "HKLVQ"
                        //         }
                        //     }
                        // ]
                    },
                    "supplierBankingInfo": {
                        "accountHolderName": oSupplier.supplierName,
                        "accountNumber": oSupplier.accountNumber,
                        "branchCity": "",
                        "bankCode": oSupplier.bankCode
                    }
                };
                let oParameter = {
                    "oSupplier": oSupplierOnboarding
                };
                let oSupplierSubmit = await Models.submitSupplier(oParameter, sAuthToken);
                if (Object.keys(oSupplierSubmit.catchError).length === 0 &&
                    oSupplierSubmit.catchError.constructor === Object) {
                    if (oSupplierSubmit.response.error) {
                        // Error
                        let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError code ${oSupplierSubmit.response.error.code}`;
                        // MessageToast.show(msgError);

                    } else {
                        // Success
                        let msgSuccess = `Supplier ${oSupplier.supplierID} information is submitted`;
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
            _reportError: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/landingText/report", true);
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Supplier", {
                    GUID: "NotFound"
                });
            }
        });
    });
