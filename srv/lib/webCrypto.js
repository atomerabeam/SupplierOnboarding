// const { oSubtle } = require('node:crypto').webcrypto;
const crypto = require('crypto');

async function generateOTP() {


    const dataTobeEncrypted = {
        "name": "Hao",
        "age": "10"
    };

    const key = await crypto.subtle.generateKey({
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);

    const iv = crypto.getRandomValues(new Uint8Array(16));


    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        JSON.stringify(dataTobeEncrypted),
    );
}

module.exports = { generateOTP };