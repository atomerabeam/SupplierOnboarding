// const cds = require("@sap/cds");
    const oConnect = require('@sap-cloud-sdk/connectivity');
const CryptoJS = require('crypto-js');
const { getBinding, readCredential } = require('./credentialStore')

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
    const oBinding = getBinding()
    // console.log(oBinding)
    const oCredential = await readCredential(oBinding, "VISA-Credentials", "password", "URL_Key")
    const secretKey = oCredential?.value
    // const secretKey = "visaproject";
    let data = "2000260001_1000000042_1703844331267";

    // Encrypt
    let encryptedData = await CryptoJS.AES.encrypt(data, secretKey).toString();
    // console.log(encryptedData)
    // const encoded = encodeURIComponent(encryptedData);
    const encoded = encodeURIComponent(encodeURIComponent(encryptedData));
    // ...index.html#/Supplier/encoded 
    console.log("encodedURI 2", encoded);

    // Decrypt
    let decodeURI = decodeURIComponent(pID);
    let decrypt = await CryptoJS.AES.decrypt(decodeURI, secretKey);
    let decryptedData = decrypt.toString(CryptoJS.enc.Utf8); 
    let decodeURI2 = decodeURIComponent(decodeURIComponent(pID));
    let decrypt2 = await CryptoJS.AES.decrypt(decodeURI2, secretKey);
    let decryptedData2 = decrypt2.toString(CryptoJS.enc.Utf8); 
    // console.log("decodedURI 2", decryptedData2);
    return decryptedData;
}

async function encryptString(sValue) {

    const oBinding = getBinding();
    const oCredential = await readCredential(oBinding, "VISA-Credentials", "password", "URL_Key");
    const secretKey = oCredential?.value;
    // const secretKey = "visaproject";

    // Encrypt
    let data = CryptoJS.AES.encrypt(sValue, secretKey).toString();
    return data;
}


async function decryptString(sValue) {
    const oBinding = getBinding();
    const oCredential = await readCredential(oBinding, "VISA-Credentials", "password", "URL_Key");
    const secretKey = oCredential?.value;
    let data;
    // Decrypt
    if (sValue !== null) {
        data = CryptoJS.AES.decrypt(sValue, secretKey).toString(CryptoJS.enc.Utf8);
    } else {
        data = "";
    }
    return data;
}
/**
 * Decrypting data with Crypto-JS library
 * @param {*} encryptedData 
 * @returns decrypted Data
 */
async function decryptData(sRequestID, encryptedData){
    let decrypt = await CryptoJS.AES.decrypt(encryptedData, sRequestID);
    let decryptedData = decrypt.toString(CryptoJS.enc.Utf8); 
    return decryptedData
}

module.exports = { getToken, decryptID, decryptData, encryptString, decryptString };

