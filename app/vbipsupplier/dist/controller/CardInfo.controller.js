sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/models","sap/m/MessageToast"],function(e,t,o,n){"use strict";return e.extend("vbipsupplier.controller.CardInfo",{onInit:async function(){let e="";let n=this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");let r=new t;let s={cardInfo:false};r.setProperty("/pageFlow",s);this.getView().setModel(r,"PageModel");if(n!==undefined){e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let r={vbipRequestID:n.buyerID.concat(n.supplierID)};let s=await o.getCardInfo(r,e);if(s.response){let e=new t(Object.assign({btnIcon:"sap-icon://hide"},s.response));let o=new t(e.getData());this.getView().setModel(e,"CardInfo");this.getView().setModel(Object.assign(o),"CardInfoDisplay");this.getView().getModel("PageModel").setProperty("/pageFlow/cardInfo",true);this.onShowInfor()}else{let e=this.getOwnerComponent().getRouter();e.navTo("Card",{token:"NotFound"})}}else{let e=this.getOwnerComponent().getRouter();e.navTo("Card",{token:"NotFound"})}},onShowInfor:function(){let e=this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken");let t=this.getView().getModel("CardInfoDisplay");let o=this.getView().getModel("CardInfo");let n=o.getProperty("/btnIcon");let r=o.getProperty("/cardNumber");let s=o.getProperty("/cvv2");let i=o.getProperty("/expiredate");if(n==="sap-icon://hide"){o.setData({cardNumber:this._translateString(r),cvv2:this._translateString(s),expiredate:this._translateString(i),btnIcon:"sap-icon://show"})}else{o.setData(t.getData())}},_translateString:function(e){let t=e.toString().length;e="";return e.toString().padEnd(t,"*")}})});