// const cds = require("@sap/cds");
const oConnect = require('@sap-cloud-sdk/connectivity');
const CryptoJS = require('crypto-js');

async function getToken(sDestionation) {
    const oDestination = await oConnect.getDestination({ destinationName: sDestionation });
    // const oDestination = await oConnect.getAllDestinationsFromDestinationService()
    let vAuthType = oDestination.authTokens[0].type;
    let vAuthToken = oDestination.authTokens[0].value;
    let oResult = {
        "token": vAuthType + " " + vAuthToken,
        "url": oDestination.url
    };
    // console.log(oDestination);
    return oResult;
}

async function decryptID(pID) {
    const secretKey = "visaproject";
    let data = "1000010002_1000018989";

    // Encrypt
    let encryptedData = await CryptoJS.AES.encrypt(data, secretKey).toString();
    console.log(encryptedData)
    const encoded = encodeURIComponent(encodeURIComponent(encryptedData));
    // ...index.html#/Supplier/encoded 
    console.log("encodedURI 2", encoded);

    // Decrypt
    let decodeURI = decodeURIComponent(pID);
    let decrypt = await CryptoJS.AES.decrypt(decodeURI, secretKey);
    let decryptedData = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}

module.exports = { getToken, decryptID };

