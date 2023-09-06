// const cds = require("@sap/cds");
const oConnect = require('@sap-cloud-sdk/connectivity')

async function getToken(){
    const oVisaDesInf = await oConnect.getDestination({destinationName: "VISAProcesses-srv" });
    let vAuthType  = oVisaDesInf.authTokens[0].type;
    let vAuthToken = oVisaDesInf.authTokens[0].value;
    let oResult = {
        "token" :  vAuthType + " " + vAuthToken,
        "url": oVisaDesInf.url
    };
    return oResult;
}

module.exports = { getToken };