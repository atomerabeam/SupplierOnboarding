sap.ui.define([], function () {
    "use strict";

    return {
        countryFormatter: function (sCountryCode) {
            let oCountriesModel = this.getOwnerComponent().getModel("Countries")
            if (oCountriesModel) {
                let aCountries = oCountriesModel.getData()
                let oCountry = aCountries.find((oCountry) => {
                    return oCountry.code === sCountryCode
                })
                return oCountry?.name
            }
        },
        dateFormatter: function (oDate) {
            if (oDate) {
                return oDate?.toDateString();
            }
        }
    };
});