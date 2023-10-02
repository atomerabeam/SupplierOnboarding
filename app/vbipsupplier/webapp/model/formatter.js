sap.ui.define([], function () {
    "use strict";

    return {
        countryFormatter: function (sCountryCode) {
            let aCountries = this.getOwnerComponent().getModel("Countries").getData()
            let oCountry = aCountries.find((oCountry) => {
                return oCountry.code === sCountryCode
            })
            return oCountry.name
        }
    };
});