const cds = require("@sap/cds");
const getToken = require("./lib/getToken");

module.exports = cds.service.impl(async (service) => {

    let oAuthToken = await getToken.getToken();

    let oResult = { "response": {}, "catchError": {} }
    try {
        const response = await fetch(`${oAuthToken.url}/odata/v4/btponboarding/BTPOnboarding`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": oAuthToken.token
            }
        });

        oResult.response = await response.json();
        console.log(oResult.response);
    } catch (error) {
        oResult.catchError = error;
    }

})