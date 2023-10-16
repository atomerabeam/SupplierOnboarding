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
            const [sBuyerID, sSupplierID, sInviteDate] = sRequestID.split("_")
            if (sBuyerID && sSupplierID) {
                let oBuyerService = await vbipService.getToken("VBIP-API");
                const response = await fetch(`${oBuyerService.url}/odata/v4/supplier-onboarding/SupplierInfo(buyerID='${sBuyerID}',supplierID='${sSupplierID}')`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": oBuyerService.token
                    }
                });
                const oSupplierInfo = await response.json()
                console.log(oSupplierInfo)
                if (oSupplierInfo.error) {
                    req.error(oSupplierInfo.error)
                } else {
                    // console.log(oSupplierInfo)
                    const sSupplierInviteDate = new Date(oSupplierInfo.inviteDate).getTime()
                    console.log(sSupplierInviteDate)
                    console.log(sInviteDate)
                    if (sInviteDate == sSupplierInviteDate && 
                        (oSupplierInfo.status === "INV" || oSupplierInfo.status === "SAV" ) ) {
                        
                        // Check valid day for URL
                        if (sSupplierInviteDate < Date.now() - 259200000) {//259200000ms = 3days
                            req.error(900, "URL has expired")
                        }
                        let oSupplierService = await vbipService.getToken("VBIPSupplier-srv");
                        return oSupplierService.token
                    } else {
                        req.error(900, "URL has expired")
                    }
                }
            } else {
                req.error(404)
            }

        } catch (error) {
            req.error(error)
        }


    })

})