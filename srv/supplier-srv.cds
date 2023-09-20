service Supplier {
    type typeSupplier {
        buyerID            : String(10);
        supplierID         : String(10);
        supplierName       : String(100);
        status             : String(20);
        SAPCustomer        : Boolean;
        businessNature     : Integer;
        shareholderCount   : Integer;
        // supplierDocuments  : Composition of many buyer.DocumentDetails
        //                         on supplierDocuments.supplierID = $self;
        // shareHolderDetails : Composition of many SupplierShareHolder
        //                         on shareHolderDetails.supplierID = $self;
    }
    action getSupplier(buyerID: String, supplierID: String) returns String;
    action getBuyer(buyerID: String) returns String;
    action getBuyerOnboarding(buyerID: String) returns String;
    action getVBIP(pID: String) returns String;
    action getBusinessNature() returns String;
    action updateSupplier(buyerID: String, supplierID: String, oSupplier: typeSupplier) returns String;
    action checkService() returns String;
    action sendMail(smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action sendMailOTP(pID: String, smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action checkOTP(pID: String, pOTP: String) returns String;
    action decryptID(pID: String) returns String;
}
