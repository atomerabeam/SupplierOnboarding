sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast"],function(e,t,o,n,r){"use strict";return e.extend("vbipsupplier.controller.LandingPage",{onInit:function(){this.getView().addEventDelegate({onBeforeShow:this.onBeforeShow},this)},onBeforeShow:function(){this._onInit()},onResendOTPLinkPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let r=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");let i=t.emailID;let s=await o.getEmailTemplate("OPT1",e);let l=s?.emailSubject;let p=s?.emailBody.replace("[SUPPLIER NAME]",t.supplierName);let a={bCardInfoOTP:false,pID:this._GUID,smtpDestination:r.smtpDestination,mailTo:i,mailSubject:l,mailContent:p};let g=await o.sendMailOTP(a,e);if(g.response.ok===true){n.show("Sent OTP")}else{let e=await g.response.json();if(e.error.code=="900"){this._updateSupplier("noMessage","ROL");n.show("Reach OTP limit")}else{n.show("Failed to send OTP")}}},onContinueButtonPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getView().byId("idOTP.Input").getValue();let r={bCardInfoOTP:false,pID:this._GUID,pOTP:t};try{let t=await o.checkOTP(r,e);if(t){let e=this.getOwnerComponent().getRouter();e.navTo("SupplierInfo");this.getView().byId("idOTP.Input").setValue("")}}catch(e){debugger;let t=e.message;let o;if(t==="Error: Invalid"){o="Invalid OTP";n.show(o)}else{o="Your OTP is expired";n.show(o)}}},_onObjectMatched:function(e){this._GUID=e.getParameter("arguments").GUID},_onInit:async function(){this.getOwnerComponent().setModel(new t({authToken:""}),"AuthModel");let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let n=new t;let r={otp:false,landing:false,landingText:{invalid:true,expire:false}};this.getOwnerComponent().getModel("LandingText").setProperty("/expire",false);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",false);this.getOwnerComponent().getModel("LandingText").setProperty("/report",false);n.setProperty("/pageFlow",r);this.getView().setModel(n,"PageModel");this.getOwnerComponent().setModel(new t,"Countries");let i=sap.ui.core.UIComponent.getRouterFor(this);i.getRoute("Supplier").attachPatternMatched(this._onObjectMatched,this);await o.checkService();if(this._GUID==="Info"){this.getOwnerComponent().getModel("LandingText").setProperty("/expire",false);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",false);this.getOwnerComponent().getModel("LandingText").setProperty("/report",true);this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true);return}let s={pID:this._GUID};let l=await o.authorize({encryptedUrl:this._GUID});if(l.error){if(l.error.code=="900"){this.getOwnerComponent().getModel("LandingText").setProperty("/expire",true);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",false)}else{this.getOwnerComponent().getModel("LandingText").setProperty("/expire",false);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",true)}this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else{this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken",l.value);e=l.value;let t=await o.decryptID(s,e);let n={buyerID:t?.response?.value.split("_")[0],supplierID:t?.response?.value.split("_")[1]};let r=await o.getSupplier(n,e);if(r.response){if(r.response.error){let e=`Failed to get Supplier information \nError code ${r.response.error.code}`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else{if(r.response.supplier.error){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else if(r.response.supplier){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",r.response.supplier);let t=this.getOwnerComponent().getModel("Countries");o.getCountries(t,e);await this._getBuyerInfo(r.response.supplier.buyerID);this.onResendOTPLinkPress();this.getView().getModel("PageModel").setProperty("/pageFlow/otp",true)}}}else{let e=`Failed to get Supplier information \nError catched`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}}},_getBuyerInfo:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let n={buyerID:e};let r=await o.getBuyer(n,t);if(r.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",r.response.value.buyer)}let i=await o.getBuyerOnboarding(n,t);if(i.response.value.buyerOnboarding.value[0]){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyerOnboarding",i.response.value.buyerOnboarding.value[0]);let e={pID:i.response.value.buyerOnboarding.value[0].vbipID};let n=await o.getVBIP(e,t);if(n.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",n.response.value.vbip)}}},_updateSupplier:async function(e,t){let r=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let i=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let s={status:t,SAPCustomer:null,businessNature_selectKey:null,shareholderCount:null,supplierDocuments:[],shareholderDetails:[]};let l={buyerID:i.buyerID,supplierID:i.supplierID,oSupplier:s};let p=await o.updateSupplier(l,r);if(Object.keys(p.catchError).length===0&&p.catchError.constructor===Object){if(p.response.error){}else{let t=`Supplier ${i.supplierID} information is update`;if(e==="message"){n.show(t)}}}else{}}})});