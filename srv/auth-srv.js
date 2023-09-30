const cds = require("@sap/cds");
const vbipService = require("./lib/vbipService");
module.exports = cds.service.impl(async (service) => {
    service.on("Authorize", async (req) => {
        try {
            let sEncryptedUrl = req.data.encryptedUrl
            if (!sEncryptedUrl) {
                req.error(401)
            }
            let sRequestID = await vbipService.decryptID(sEncryptedUrl)
            let sBuyerID = sRequestID.split("_")[0]
            let sSupplierID = sRequestID.split("_")[1]
            if (sBuyerID && sSupplierID) {
                let oBuyerService = await vbipService.getToken("VBIP-API");
                const response = await fetch(`${oBuyerService.url}/odata/v4/supplier-onboarding/SupplierInfo(buyerID='${sBuyerID}',supplierID='${sSupplierID}')`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": oBuyerService.token
                    }
                });
                let oJsonResponse = await response.json()
                if(oJsonResponse.error){
                    req.error(401)
                } else{
                    let oSupplierService = await vbipService.getToken("VBIPSupplier-srv");
                    return oSupplierService.token
                }
            
            }
            
        } catch (error) {
            req.error(error)
        }


    })

})