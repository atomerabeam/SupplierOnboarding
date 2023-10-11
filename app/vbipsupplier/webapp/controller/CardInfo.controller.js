sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"../model/models",
	"sap/m/MessageToast"
], function (
	Controller, JSONModel, Models, MessageToast
) {
	"use strict";

	return Controller.extend("vbipsupplier.controller.CardInfo", {
		/**
		 * @override
		 */
		onInit: async function () {
			// let oCardInfoModelDisplay = new JSONModel()
		    // this.getView().setModel(oCardInfoModelDisplay, "CardInfoDisplay")
			let sAuthToken = ""
			let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
			let oPageModel = new JSONModel();
            let oPageFlow = {
                "cardInfo": false
            };
            oPageModel.setProperty("/pageFlow", oPageFlow);
            this.getView().setModel(oPageModel, "PageModel");

			if (oSupplier !== undefined) {
				sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
				let oParameter = { "vbipRequestID": oSupplier.buyerID.concat(oSupplier.supplierID) }
				console.log(oParameter)
				let oCardInfo = await Models.getCardInfo(oParameter, sAuthToken)
				if (oCardInfo.response) {
					let oCardInfoModel = new JSONModel(Object.assign({"btnIcon": "sap-icon://hide"},oCardInfo.response))
					let oCardInfoDisplayModel = new JSONModel(oCardInfoModel.getData())
					this.getView().setModel(oCardInfoModel, "CardInfo")
					this.getView().setModel(Object.assign(oCardInfoDisplayModel), "CardInfoDisplay")
					this.getView().getModel("PageModel").setProperty("/pageFlow/cardInfo", true);
					this.onShowInfor()
				} else {
					let oRouter = this.getOwnerComponent().getRouter();
					oRouter.navTo("Card", {
						token: "NotFound"
					});
				}
			} else {
				let oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("Card", {
					token: "NotFound"
				});
			}
		},

		onShowInfor: function(){
			let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/authToken")
			let oModelDisplay = this.getView().getModel("CardInfoDisplay");
			let oModel = this.getView().getModel("CardInfo");
			let vButton = oModel.getProperty("/btnIcon");
			let vCardNumber = oModel.getProperty("/cardNumber");
			let vCvv2 = oModel.getProperty("/cvv2");
			let vExpiredate = oModel.getProperty("/expiredate");
			if(vButton === "sap-icon://hide"){
				oModel.setData({
					"cardNumber": this._translateString(vCardNumber),
					"cvv2": this._translateString(vCvv2),
					"expiredate": this._translateString(vExpiredate),
					"btnIcon": "sap-icon://show"
				})
				
			} else {
				oModel.setData(oModelDisplay.getData())
			};
		},
		_translateString: function(vString){
			let vLength = vString.toString().length;
			vString = "";
			return vString.toString().padEnd(vLength,"*");
			
		}
	});
});