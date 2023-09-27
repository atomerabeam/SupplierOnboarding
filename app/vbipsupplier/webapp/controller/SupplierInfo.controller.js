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
                // this._onInit();
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("SupplierInfo").attachPatternMatched(this._onObjectMatched, this);
            },
            onContinue: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                let vAcceptCard = this.getView().byId("idAcceptCard.Select").getSelectedKey();
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


            onChangeBusinessNature: function () {
                let vBusinessNature = parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());
                let vCount;
                if (vBusinessNature === 1) {
                    vCount = 6;
                } else if (vBusinessNature === 2) {
                    vCount = 4;
                } else if (vBusinessNature === 3) {
                    vCount = 1;
                }

                let aShareholderCount = [];
                for (let i = 1; i <= vCount; i++) {
                    aShareholderCount.push({
                        "count": i
                    });
                }

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
                let strID = oEvent.getParameter("id");
                let fileNumber = strID.split("idUploadFile")[1].split(".Button")[0];

                let input = document.createElement("input"); // Create input element
                input.type = "file"; // Important to be type File
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
                        var base64 = "";
                        for (let i = 0; i < len; i++) {
                            base64 += String.fromCharCode(bytes[i]);
                        }
                        base64 = btoa(base64);
                        // console.log(dataArr)
                        // console.log(textData)
                        // console.log(base64)
                    }
                    let oFileCheck = { "fileContent": base64 };
                    let isMalwareDetected = await Models.checkMalware(oFileCheck);
                    if (isMalwareDetected === "true") {
                        let msgError = "Malware is detected";
                        MessageToast.show(msgError);
                    } else {

                        let oFile = this.getView().getModel("FileModel");
                        oFile.setProperty("/file" + fileNumber, {
                            // "fileID1": result.value,
                            "fileName": fileInfo[0].name,
                            "fileType": fileInfo[0].type,
                            "fileData": base64,
                            "uploadVisible": false,
                            "fileVisible": true,
                        });
                    }
                }.bind(this)

                input.click();
            },
            onDeleteFileButton: async function (oEvent) {
                //File Number
                let strID = oEvent.getParameter("id");
                let fileNumber = strID.split("idDeleteFile")[1].split(".Icon")[0];

                let oFile = this.getView().getModel("FileModel");
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
                let fileNumber = strID.split("idDownloadFile")[1].split(".Icon")[0];

                //File
                let oFile = this.getView().getModel("FileModel");
                let vFile = oFile.getProperty("/file" + fileNumber);

                const downloadLink = document.createElement("a");
                let MimeType = vFile.fileType;
                downloadLink.href = "data:" + MimeType + ";base64," + vFile.fileData; //base64 file content
                downloadLink.download = vFile.fileName;
                // Trigger the download
                downloadLink.click();
            },
            onUploadFileSH: async function (oEvent) {
                let oShareholderPopup = this.getView().getModel("ShareholderPopupModel").getProperty("/popup");

                let input = document.createElement("input"); // Create input element
                input.type = "file"; // Important to be type File
                input.multiple = true // Alow only one file at a time
                input.accept = "image/*" // Only accept image file
                let fileInfo;
                let base64;
                input.onchange = async function () {
                    let file = input.files; // get the file
                    fileInfo = file;
                    for (let i = 0; i < file.length; i++) {
                        let data = file[i]
                        let dataArr = await data.arrayBuffer()
                        let textData = await data.text()
                        let bytes = new Uint8Array(dataArr);
                        let len = bytes.byteLength;
                        for (let i = 0; i < len; i++) {
                            base64 += String.fromCharCode(bytes[i]);
                        }
                        base64 = btoa(base64);
                    }
                    let oFileCheck = { "fileContent": base64 };
                    let isMalwareDetected = await Models.checkMalware(oFileCheck);
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
                    "address": oShareholderPopup.address,
                    "docType": oShareholderPopup.docType,
                    "docNum": oShareholderPopup.docNum,
                    "nameOnDoc": oShareholderPopup.nameOnDoc,
                    "dateOfIssue": oShareholderPopup.dateofIssue,
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
            _onInit: async function () {
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

                //F4
                let oF4Model = new JSONModel();
                oF4Model.setProperty("/shareholderCount", 1);

                let oBusinessNatureRead = await Models.getBusinessNature();
                let aBusinessNature;
                if (oBusinessNatureRead.response.value) {
                    aBusinessNature = oBusinessNatureRead.response.value.businessNature.value;
                }
                oF4Model.setProperty("/businessNature", aBusinessNature);

                this.getView().setModel(oF4Model, "F4");
                this.onChangeBusinessNature();
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

                let aShareholder = this.getView().getModel("ShareholderModel").getProperty("/item");
                aShareholder.forEach((element) => element.sharePercentage = parseInt(element.sharePercentage));

                // Test encrypt
                let file1 = this.getView().getModel("FileModel").getProperty("/file1/fileData");
                let oFile1 = {
                    "ID": oSupplier.supplierID,
                    "fileContent": file1
                };
                let oFileEncrypt1 = await Models.encryptFile(oFile1);

                let oSupplierData = {
                    "status": "Saved",
                    "SAPCustomer": (this.getView().byId("idSAPCustomer.Select").getSelectedKey().toLowerCase() === 'true'),
                    // "businessNature": parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey()),
                    "shareholderCount": parseInt(this.getView().byId("idShareHolderCount.Select").getSelectedKey()),
                    "supplierDocuments": [
                        {
                            documentName: "copyOfBusinessReg",
                            documentType: "copyOfBusinessReg",
                            nameOnDocument: this.getView().byId("idNameDoc1.Input").getValue(),
                            documentNumber: this.getView().byId("idDoc1.Input").getValue(),
                            fileName: this.getView().getModel("FileModel").getProperty("/file1/fileName"),
                            fileType: this.getView().getModel("FileModel").getProperty("/file1/fileType"),
                            encodedContent: oFileEncrypt1.response.vEncryptFile
                        },
                        {
                            documentName: "certOfIncorporation",
                            documentType: "certOfIncorporation",
                            nameOnDocument: this.getView().byId("idNameDoc2.Input").getValue(),
                            documentNumber: this.getView().byId("idDoc2.Input").getValue(),
                            fileName: this.getView().getModel("FileModel").getProperty("/file2/fileName"),
                            fileType: this.getView().getModel("FileModel").getProperty("/file2/fileType"),
                            encodedContent: this.getView().getModel("FileModel").getProperty("/file2/fileData")
                        }
                    ]
                };
                let oParameter = {
                    "buyerID": oSupplier.buyerID,
                    "supplierID": oSupplier.supplierID,
                    "oSupplier": oSupplierData
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
                        this._submitSupplier("");

                        // Exit
                    }
                } else {
                    // Catch error
                    let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError catched`;
                    // MessageToast.show(msgError);
                }
            },
            _submitSupplier: async function (sMessage) {
                let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");

                let aShareholder = this.getView().getModel("ShareholderModel").getProperty("/item");
                aShareholder.forEach((element) => element.sharePercentage = parseInt(element.sharePercentage));
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
                        "businessProof": [
                            {
                                "expiryDate": "",
                                "documentName": "copyOfBusinessReg",
                                "nameOnDocument": this.getView().byId("idNameDoc1.Input").getValue(),
                                "documentNumber": this.getView().byId("idDocNum1.Input").getValue(),
                                "fileName": this.getView().getModel("FileModel").getProperty("/file1/fileName"),
                                "encodedContent": this.getView().getModel("FileModel").getProperty("/file1/fileData"),
                            }
                        ],
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
                let oSupplierUpdate = await Models.submitSupplier(oParameter);
                if (Object.keys(oSupplierUpdate.catchError).length === 0 &&
                    oSupplierUpdate.catchError.constructor === Object) {
                    if (oSupplierUpdate.response.error) {
                        // Error
                        let msgError = `Operation failed Supplier ${oSupplier.supplierID} \nError code ${oSupplierUpdate.response.error.code}`;
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
            }
        });
    });
