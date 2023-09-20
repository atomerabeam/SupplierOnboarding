// const cds = require("@sap/cds");
const oConnect = require('@sap-cloud-sdk/connectivity');
const CryptoJS = require('crypto-js');

async function getToken () {
    const oVisaDesInf = await oConnect.getDestination({destinationName: "VBIP-API"});
    // const oVisaDesInf1 = await oConnect.getDestination({destinationName: "VISAProcesses-srv"});
    // const oVisaDesInf2 = await oConnect.getAllDestinationsFromDestinationService()
    let vAuthType  = oVisaDesInf.authTokens[0].type;
    let vAuthToken = oVisaDesInf.authTokens[0].value;
    let oResult = {
        "token" :  vAuthType + " " + vAuthToken,
        "url": oVisaDesInf.url
    };
    // console.log(oVisaDesInf);
    return oResult;
}

async function decryptID (pID) {
    const secretKey = "visaproject";
    let data = "1000010002_1000018989";
    
    // Encrypt
    let encryptedData = await CryptoJS.AES.encrypt(data, secretKey).toString();
    console.log(encryptedData)
    const encoded = encodeURIComponent(encodeURIComponent(encryptedData));
    // ...index.html#/Supplier/encoded 
    console.log("encodedURI", encodeURIComponent(encryptedData));
    console.log("encodedURI 2", encoded);
    console.log("decodedURI", decodeURIComponent(encodeURIComponent(encoded)));
    console.log("decodedURI 2", decodeURIComponent(decodeURIComponent(encoded)));

    // Decrypt
    console.log("decodedURI pID", decodeURIComponent(pID));
    let decodeURI = decodeURIComponent(pID);
    let decrypt  = await CryptoJS.AES.decrypt(decodeURI, secretKey);
    let decryptedData = decrypt.toString(CryptoJS.enc.Utf8);
    console.log("decryptedData", decryptedData);
    return decryptedData;
}

module.exports = { getToken, decryptID };