sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast","../model/formatter","sap/m/MessageBox"],function(e,t,o,l,r,i){"use strict";return e.extend("vbipsupplier.controller.SupplierInfo",{formatter:r,onInit:function(){let e=sap.ui.core.UIComponent.getRouterFor(this);e.getRoute("SupplierInfo").attachPatternMatched(this._onObjectMatched,this)},onContinue:function(){this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",false);let e=this.getView().byId("idAcceptCard.Select").getSelectedKey();if(e==="true"){this.getView().getModel("PageModel").setProperty("/pageFlow/complete",true)}else{this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm",true)}},onConfirmInfo:function(){this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm",false);this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",true)},onContinueStep1:function(){this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",false);this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",true)},onContinueStep2:function(){this._updateSupplier("noMessage");this._submitSupplier("noMessage");this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",false);this.getView().getModel("PageModel").setProperty("/pageFlow/complete",true)},onReportInfo:function(){const e=this.getOwnerComponent().getModel("i18n").getProperty("reportInfoMessageTitle");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/buyer/legalName");const r=this.getOwnerComponent().getModel("i18n").getProperty("reportInfoMessage").replaceAll("[Buyer]",t);let i=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let n={sBuyerID:i.buyerID,sSupplierID:i.supplierID};let s=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let a=async function(e){if(e=="OK"){let e=await o.reportInfo(n,s);if(e.ok){l.show(`Successful report information error to ${t}`)}else{l.show(`Failed report information error to ${t}`)}}};this.showErrorMessageBox(e,r,a)},onSaveAndExit:async function(){this._updateSupplier("message");this.getView().getModel("PageModel").setProperty("/pageFlow/corporate",false);this.getView().getModel("PageModel").setProperty("/pageFlow/shareholder",false);this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",true)},showErrorMessageBox:function(e,t,o){i.error(t,{title:e,actions:[sap.m.MessageBox.Action.OK],onClose:o})},onChangeBusinessNature:function(){let e=parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey());let t;let o=this.getView().getModel("DocumentModel").getProperty("/docKeys");if(e===1){t=4;o=[1,2,3,4,5]}else if(e===2){t=6;o=[1,5,6]}else if(e===3){t=1;o=[7,8,9]}else{t=4;o=[1,2,3,4,5]}let l=[];for(let e=1;e<=t;e++){l.push({count:e})}for(let e=1;e<=9;e++){let t=this.getView().getModel("DocumentModel").getProperty("/doc"+e);if(o.includes(e)){t.visible=true}else{t.visible=false}this.getView().getModel("DocumentModel").setProperty("/doc"+e,t)}this.getView().getModel("DocumentModel").setProperty("/docKeys",o);this.getView().getModel("F4").setProperty("/shareholderItem",l)},onChangeShareCount:function(){let e=new t;this.getView().setModel(e,"ShareholderModel");let o=this.getView().getModel("F4").getProperty("/shareholderCount");let l=[];for(let e=1;e<=o;e++){l.push({enterInfo:true,completed:false,name:"",sharePercentage:"",address:"",docType:"",docNum:"",nameOnDoc:"",dateOfIssue:"",filename:"",fileType:"",fileData:"",uploadVisible:true,fileVisible:false})}this.getView().getModel("ShareholderModel").setProperty("/item",l)},onUploadFileButton:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=e.getParameter("id");let i=r.split("idUploadFile")[1].split(".Button")[0];let n=document.createElement("input");n.type="file";n.multiple=true;n.accept="image/*";let s;n.onchange=async function(){let e=n.files;s=e;for(let t=0;t<e.length;t++){let o=e[t];let l=await o.arrayBuffer();let i=await o.text();var r=new Uint8Array(l);var a=r.byteLength;var p="";for(let e=0;e<a;e++){p+=String.fromCharCode(r[e])}p=btoa(p)}let u={fileContent:p};let d=await o.checkMalware(u,t);if(d==="true"){let e="Malware is detected";l.show(e)}else{let e=this.getView().getModel("DocumentModel").getProperty("/doc"+i);e.fileName=s[0].name;e.fileType=s[0].type;e.fileData=p;e.uploadVisible=false;e.fileVisible=true;this.getView().getModel("DocumentModel").setProperty("/doc"+i,e)}}.bind(this);n.click()},onDeleteFileButton:async function(e){let t=e.getParameter("id");let o=t.split("idDeleteFile")[1].split(".Icon")[0];let l=this.getView().getModel("DocumentModel").getProperty("/doc"+o);l.fileName=null;l.fileType=null;l.fileData=null;l.uploadVisible=true;l.fileVisible=false;this.getView().getModel("DocumentModel").setProperty("/doc"+o,l)},onDownloadFileButton:async function(e){let t=e.getParameter("id");let o=t.split("idDownloadFile")[1].split(".Icon")[0];let l=this.getView().getModel("DocumentModel").getProperty("/doc"+o);const r=document.createElement("a");let i=l.fileType;r.href="data:"+i+";base64,"+l.fileData;r.download=l.fileName;r.click()},onUploadFileSH:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");let i=document.createElement("input");i.type="file";i.multiple=true;i.accept="image/*";let n;let s;i.onchange=async function(){let e=i.files;n=e;for(let t=0;t<e.length;t++){let o=e[t];let l=await o.arrayBuffer();let r=await o.text();let i=new Uint8Array(l);let n=i.byteLength;for(let e=0;e<n;e++){s+=String.fromCharCode(i[e])}s=btoa(s)}let a={fileContent:s};let p=await o.checkMalware(a,t);if(p==="true"){let e="Malware is detected";l.show(e)}else{r.fileName=n[0].name;r.fileType=n[0].type;r.fileData=s;r.uploadVisible=false;r.fileVisible=true;this.getView().getModel("ShareholderPopupModel").setProperty("/popup",r)}}.bind(this);i.click()},onDeleteFileSH:async function(e){let t=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");t.fileName=null;t.fileType=null;t.fileData=null;t.uploadVisible=true;t.fileVisible=false;this.getView().getModel("ShareholderPopupModel").setProperty("/popup",t)},onDownloadFileSH:async function(e){let t=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");const o=document.createElement("a");o.href="data:"+t.fileType+";base64,"+t.fileData;o.download=t.fileName;o.click()},onEnterShareholderPopup:function(e){let o=e.getSource().getBindingContext("ShareholderModel");let l=this.getView().getModel("ShareholderModel").getProperty(o.getPath());l.path=o.getPath();let r=new t;r.setProperty("/popup",l);this.getView().setModel(r,"ShareholderPopupModel");if(!this._oDialog){this._oDialog=new sap.ui.xmlfragment("vbipsupplier.view.fragment.ShareholderPopup",this);this.getView().addDependent(this._oDialog)}this._oDialog.open()},onDialogAfterClose:function(){this._oDialog.destroy();this._oDialog=null},onSave:function(){let e=this.getView().getModel("ShareholderPopupModel").getProperty("/popup");let t={path:e.path,enterInfo:false,completed:true,name:e.name,sharePercentage:e.sharePercentage,address:e.address,docType:e.docType,docNum:e.docNum,nameOnDoc:e.nameOnDoc,dateOfIssue:e.dateOfIssue,filename:e.fileName,fileType:e.fileType,fileData:e.fileData,uploadVisible:false,fileVisible:true};this.getView().getModel("ShareholderModel").setProperty(`${e.path}`,t);this.onDialogAfterClose()},onCancel:function(){this.onDialogAfterClose()},_onInit:async function(){let e="";let l=new t;let r={infoRequest:false,infoConfirm:false,corporate:false,shareholder:false,complete:false};l.setProperty("/pageFlow",r);this.getView().setModel(l,"PageModel");let i=new t;i.setProperty("/shareholderCount",1);this.getView().setModel(i,"F4");let n=new t;for(let e=1;e<=9;e++){n.setProperty("/doc"+e,{visible:false,nameOnDocument:null,documentNumber:null,fileName:null,fileType:null,fileData:null,uploadVisible:true,fileVisible:false})}n.setProperty("/docKeys",[1,2,3,4,5,6,7,8,9]);this.getView().setModel(n,"DocumentModel");let s=new t;let a,p;let u=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");if(u!==undefined){e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=await o.getBusinessNature(e);let l;if(t.response.value){l=t.response.value.businessNature.value}i.setProperty("/businessNature",l);if(u.SAPCustomer==="true"){a="true"}else if(u.SAPCustomer==="false"){a="false"}else if(u.SAPCustomer===null){a="true"}if(u.status==="CardAccepted"){p="true"}else{p="false"}let r={SAPCustomer:a,acceptCard:p};s.setProperty("/requestInfo",r);this.getView().setModel(s,"RequestInfo");this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest",true);let n=u.supplierDocuments;for(let e=0;e<=n.length-1;e++){let t={visible:true,nameOnDocument:n[e].nameOnDocument,documentNumber:n[e].documentNumber,fileName:n[e].fileName,fileType:n[e].fileType,fileData:null,uploadVisible:false,fileVisible:true};this.getView().getModel("DocumentModel").setProperty("/doc"+n[e].documentType,t)}}else{let e=this.getOwnerComponent().getRouter();e.navTo("Supplier",{GUID:"NotFound"})}this.onChangeBusinessNature();this.onChangeShareCount()},_onObjectMatched:function(e){this._onInit()},_updateSupplier:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let i=this.getView().getModel("DocumentModel").getProperty("/docKeys");let n=[];for(let e=0;e<=i.length-1;e++){let l=this.getView().getModel("DocumentModel").getProperty("/doc"+i[e]);let s={ID:r.supplierID,fileContent:l.fileData};let a=await o.encryptFile(s,t);n.push({documentName:"doc"+i[e],documentType:i[e].toString(),nameOnDocument:l.nameOnDocument,documentNumber:l.documentNumber,fileName:l.fileName,fileType:l.fileType,encodedContent:a.response.value})}let s=parseInt(this.getView().byId("idShareholderCount.Select").getSelectedKey());let a=[];for(let e=0;e<=s-1;e++){let l=this.getView().getModel("ShareholderModel").getProperty("/item/"+e);let i={ID:r.supplierID,fileContent:l.fileData};let n=await o.encryptFile(i,t);a.push({shareholderName:l.name,sharePercentage:parseInt(l.sharePercentage),shareholderDocuments:[{documentType:l.docType,nameOnDocument:l.nameOnDoc,documentNumber:l.docNum,fileName:l.fileName,fileType:l.fileType,encodedContent:n.response.value,expiryDate:l.expiryDate}]})}let p={status:"Saved",SAPCustomer:this.getView().byId("idSAPCustomer.Select").getSelectedKey().toLowerCase()==="true",businessNature_selectKey:parseInt(this.getView().byId("idBusinessNature.Select").getSelectedKey()),shareholderCount:s,supplierDocuments:n,shareholderDetails:a};let u={buyerID:r.buyerID,supplierID:r.supplierID,oSupplier:p};let d=await o.updateSupplier(u,t);if(Object.keys(d.catchError).length===0&&d.catchError.constructor===Object){if(d.response.error){let e=`Operation failed Supplier ${r.supplierID} \nError code ${d.response.error.code}`}else{let t=`Supplier ${r.supplierID} information is update`;if(e==="message"){l.show(t)}this._submitSupplier("")}}else{let e=`Operation failed Supplier ${r.supplierID} \nError catched`}},_submitSupplier:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let i=this.getView().getModel("DocumentModel").getProperty("/docKeys");let n=[];for(let e=0;e<=i.length-1;e++){let l=this.getView().getModel("DocumentModel").getProperty("/doc"+i[e]);let s={ID:r.supplierID,fileContent:l.fileData};let a=await o.encryptFile(s,t);n.push({documentName:"doc"+i[e],nameOnDocument:l.nameOnDocument,documentNumber:l.documentNumber,fileName:l.fileName,encodedContent:a.response.value})}let s={vbipRequestId:r.buyerID+r.supplierID,businessNature:r.businessNature_selectKey,shareHolderCount:r.shareholderCount,isCardAcceptor:this.getView().byId("idAcceptCard.Select").getSelectedKey().toLowerCase()==="true",buyerId:r.buyerID,supplierInfo:{supplierId:r.supplierID,firstName:r.firstName,lastName:r.lastName,legalName:r.supplierName,emailAddress:r.emailID,mobileNumberCountryCode:r.mobileCountryCode,mobileNumber:r.mobileNumber,completeAddress:r.completeAddress,zipCode:r.zipCode,countryCode:r.countryCode_code,city:r.city,state:r.state},kycDetails:{addressProof:{documentName:"",nameOnDocument:"",documentNumber:"",fileName:"",encodedContent:""},businessProof:n},supplierBankingInfo:{accountHolderName:r.supplierName,accountNumber:r.accountNumber,branchCity:"",bankCode:r.bankCode}};let a={oSupplier:s};let p=await o.submitSupplier(a,t);if(Object.keys(p.catchError).length===0&&p.catchError.constructor===Object){if(p.response.error){let e=`Operation failed Supplier ${r.supplierID} \nError code ${p.response.error.code}`}else{let t=`Supplier ${r.supplierID} information is submitted`;if(e==="message"){l.show(t)}}}else{let e=`Operation failed Supplier ${r.supplierID} \nError catched`}}})});