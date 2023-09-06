// using my.namespace as my from '../db/sample';

service Supplier {
    // entity Sample as projection on my.Sample;
    action getSupplier(pID: String) returns String; 
    action sendMail(smtpDestination: String, mailTo: String, mailSubject: String, mailContent: String) returns String; 
}
