sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast"],function(e,t,o,r){"use strict";return e.extend("vbipsupplier.controller.CardLandingPage",{onInit:async function(){this.getOwnerComponent().setModel(new t({authToken:""}),"AuthModel");let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",{});this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",{});this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",{});let r=new t;let n={otp:false,landing:false,landingText:{invalid:true,expire:false}};r.setProperty("/pageFlow",n);this.getView().setModel(r,"PageModel");let s=sap.ui.core.UIComponent.getRouterFor(this);s.getRoute("Card").attachPatternMatched(this._onObjectMatched,this);await o.checkService();let l={pID:this._GUID};let i=await o.authorize({encryptedUrl:this._GUID});if(i.error&&i.error.code!="900"){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else{this.getOwnerComponent().getModel("AuthModel").setProperty("/authToken","");e="";let t=await o.decryptID(l,e);let r={buyerID:t.response.value.split("_")[0],supplierID:t.response.value.split("_")[1]};let n=await o.getSupplier(r,e);if(n.response){if(n.response.error){let e=`Failed to get Supplier information \nError code ${n.response.error.code}`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else{if(n.response.supplier.error){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}else if(n.response.supplier){this.getView().getModel("PageModel").setProperty("/pageFlow/landing",false);this.getOwnerComponent().getModel("SupplierInfo").setProperty("/supplier",n.response.supplier);console.log(this.getOwnerComponent().getModel("SupplierInfo"));await this._getBuyerInfo(n.response.supplier.buyerID);this.onResendOTPLinkPress();this.getView().getModel("PageModel").setProperty("/pageFlow/otp",true)}}}else{let e=`Failed to get Supplier information \nError catched`;this.getView().getModel("PageModel").setProperty("/pageFlow/landing",true)}}},onResendOTPLinkPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let n=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/VBIP");let s=t.emailID;let l={bCardInfoOTP:true,pID:this._GUID,smtpDestination:n.smtpDestination,mailTo:s,mailSubject:"VBIP Supplier OTP",mailContent:`<strong>Dear Supplier</strong><br/><br/>\n                                <p>Your OTP code is [OTP]</p><br/><p>Thanks</p>`};let i=await o.sendMailOTP(l,e);if(i.response.ok===true){r.show("Sent OTP")}else{let e=await i.response.json();if(e.error.code=="900"){r.show("Reach OTP limit")}else{r.show("Failed to send OTP")}}},onContinueButtonPress:async function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getView().byId("idOTP.Input").getValue();let n={bCardInfoOTP:true,pID:this._GUID,pOTP:t};try{await o.checkOTP(n,e);let t=this.getOwnerComponent().getRouter();t.navTo("CardInfo")}catch(e){let t=e.message;let o;if(t==="Error: Invalid"){o="Invalid OTP";r.show(o)}else{o="Your OTP is expired";r.show(o)}}},_getBuyerInfo:async function(e){let t=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r={buyerID:e};let n=await o.getBuyer(r,t);if(n.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/buyer",n.response.value.buyer)}let s=await o.getBuyerOnboarding(r,t);if(s.response.value.buyerOnboarding.value[0]){let e={pID:s.response.value.buyerOnboarding.value[0].vbipID};let r=await o.getVBIP(e,t);if(r.response.value){this.getOwnerComponent().getModel("SupplierInfo").setProperty("/VBIP",r.response.value.vbip)}}},_onObjectMatched:function(e){this._GUID=e.getParameter("arguments").token}})});