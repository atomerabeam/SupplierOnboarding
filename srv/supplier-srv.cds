// using my.namespace as my from '../db/sample';

service Supplier {
    // entity Sample as projection on my.Sample;
    action getSupplier(pID: String) returns String;
    action sendMail(smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action sendMailOTP(pID: String, smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String;
    action checkOTP(pID: String, pOTP: String) returns String;
}
