sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	Controller
) {
	"use strict";

	return Controller.extend("vbipsupplier.controller.CardLandingPage", {
        /**
         * @override
         */
        onInit: function() {
            Controller.prototype.onInit.apply(this, arguments);
            
        
        },

        sendOTPEmail:function(){
            
        },

        checkOTP: function(){

        }

	});
});