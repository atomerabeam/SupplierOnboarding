sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast","../model/formatter","sap/m/MessageBox"],function(e,t,o,l,r,i){"use strict";var s;return e.extend("vbipsupplier.controller.SupplierInfo",{formatter:r,onInit:function(){let e=sap.ui.core.UIComponent.getRouterFor(this);e.getRoute("SupplierInfo").attachPatternMatched(this._onObjectMatched,this);this.getView().addEventDelegate({onBeforeShow:this.onBeforeShow},this)},onBeforeShow:function(){let e=new t;let o={infoRequest:false,infoConfirm:false,corporate:false,shareholder:false,complete:false};e.setProperty("/pageFlow",o);this.getView().setModel(e,"PageModel");let l=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");if(!l){let e=this.getOwnerComponent().getRouter();e.navTo("Supplier",{GUID:"NotFound"})}},onContinue:async function(){let e=this.getView().byId("idAcceptCard.Select").getSelectedKey();if(e==="true"){let e=await this._submitSupplier("message");if(e==="Success"){await this._updateSupplier("noMessage","CAC",false,false);await this._updateSupplierB1("noMessage")}}else{let e=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyer");if(e.countryCode_code===t.countryCode_code){this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm",true);this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",false)}else{const e="Cannot be onboarded";const t=`As your country is different from Buyer's country, and you are not accepting card payments.\n\n                                          Cannot continue the process, please contact to VISA about this case`;let o=async function(e){await this._updateSupplier("noMessage","NOB",false,false);await this.getOwnerComponent().getModel("SupplierInfo").destroy();await this._endSession()}.bind(this);this.showErrorMessageBox(e,t,o)}}},onConfirmInfo:function(){this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm",false);this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",true)},onContinueStep1:function(){this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",false);this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",true)},onSubmit:async function(){let e=await this._submitSupplier("message");if(e==="Success"){await this._updateSupplier("noMessage","SUB",true,true)}},onReportInfo:function(){const e=this.getOwnerComponent().getModel("i18n").getProperty("reportInfoMessageTitle");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyer/legalName");const r=this.getOwnerComponent().getModel("i18n").getProperty("reportInfoMessage").replaceAll("[Buyer]",t);let i=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let s={sBuyerID:i.buyerID,sSupplierID:i.supplierID};let n=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let a=async function(e){if(e=="OK"){let e=await o.reportInfo(s,n);if(e.ok){this._endSession()}else{l.show(`Failed to update, please try again`)}}else{l.show(`Action is cancelled by user`)}}.bind(this);this.showErrorMessageBox(e,r,a)},onSaveAndExit:async function(){let e=await this._updateSupplier("message","SAV",true,true);if(e==="Success"){this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",false);this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",false);this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",true)}},showErrorMessageBox:function(e,t,o){i.error(t,{title:e,actions:[sap.m.MessageBox.Action.OK],onClose:o})},onChangeAcceptCard:function(){let e=this.getView().byId("idAcceptCard.Select").getSelectedKey();if(e.toLowerCase()==="true"){this.getView().getModel("RequestInfo").setProperty("/requestInfo/infoBoxVisible",false)}else{this.getView().getModel("RequestInfo").setProperty("/requestInfo/infoBoxVisible",true)}},onChangeBusinessNature:async function(){let e=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let l=parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());if(isNaN(l)){l=1}let r={country:e.countryCode_code,businessNature:l.toString()};let i=await o.getCountryDocument(r,t);let s;let n=this.getView().getModel("DocumentModel").getProperty("/docKeys");if(i.value){s=i.value}for(let e=0;e<s.length;e++){let t=parseInt(s[e].documentKey);if(l===2&&t>2){t=t+5}else if(l===3){t=t+6}n.push(t)}let a;if(l===1){a=4;n=[1,2,3]}else if(l===2){a=6;n=[1,6]}else if(l===3){a=1;n=[7,8,9]}else{a=4;n=[1,2,3]}let u=[];for(let e=1;e<=a;e++){u.push({count:e})}for(let e=1;e<=9;e++){let t=this.getView().getModel("DocumentModel").getProperty("/doc"+e);if(n.includes(e)){t.visible=true}else{t.visible=false}this.getView().getModel("DocumentModel").setProperty("/doc"+e,t)}this.getView().getModel("DocumentModel").setProperty("/docKeys",n);this.getView().getModel("F4").setProperty("/shareholderItem",u);let p={pCountry:e.countryCode_code,pBusinessNature:l.toString()};let d=await o.getDocumentType(p,t);let c;if(d.response.value){c=d.response.value.documentType.value}this.getView().getModel("F4").setProperty("/docType",c)},onInitShareCount:async function(){let e=new t;this.getView().setModel(e,"ShareholderModel");let l=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let r=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let i=parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());if(i===null){i=1}let s=[];for(let e=0;e<=i-1;e++){let t={sValue:l?.shareholderDetails[e]?.shareholderDocuments[0]?.documentNumber};let i=await o.decryptString(t,r);let n,a,u;let p=l?.shareholderDetails[e]?.shareholderDocuments[0].dateOfBirth;if(p!==null&&p!==undefined){let e={sValue:p};let t=await o.decryptString(e,r);p=t?.response?.value;p=p+`T00:00:00.000Z`;n=new Date(p)}let d=l?.shareholderDetails[e]?.shareholderDocuments[0].issuingDate;if(d!==null){d=d+`T00:00:00.000Z`;a=new Date(d)}let c=l?.shareholderDetails[e]?.shareholderDocuments[0].expiryDate;if(c!==null){c=c+`T00:00:00.000Z`;u=new Date(c)}let g,h;if(l?.shareholderDetails[e]?.shareholderName&&l?.shareholderDetails[e]?.sharePercentage){g=false;h=true}else{g=true;h=false}s.push({enterInfo:g,completed:h,name:l?.shareholderDetails[e]?.shareholderName,sharePercentage:l?.shareholderDetails[e]?.sharePercentage,address:"",docType:l?.shareholderDetails[e]?.shareholderDocuments[0]?.documentType,docNum:i?.response?.value,nameOnDoc:l?.shareholderDetails[e]?.shareholderDocuments[0]?.nameOnDocument,dateOfBirth:n,issuingDate:a,expiryDate:u,fileName:l?.shareholderDetails[e]?.shareholderDocuments[0]?.fileName,fileType:l?.shareholderDetails[e]?.shareholderDocuments[0]?.fileType,fileData:l?.shareholderDetails[e]?.shareholderDocuments[0]?.encodedContent,uploadVisible:true,fileVisible:false})}this.getView().getModel("ShareholderModel").setProperty("/item",s)},onChangeShareCount:async function(){let e=this.getView().getModel("ShareholderModel").getProperty("/item");let t=parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());if(t===null){t=1}if(t<e.length){while(t<e.length){e.pop()}}else if(t>e.length){while(e.length<t){e.push({enterInfo:true,completed:false,name:"",sharePercentage:"",address:"",docType:"",docNum:"",nameOnDoc:"",dateOfBirth:undefined,issuingDate:undefined,expiryDate:undefined,fileName:"",fileType:"",fileData:"",uploadVisible:true,fileVisible:false})}}this.getView().getModel("ShareholderModel").setProperty("/item",e)},onUploadFileButton:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=e.getParameter("id");let i=r.split("idUploadFile")[1].split(".Button")[0];let s=["image/png","application/pdf","image/jpeg","image/gif"];let n=document.createElement("input");n.type="file";n.multiple=false;n.accept="image/*";let a;n.onchange=async function(){await sap.ui.core.BusyIndicator.show();let e=n.files;a=e;for(let n=0;n<e.length;n++){if(s.includes(e[n].type)){let s=e[n];let d=await s.arrayBuffer();let c=await s.text();var r=new Uint8Array(d);var u=r.byteLength;var p="";for(let e=0;e<u;e++){p+=String.fromCharCode(r[e])}p=btoa(p);let g={fileContent:p};let h=await o.checkMalware(g,t);if(h==="true"){let e="Malware is detected";l.show(e)}else{let e=this.getView().getModel("DocumentModel").getProperty("/doc"+i);e.fileName=a[0].name;e.fileType=a[0].type;e.fileData=p;e.uploadVisible=false;e.fileVisible=true;this.getView().getModel("DocumentModel").setProperty("/doc"+i,e);this.onCheckComplete()}}else{this.showErrorMessageBox("Error","Invalid file type. Please select a PNG, PDF, or JPEG file.",null)}}await sap.ui.core.BusyIndicator.hide()}.bind(this);n.click()},onDeleteFileButton:async function(e){let t=e.getParameter("id");let o=t.split("idDeleteFile")[1].split(".Icon")[0];let l=this.getView().getModel("DocumentModel").getProperty("/doc"+o);l.fileName=null;l.fileType=null;l.fileData=null;l.uploadVisible=true;l.fileVisible=false;this.getView().getModel("DocumentModel").setProperty("/doc"+o,l);this.onCheckComplete()},onDownloadFileButton:async function(e){let t=e.getParameter("id");let o=t.split("idDownloadFile")[1].split(".Icon")[0];let l=this.getView().getModel("DocumentModel").getProperty("/doc"+o);const r=document.createElement("a");let i=l.fileType;r.href="data:"+i+";base64,"+l.fileData;r.download=l.fileName;r.click()},onUploadFileSH:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");let r=["image/png","application/pdf","image/jpeg","image/gif"];let i=document.createElement("input");i.type="file";i.multiple=false;i.accept="image/*";let s;let n;i.onchange=async function(){await sap.ui.core.BusyIndicator.show();let a=i.files;s=a;for(let i=0;i<a.length;i++){if(r.includes(a[i].type)){let r=a[i];let u=await r.arrayBuffer();let p=await r.text();let d=new Uint8Array(u);let c=d.byteLength;for(let e=0;e<c;e++){n+=String.fromCharCode(d[e])}n=btoa(n);let g={fileContent:n};let h=await o.checkMalware(g,e);if(h==="true"){let e="Malware is detected";l.show(e)}else{t.fileName=s[0].name;t.fileType=s[0].type;t.fileData=n;t.uploadVisible=false;t.fileVisible=true;this.getView().getModel("ShareholderPopupModel").setProperty("/popup",t)}}else{this.showErrorMessageBox("Error","Invalid file type. Please select a PNG, PDF, or JPEG file.",null)}}await sap.ui.core.BusyIndicator.hide()}.bind(this);i.click()},onDeleteFileSH:async function(e){let t=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");t.fileName=null;t.fileType=null;t.fileData=null;t.uploadVisible=true;t.fileVisible=false;this.getView().getModel("ShareholderPopupModel").setProperty("/popup",t)},onDownloadFileSH:async function(e){let t=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");const o=document.createElement("a");o.href="data:"+t.fileType+";base64,"+t.fileData;o.download=t.fileName;o.click()},onEnterShareholderPopup:function(e){let o=e.getSource().getBindingContext("ShareholderModel");let l=this.getView().getModel("ShareholderModel").getProperty(o.getPath());l.path=o.getPath();let r=new t;r.setProperty("/popup",l);this.getView().setModel(r,"ShareholderPopupModel");if(!this._oDialog){this._oDialog=new sap.ui.xmlfragment("vbipsupplier.view.fragment.ShareholderPopup",this);this.getView().addDependent(this._oDialog)}this._oDialog.open()},onDialogAfterClose:function(){this._oDialog.destroy();this._oDialog=null},onSave:function(){let e=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");let t,o;if(e.name.trim().length>0&&e.sharePercentage.trim().length>0){t=false;o=true}else{t=true;o=false}let l,r;if(e.fileName){l=false;r=true}else{l=true;r=false}let i={path:e.path,enterInfo:t,completed:o,name:e.name,sharePercentage:e.sharePercentage,address:e.address,docType:e.docType,docNum:e.docNum,nameOnDoc:e.nameOnDoc,dateOfBirth:e.dateOfBirth,issuingDate:e.issuingDate,expiryDate:e.expiryDate,fileName:e.fileName,fileType:e.fileType,fileData:e.fileData,uploadVisible:l,fileVisible:r};this.getView().getModel("ShareholderModel").setProperty(`${e.path}`,i);this.onDialogAfterClose()},onCancel:function(){this.onDialogAfterClose()},onBackButtonPress:function(e){const t=e.getSource().getId();const o=t.split(".")[2];console.log(o);switch(o){case"InfoConfirm":this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm",false);this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",true);break;case"Corporate":this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",false);this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm",true);break;case"Shareholder":this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",false);this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",true);break;default:break}},onCheckComplete:function(){for(let e=1;e<=9;e++){let t=this.getView().getModel("DocumentModel").getProperty("/doc"+e);if(t.nameOnDocument!==""&&t.documentNumber!==""&&t.fileName!==null){this.getView().getModel("DocumentModel").setProperty("/doc"+e+"/checked",true)}else{this.getView().getModel("DocumentModel").setProperty("/doc"+e+"/checked",false)}}},_onInit:async function(){let e="";let l=new t;let r={infoRequest:false,infoConfirm:false,corporate:false,shareholder:false,complete:false};l.setProperty("/pageFlow",r);this.getView().setModel(l,"PageModel");let i=new t;for(let e=1;e<=9;e++){i.setProperty("/doc"+e,{visible:false,nameOnDocument:null,documentNumber:null,fileName:null,fileType:null,fileData:null,uploadVisible:true,fileVisible:false})}i.setProperty("/docKeys",[]);this.getView().setModel(i,"DocumentModel");let s=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let n=new t;let a=new t;let u,p,d;if(s!==undefined){e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=await o.getBusinessNature(e);let l;if(t.response.value){l=t.response.value.businessNature.value}a.setProperty("/businessNature",l);if(s.SAPCustomer==="true"){u="true"}else if(s.SAPCustomer==="false"){u="false"}else if(s.SAPCustomer===null){u="true"}let r=s.shareholderCount;if(r===null){r=1}a.setProperty("/shareholderCount",r);this.getView().setModel(a,"F4");if(s.status==="CAC"){p="true";d=false}else{p="false";d=true}let i={SAPCustomer:u,acceptCard:p,infoBoxVisible:d};n.setProperty("/requestInfo",i);this.getView().setModel(n,"RequestInfo");this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",true);let c=s.supplierDocuments;for(let t=0;t<=c.length-1;t++){let l={ID:s.supplierID,fileContent:c[t].encodedContent};let r=await o.decryptFile(l,e);let i={sValue:c[t].documentNumber};let n=await o.decryptString(i,e);let a,u;if(c[t].fileName){a=false;u=true}else{a=true;u=false}let p={visible:true,nameOnDocument:c[t].nameOnDocument,documentNumber:n.response.value,fileName:c[t].fileName,fileType:c[t].fileType,fileData:r.response.value,uploadVisible:a,fileVisible:u};this.getView().getModel("DocumentModel").setProperty("/doc"+c[t].documentKey,p)}this.onCheckComplete()}else{let e=this.getOwnerComponent().getRouter();e.navTo("Supplier",{GUID:"NotFound"})}await this.onChangeBusinessNature();await this.onInitShareCount()},_setDefaultF4:async function(){let e=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");if(e!==undefined){if(e.shareholderCount===null){e.shareholderCount=1}if(e.businessNature_selectKey===null){e.businessNature_selectKey=1}}},_onObjectMatched:function(e){this._onInit()},_updateSupplier:async function(e,t,r,i){let n=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let a=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let u=this.getView().getModel("DocumentModel").getProperty("/docKeys");let p=[];let d,c;let g=[];if(r===true){d=parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());for(let e=0;e<=u.length-1;e++){let t=this.getView().getModel("DocumentModel").getProperty("/doc"+u[e]);let l={ID:a.supplierID,fileContent:t.fileData};let r=await o.encryptFile(l,n);let i={sValue:t.documentNumber};let s=await o.encryptString(i,n);p.push({documentName:"doc"+u[e],documentType:u[e].toString(),documentKey:u[e].toString(),nameOnDocument:t.nameOnDocument,documentNumber:s.response.value,fileName:t.fileName,fileType:t.fileType,encodedContent:r.response.value})}}else{d=null}if(i===true){c=parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());for(let e=0;e<=c-1;e++){let t=this.getView().getModel("ShareholderModel").getProperty("/item/"+e);if(t){let l={ID:a.supplierID,fileContent:t.fileData};let r=await o.encryptFile(l,n);let i,s,u;i=t?.dateOfBirth?.toISOString()?.split("T")[0];s=t?.issuingDate?.toISOString()?.split("T")[0];u=t?.expiryDate?.toISOString()?.split("T")[0];let p;if(i!==undefined){let e={sValue:i};p=await o.encryptString(e,n);i=p.response.value}let d={sValue:t.docNum};let c=await o.encryptString(d,n);g.push({shareholderName:t.name,sharePercentage:parseInt(t.sharePercentage),shareholderDocuments:[{documentType:t.docType,documentKey:e.toString(),nameOnDocument:t.nameOnDoc,documentNumber:c.response.value,fileName:t.fileName,fileType:t.fileType,encodedContent:r.response.value,dateOfBirth:i,issuingDate:s,expiryDate:u}]})}}}else{c=null}let h={requestID:s,status:t,SAPCustomer:this.getView().byId("idSAPCustomer.Select").getSelectedKey().toLowerCase()==="true",businessRegNum:a.businessRegNum,businessNature_selectKey:d,shareholderCount:c,supplierDocuments:p,shareholderDetails:g};let f={buyerID:a.buyerID,supplierID:a.supplierID,oSupplier:h};await sap.ui.core.BusyIndicator.show();let m=await o.updateSupplier(f,n);let y,w;if(Object.keys(m.catchError).length===0&&m.catchError.constructor===Object){if(m.response.error){y=`Operation failed Supplier ${a.supplierID} \nError code ${m.response.error.code}`}else{y=`Supplier ${a.supplierID} information is update`;w="Success"}}else{y=`Operation failed Supplier ${a.supplierID} \nError catched`}if(e==="message"){l.show(y)}await sap.ui.core.BusyIndicator.hide();return w},_updateSupplierB1:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let i=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyerOnboarding");let s=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");let n={supplierID:r.visaSupplierID,vbipID:s.vbipID,companyCode:i.companyCode};let a=await o.updateSupplierB1(n,t);if(Object.keys(a.catchError).length===0&&a.catchError.constructor===Object){if(a.response.error){let e=`Operation failed Supplier ${r.supplierID} \nError code ${a.response.error.code}`}else{let t=`Supplier ${r.supplierID} information is update`;if(e==="message"){l.show(t)}}}else{let e=`Operation failed Supplier ${r.supplierID} \nError catched`}},_submitSupplier:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let i=this.getView().byId("idAcceptCard.Select").getSelectedKey().toLowerCase()==="true";let n,a;if(r.businessNature_selectKey==1){n="COMPANY";a=1}else if(r.businessNature_selectKey==2){n="PARTNERSHIP";a=6}else if(r.businessNature_selectKey==3){n="INDIVIDUAL";a=9}let u=Math.round((new Date).getTime()/1e3);s=r.buyerID+r.supplierID+u;let p=await o.get3DigitCountry(r.countryCode_code,t);let d={vbipRequestId:s,businessNature:n,shareHolderCount:r.businessNature_selectKey==3?0:parseInt(r.shareholderCount),isCardAcceptor:i,buyerId:r.buyerID,supplierInfo:{supplierId:r.visaSupplierID,firstName:r.firstName,lastName:r.lastName,legalName:r.supplierName,emailAddress:r.emailID,mobileNumberCountryCode:r.mobileCountryCode,mobileNumber:r.mobileNumber,completeAddress:r.completeAddress,zipCode:r.zipCode,countryCode:p.Code3,city:r.city,state:r.state}};let c=[];let g=this.getView().getModel("DocumentModel").getProperty("/doc"+a);if(i===false){let e=this.getView().getModel("DocumentModel").getProperty("/docKeys");let t=[];let o={};for(let l=0;l<=e.length-1;l++){let r=this.getView().getModel("DocumentModel").getProperty("/doc"+e[l]);if(l==0){o=r}let i=this.getOwnerComponent().getModel("i18n").getProperty("documentName"+e[l]);t.push({documentName:i,nameOnDocument:r.nameOnDocument,documentNumber:r.documentNumber,fileName:r.fileName,encodedContent:r.fileData})}let l=parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());for(let e=0;e<=l-1;e++){let t=this.getView().getModel("ShareholderModel").getProperty("/item/"+e);let l,r,i;l=t?.dateOfBirth?.toISOString()?.split("T")[0];r=t?.issuingDate?.toISOString()?.split("T")[0];i=t?.expiryDate?.toISOString()?.split("T")[0];if(t){c.push({name:t.name,sharePercentage:parseInt(t.sharePercentage),identityProof:{documentName:t.docType,nameOnDocument:t.nameOnDoc,documentNumber:t.docNum,fileName:t.fileName,encodedContent:t.fileData,dateOfBirth:this.toVisaDateFormat(l),issuingDate:this.toVisaDateFormat(r),expiryDate:this.toVisaDateFormat(i)},documentProof:{documentName:"COPY_OF_BUSINESS_REGISTRATION",nameOnDocument:o.nameOnDocument,documentNumber:o.documentNumber,fileName:o.fileName,encodedContent:o.fileData}})}}d.kycDetails={addressProof:{documentName:"COPY_OF_BUSINESS_REGISTRATION",nameOnDocument:g.nameOnDocument,documentNumber:g.documentNumber,fileName:g.fileName,encodedContent:g.fileData},businessProof:t,shareHolderProof:c};d.supplierBankingInfo={accountHolderName:r.supplierName,accountNumber:r.accountNumber,branchCity:"",bankCode:r.bankCode}}if(n==="INDIVIDUAL"){delete d.kycDetails.shareHolderProof;d.kycDetails.identityProof=c[0].identityProof;d.kycDetails.businessProof=[{documentName:"COPY_OF_BUSINESS_REGISTRATION",nameOnDocument:g.nameOnDocument,documentNumber:g.documentNumber,fileName:g.fileName,encodedContent:g.fileData,registrationDate:"1970-01-01",expiryDate:"9999-12-31"}]}let h={oSupplier:d};let f;await sap.ui.core.BusyIndicator.show();let m=await o.submitSupplier(h,t);if(Object.keys(m.catchError).length===0&&m.catchError.constructor===Object){if(m.response.error){let e=`Operation failed Supplier ${r.supplierID} \nError code ${m.response.error.code}`;l.show(e)}else{if(m.response.value?.supplier?.errorPayload.length>0){let e;let t=m.response.value.supplier.errorPayload;t.forEach(t=>{if(e){e+="\n "+t.errorMessage}else{e=t.errorMessage}});this.showErrorMessageBox("Response from VISA",e,null)}else{let t=`Supplier ${r.supplierID} information is submitted`;if(e==="message"){l.show(t)}f="Success";this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",false);this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",false);this.getView().getModel("PageModel").setProperty("/pageFlow/complete",true)}}}else{let e=`Operation failed Supplier ${r.supplierID} \nError catched`;l.show(e)}await sap.ui.core.BusyIndicator.hide();return f},_endSession:function(){this.getOwnerComponent().getModel("LandingText").setProperty("/report",true);let e=this.getOwnerComponent().getRouter();e.navTo("Supplier",{GUID:"Info"})},toVisaDateFormat:function(e){let t=/^\d{4}-\d{2}-\d{2}$/;if(!isNaN(new Date(e).getDate())&&e!==null&&t.test(e)==true){return e}else{if(e?.length===10){return e.substr(6,4)+"-"+e.substr(3,2)+"-"+e.substr(0,2)}}}})});
