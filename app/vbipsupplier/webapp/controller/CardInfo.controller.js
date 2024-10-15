sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"../model/models",
	"sap/m/MessageToast",
	"sap/ui/core/ws/WebSocket",
	"sap/m/BusyIndicator",
	"sap/m/MessageBox",
], function (
	Controller, JSONModel, Models, MessageToast,WebSocket,BusyIndicator,MessageBox
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
				let sToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/token")
				let oParameter = { "vbipRequestID": sToken }
				console.log(oParameter)
				
				this.getView().byId("BI").setVisible(true);  // To show

				let oCardInfo = await Models.getCardInfo(oParameter, sAuthToken)
				if (oCardInfo.response) {
					let oCardInfoModel = new JSONModel(Object.assign({"btnIcon": "sap-icon://hide"},oCardInfo.response))
					let oCardInfoDisplayModel = new JSONModel(oCardInfoModel.getData())
					this.getView().setModel(oCardInfoModel, "CardInfo")
					this.getView().setModel(Object.assign(oCardInfoDisplayModel), "CardInfoDisplay")
					this.getView().getModel("PageModel").setProperty("/pageFlow/cardInfo", true);
					this.onShowInfor();
					// this.connectWebSocket();
				} else {
					let oRouter = this.getOwnerComponent().getRouter();
					MessageBox.error("We're sorry, we couldn't retrieve the details. Please try again.", {
						actions: ["Try Again", MessageBox.Action.CLOSE],						
						onClose: function (sAction) {
							oRouter.navTo("Card", {
								token: "NotFound"
							});
						},
						dependentOn: this.getView()
					});
					

				}
				this.getView().byId("BI").setVisible(false); // To hide
			} else {
				let oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("Card", {
					token: "NotFound"
				});
			}
			
			/* WB
			 // Create WebSocket connection.
            var ws = new WebSocket("ws://localhost:8080");

            // Connection opened
            ws.onopen = function () {
                console.log("WebSocket connection established.");
            };

            // Listen for messages
            ws.onmessage = function (event) {
                var data = JSON.parse(event.data);
                console.log("Message from server:", data);

                // Update your model with the received data
                oModel.setProperty("/serverMessage", data.message);
                oModel.setProperty("/timestamp", data.timestamp);
            };

            // Connection closed
            ws.onclose = function () {
                console.log("WebSocket connection closed.");
            };

            // Connection error
            ws.onerror = function (error) {
                console.error("WebSocket error:", error);
            };
			*/


		},
		connectWebSocket : function (){
			let sAuthToken = this.getOwnerComponent().getModel("AuthModel").getProperty("/BuyerToken");
			let sBuyerURL = this.getOwnerComponent().getModel("AuthModel").getProperty("/BuyerURL");

			// Assuming the server accepts the token as a query parameter for authentication
			var ws = new WebSocket(`wss://${sBuyerURL}/odata/v4/catalog/ShedulePaymentCallResponse, [${sAuthToken}]`);			
		
			ws.onopen = function () {
				console.log("WebSocket connection established.");
			};
		
			ws.onmessage = function (event) {
				var message = JSON.parse(event.data);
                if (message.type === 'paymentCred') {
                    console.log('Supplier update received:', message.data);
					this.onShowInfor();
                    // Update your UI with the supplier data
                }
			}.bind(this);
		
			ws.onerror = function (error) {
				console.error("WebSocket error:", error);
			};
		
			ws.onclose = function () {
				console.log("WebSocket connection closed.");
			};
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