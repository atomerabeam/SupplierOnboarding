sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast"],function(e,t,o,n){"use strict";return e.extend("vbipsupplier.controller.CardLandingPage",{onInit:async function(){this.getOwnerComponent().setModel(new t({authToken:""}),"AuthModel");let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",{});this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",{});this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",{});let n=new t;let r={otp:false,landing:false,landingText:{invalid:true,expire:false}};this.getOwnerComponent().getModel("LandingText").setProperty("/expire",false);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",false);this.getOwnerComponent().getModel("LandingText").setProperty("/report",false);n.setProperty("/pageFlow",r);this.getView().setModel(n,"PageModel");let i=sap.ui.core.UIComponent.getRouterFor(this);i.getRoute("Card").attachPatternMatched(this._onObjectMatched,this);await o.checkService();let l={pID:this._GUID};if(this._GUID==="CardInfo"){this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",false);this.getOwnerComponent().getModel("LandingText").setProperty("/report",true);this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true);return}let s=await o.authorizeCode({encryptedUrl:this._GUID});if(s.error&&s.error.code!="900"){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else{this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken",s.value);e=s.value;let t=await o.decryptID(l,e);let n={buyerID:t.response.value.split("_")[0],supplierID:t.response.value.split("_")[1]};this.getOwnerComponent().getModel("AuthModel").setProperty("/token",t.response.value.split("_")[2]);let r=await o.getSupplier(n,e);if(r.response){if(r.response.error){let e=`Failed to get Supplier information \nError code ${r.response.error.code}`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true);this.getOwnerComponent().getModel("LandingText").setProperty("/report",true)}else{if(r.response.supplier.error){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",true)}else if(r.response.supplier){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",false);this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",r.response.supplier);console.log(this.getOwnerComponent().getModel("SupplierInfo"));await this._getBuyerInfo(r.response.supplier.buyerID);this.onResendOTPLinkPress();this.getView().getModel("PageModel").setProperty("/pageFlow/otp",true)}}}else{let e=`Failed to get Supplier information \nError catched`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true);this.getOwnerComponent().getModel("LandingText").setProperty("/invalid",true)}}},onResendOTPLinkPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let r=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");let i=t.emailID;let l=await o.getEmailTemplate("OPT1",e);let s=l?.emailSubject;let p=l?.emailBody;let a={bCardInfoOTP:true,pID:this._GUID,smtpDestination:r.smtpDestination,mailTo:i,mailSubject:s,mailContent:p};let g=await o.sendMailOTP(a,e);if(g.response.ok===true){n.show("Sent OTP")}else{let e=await g.response.json();if(e.error.code=="900"){n.show("Reach OTP limit")}else{n.show("Failed to send OTP")}}},onContinueButtonPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getView().byId("idOTP.Input").getValue();let r={bCardInfoOTP:true,pID:this._GUID,pOTP:t};try{await o.checkOTP(r,e);let t=this.getOwnerComponent().getRouter();t.navTo("CardInfo")}catch(e){let t=e.message;let o;if(t==="Error: Invalid"){o="Invalid OTP";n.show(o)}else{o="Your OTP is expired";n.show(o)}}},_getBuyerInfo:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let n={buyerID:e};let r=await o.getBuyer(n,t);if(r.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",r.response.value.buyer)}let i=await o.getBuyerOnboarding(n,t);if(i.response.value.buyerOnboarding.value[0]){let e={pID:i.response.value.buyerOnboarding.value[0].vbipID};let n=await o.getVBIP(e,t);if(n.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",n.response.value.vbip)}}},_onObjectMatched:function(e){this._GUID=e.getParameter("arguments").token}})});