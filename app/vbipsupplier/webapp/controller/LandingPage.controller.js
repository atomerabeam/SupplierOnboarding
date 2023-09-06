sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/models"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Models) {
        "use strict";

        return Controller.extend("vbipsupplier.controller.LandingPage", {
            onInit: function () {

            },

            onContinueButtonPress: async function () {
                let oResult = await Models.testAPI();
                console.log(oResult);
            },
        });
    });
