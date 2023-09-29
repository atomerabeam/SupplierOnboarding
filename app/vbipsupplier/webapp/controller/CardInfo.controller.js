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
			let oSupplier = this.getOwnerComponent().getModel("SupplierInfo").getProperty("/supplier");
			let oPageModel = new JSONModel();
            let oPageFlow = {
                "cardInfo": false
            };
            oPageModel.setProperty("/pageFlow", oPageFlow);
            this.getView().setModel(oPageModel, "PageModel");

			if (oSupplier !== undefined) {
				let oParameter = { "vbipRequestID": oSupplier.buyerID.concat(oSupplier.supplierID) }
				let oCardInfo = await Models.getCardInfo(oParameter)
				if (oCardInfo.response) {
					let oCardInfoModel = new JSONModel(oCardInfo.response)
					this.getView().setModel(oCardInfoModel, "CardInfo")
					this.getView().getModel("PageModel").setProperty("/pageFlow/cardInfo", true);
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

		getCardInfo: function () {

		}
	});
});