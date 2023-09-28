using my.visaModels as sp from '../db/supplier';

service Supplier {
    
type cardInfo     : {
    cardNumber : String;
    cvv2       : String;
    expiredate : String;
}

type errorPayload : array of {
    errorCode    : String;
    errorMessage : String;
}

action getSupplier(buyerID : String, supplierID : String) returns String;
action getBuyer(buyerID : String) returns String;
action getBuyerOnboarding(buyerID : String) returns String;
action getVBIP(pID : String) returns String;
action getBusinessNature() returns String;
action updateSupplier(buyerID : String, supplierID : String, oSupplier : sp.typeSupplier) returns String;
action checkService() returns String;
action sendMail(smtpDestination : String, mailTo : String, mailSubject : String, mailContent : String) returns String;
action sendMailOTP(pID : String, smtpDestination : String, mailTo : String, mailSubject : String, mailContent : String) returns String;
action checkOTP(pID : String, pOTP : String) returns String;
action decryptID(pID : String) returns String;
action encryptFile(ID : String, fileContent : LargeString) returns LargeString;
action decryptFile(ID : String, fileContent : LargeBinary) returns LargeBinary;
action malwareScanning(fileContent : LargeString) returns Boolean;
action submitSupplier(oSupplier : sp.typeSupplierOnboarding) returns String;
action getCardInfo(vbipRequestID : String) returns cardInfo;
}
