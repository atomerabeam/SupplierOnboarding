const crypto = require("crypto");
const credentialStore = require("./credentialStore")
/**
 * Encrypt Data using CryptoKey
 * Input:
 * - vkeyID(String): supplier ID 
 * - vDataTobeEncrypted(LargeBinary): File Content as Base64
 * Return:
 * - encryptedData(LargeBinary): Encrypted Data
 */
async function encryptData(vkeyID, vDataTobeEncrypted) {

    // Get Stored JWK in Credential Store
    let oBinding = credentialStore.getBinding()
    vDataTobeEncrypted = convertBase64toArrayBuffer(vDataTobeEncrypted)
    const credential = await credentialStore.readCredential(oBinding, "VISA-Credentials", "password", "JWK_Crypto_Key")
    const sJWKKey = credential.value
    // console.log("sJWKKey: " + sJWKKey)
    // Export to CryptoKey
    const oExportedKeyNoChange = {
        key_ops: ['encrypt', 'decrypt'],
        ext: true,
        kty: 'oct',
        k: sJWKKey,
        alg: 'A256GCM'
    }
    const oCryptoKey = await crypto.subtle.importKey("jwk", oExportedKeyNoChange, "AES-GCM", true, ['encrypt', 'decrypt'])
    
    // Min vkeyID lenght >= 6
    if (vkeyID == null || vkeyID === "") {
        vkeyID = sJWKKey;
    }
    while (vkeyID.length < 6) {
        vkeyID = vkeyID + vkeyID; 
    }
    //iv Array Buffer
    let aBuffer = new ArrayBuffer(vkeyID.length * 2); // 2 bytes for each char
    let aBuffView = new Uint16Array(aBuffer);
    strLen = vkeyID.length;
    for (let i = 0; i < strLen; i++) {
        aBuffView[i] = vkeyID.charCodeAt(i);
    }

    //Encrypt File Content
    let encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: aBuffer },
        oCryptoKey,
        vDataTobeEncrypted
    )
    let encryptedBase64Content = convertArrayBuffertoBase64(encryptedData)
    return encryptedBase64Content
}
/**
     * Decrypt Data using CryptoKey
     * Input:
     * - vkeyID(String): supplier ID 
     * - vDataTobeDecrypted(LargeBinary-Base64): Encrypted Array Buffer
     * Return:
     * - fileContent(LargeBinary-Base64): fileContent as Base64 format
     */
async function decryptData(vkeyID, vDataTobeDecrypted) {
    vDataTobeDecrypted = convertBase64toArrayBuffer(vDataTobeDecrypted)
    // Get Stored JWK in Credential Store
    let oBinding = credentialStore.getBinding()
    const credential = await credentialStore.readCredential(oBinding, "VISA-Credentials", "password", "JWK_Crypto_Key")
    const sJWKKey = credential.value
    // Export to CryptoKey
    const oExportedKeyNoChange = {
        key_ops: ['encrypt', 'decrypt'],
        ext: true,
        kty: 'oct',
        k: sJWKKey,
        alg: 'A256GCM'
    }
    const oCryptoKey = await crypto.subtle.importKey("jwk", oExportedKeyNoChange, "AES-GCM", true, ['encrypt', 'decrypt'])
    
    // Min vkeyID lenght >= 6
    if (vkeyID == null || vkeyID === "") {
        vkeyID = sJWKKey;
    }
    while (vkeyID.length < 6) {
        vkeyID = vkeyID + vkeyID; 
    }
    //iv Array Buffer
    let aBuffer = new ArrayBuffer(vkeyID.length * 2); // 2 bytes for each char
    let aBuffView = new Uint16Array(aBuffer);
    strLen = vkeyID.length;
    for (let i = 0; i < strLen; i++) {
        aBuffView[i] = vkeyID.charCodeAt(i);
    }

    //Decrypt File Content
    let decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: aBuffer },
        oCryptoKey,
        vDataTobeDecrypted,
    )
    //Convert Decrypted Array Buffer to file Content as Binary String
    // let fileContent = _arrayBufferToString(decryptedData)
    let fileContent = convertArrayBuffertoBase64(decryptedData)
    return fileContent
}

function convertArrayBuffertoBase64(aBuffer) {
    var binary = '';
    var bytes = new Uint8Array(aBuffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);

}
function convertBase64toArrayBuffer(vBase64) {
    var binary_string = atob(vBase64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }

    return bytes.buffer;
}

function _arrayBufferToString(aBuffer) {
    var binary = '';
    var bytes = new Uint8Array(aBuffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary
}
module.exports = { encryptData, decryptData, convertArrayBuffertoBase64, convertBase64toArrayBuffer };