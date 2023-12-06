using my.visaModels as sp from '../db/supplier';

annotate Supplier with @(requires: 'authenticated-user');

service Supplier {

    action   getSupplier(buyerID : String, supplierID : String)                                                                                       returns String;
    action   getBuyer(buyerID : String)                                                                                                               returns String;
    action   getBuyerOnboarding(buyerID : String)                                                                                                     returns String;
    action   getVBIP(pID : String)                                                                                                                    returns String;
    action   getBusinessNature()                                                                                                                      returns String;
    action   getDocumentType(pCountry : String, pBusinessNature : String)                                                                             returns String;
    action   updateSupplier(buyerID : String, supplierID : String, oSupplier : sp.typeSupplier)                                                       returns String;
    action   checkService()                                                                                                                           returns String;
    action   sendMail(smtpDestination : String, mailTo : String, mailSubject : String, mailContent : String)                                          returns String;
    action   sendMailOTP(bCardInfoOTP : Boolean, pID : String, smtpDestination : String, mailTo : String, mailSubject : String, mailContent : String) returns String;
    action   checkOTP(bCardInfoOTP : Boolean, pID : String, pOTP : String)                                                                            returns String;
    action   decryptID(pID : String)                                                                                                                  returns String;
    action   encryptString(sValue : String)                                                                                                           returns String;
    action   decryptString(sValue : String)                                                                                                           returns String;
    action   encryptFile(ID : String, fileContent : LargeBinary)                                                                                      returns LargeBinary;
    action   decryptFile(ID : String, fileContent : LargeBinary)                                                                                      returns LargeString;
    action   malwareScanning(fileContent : LargeString)                                                                                               returns Boolean;
    action   submitSupplier(oSupplier : sp.typeSupplierOnboarding)                                                                                    returns String;
    action   getCardInfo(vbipRequestID : String)                                                                                                      returns sp.typeCardInfo;
    function getCountries()                                                                                                                           returns sp.typeCountries;
    function reportInfo(buyerID : String, supplierID : String)                                                                                        returns Boolean;
    action   updateSupplierB1(supplierID : String, vbipID : String, companyCode : String)                                                             returns String;
    function get3DigitCountry(code2 : String)                                                                                                         returns String;
}
