// using my.namespace as my from '../db/sample';

service Supplier {
    // entity Sample as projection on my.Sample;
    action getSupplier(pID: String) returns String;
    action getBuyer(pID: String) returns String;
    action getBuyerOnboarding(pID: String) returns String;
    action getVBIP(pID: String) returns String;
    action getBusinessNature() returns String;
    action getNothing();
    action sendMail(smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action sendMailOTP(pID: String, smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action checkOTP(pID: String, pOTP: String) returns String;
}
