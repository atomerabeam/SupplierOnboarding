sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast"],function(e,t,o,r){"use strict";return e.extend("vbipsupplier.controller.CardLandingPage",{onInit:async function(){this.getOwnerComponent().setModel(new t({authToken:""}),"AuthModel");let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",{});this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",{});this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",{});let r=new t;let n={otp:false,landing:false};r.setProperty("/pageFlow",n);this.getView().setModel(r,"PageModel");let s=sap.ui.core.UIComponent.getRouterFor(this);s.getRoute("Card").attachPatternMatched(this._onObjectMatched,this);await o.checkService();let l={pID:this._GUID};let i=await o.authorize({encryptedUrl:this._GUID});if(i){this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken",i.value);e=i.value}let p=await o.decryptID(l,e);let a={buyerID:p.response.value.split("_")[0],supplierID:p.response.value.split("_")[1]};let u=await o.getSupplier(a,e);if(u.response){if(u.response.error){let e=`Failed to get Supplier information \nError code ${u.response.error.code}`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else{if(u.response.supplier.error){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else if(u.response.supplier){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",false);this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",u.response.supplier);console.log(this.getOwnerComponent().getModel("SupplierInfo"));await this._getBuyerInfo(u.response.supplier.buyerID);this.onResendOTPLinkPress();this.getView().getModel("PageModel").setProperty("/pageFlow/otp",true)}}}else{let e=`Failed to get Supplier information \nError catched`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}},onResendOTPLinkPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let n=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");let s=t.emailID;let l={pID:this._GUID,smtpDestination:n.smtpDestination,mailTo:s,mailSubject:"VBIP Supplier OTP",mailContent:`<strong>Dear Supplier</strong><br/><br/>\n                                <p>Your OTP code is [OTP]</p><br/><p>Thanks</p>`};let i=await o.sendMailOTP(l,e);if(i.response.ok===true){r.show("Sent OTP")}else{r.show("Failed to send OTP")}},onContinueButtonPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getView().byId("idOTP.Input").getValue();let n={pID:this._GUID,pOTP:t};let s=await o.checkOTP(n,e);if(Object.keys(s.catchError).length===0&&s.catchError.constructor===Object){if(s.response.error){let e=`Failed to process \nError code ${s.response.error.code}`;r.show(e)}else{let e=s.response.value;let t;if(e==="Invalid"){t="Invalid OTP";r.show(t)}else if(e==="Expired"){t="Your OTP is expired";r.show(t)}else if(e==="OK"){let e=this.getOwnerComponent().getRouter();e.navTo("CardInfo")}}}else{let e=`Failed to process \nError catched`;r.show(e)}},_getBuyerInfo:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r={buyerID:e};let n=await o.getBuyer(r,t);if(n.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",n.response.value.buyer)}let s=await o.getBuyerOnboarding(r,t);if(s.response.value.buyerOnboarding.value[0]){let e={pID:s.response.value.buyerOnboarding.value[0].vbipID};let r=await o.getVBIP(e,t);if(r.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",r.response.value.vbip)}}},_onObjectMatched:function(e){this._GUID=e.getParameter("arguments").token}})});