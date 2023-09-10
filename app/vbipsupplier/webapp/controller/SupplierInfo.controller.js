sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Models, MessageToast) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.SupplierInfo", {
            onInit: function () {
                this._onInitModel();
                // let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // oRouter.getRoute("Supplier").attachPatternMatched(this._onObjectMatched, this);
            },
            onContinue: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoRequest", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", true);
            },
            onConfirmInfo: function () {
                this.getView().getModel("PageModel").setProperty("/pageFlow/infoConfirm", false);
                this.getView().getModel("PageModel").setProperty("/pageFlow/corporate", true);
            },
            onReportInfo: function () {
            
            },
            // _onObjectMatched: function (oEvent) {
            //     this._GUID = oEvent.getParameter("arguments").GUID;
            // },
            _onInitModel: async function () {
                let oPageModel = new JSONModel();
                let OpageFlow = {
                    "infoRequest": true,
                    "infoConfirm": false,
                    "corporate": false,
                    "shareHolder": false,
                };
                oPageModel.setProperty("/pageFlow", OpageFlow);
                // Set model
                this.getView().setModel(oPageModel, "PageModel");
            }
        });
    });
