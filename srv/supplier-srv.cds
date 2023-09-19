service Supplier {
    type typeSupplier {
        buyerID            : String(10);
        supplierID         : String(10);
        supplierName       : String(100);
        countryCode        : String;
        status             : String(20);
        SAPCustomer        : Boolean;
        businessRegNum     : String(10);
        accountNumber      : String(10);
        bankCode           : String(10);
        businessNature     : String;
        shareHolderCount   : Integer;
        emailID            : String(240);
        completeAddress    : String(40);
        zipCode            : String(09);
        city               : String(20);
        state              : String(27);
        tcConsent          : Boolean;
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
    action getNothing();
    action sendMail(smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action sendMailOTP(pID: String, smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action checkOTP(pID: String, pOTP: String) returns String;
    action decryptID(pID: String) returns String;
}
