namespace my.visaModels;

using {Country} from '@sap/cds/common';

type typeSupplier {
    buyerID                  : String(10);
    supplierID               : String(15);
    requestID                : String(36);
    supplierName             : String(100);
    status                   : String(20);
    SAPCustomer              : Boolean;
    businessRegNum           : String(10);
    businessNature_selectKey : Integer;
    shareholderCount         : Integer;
    supplierDocuments        : array of typeSupplierDocument;
    shareholderDetails       : array of typeSupplierShareholder;
}

type typeSupplierDocument {
    documentName   : String(100);
    documentType   : String(100);
    documentKey    : String(100);
    nameOnDocument : String(100);
    documentNumber : String;
    fileName       : String(100);
    fileType       : String(50);
    encodedContent : LargeString;
    dateOfBirth    : String;
    issuingDate    : Date;
    expiryDate     : Date;
}

type typeSupplierShareholder {
    shareholderName      : String(100);
    sharePercentage      : Integer;
    shareholderDocuments : array of typeSupplierDocument;
}

type typeSupplierOnboarding {
    vbipRequestId       : String(36);
    isCardAcceptor      : Boolean;
    buyerId             : String(10);
    businessNature      : String;
    shareHolderCount    : Integer;
    supplierInfo        : typeSupplierInfo;
    kycDetails          : typeKycDetails;
    supplierBankingInfo : typeSupplierBankingInfo;
    kycIdentificationNumber : String;
}

type typeSupplierInfo {
    supplierId                    : String(25);
    firstName                     : String(100);
    lastName                      : String(100);
    legalName                     : String(100);
    emailAddress                  : String(240);
    mobileNumberCountryCode       : String(15);
    mobileNumber                  : String(20);
    website                       : String(100);
    companyAdditionalEmailAddress : String(100);
    completeAddress               : String(40);
    zipCode                       : String(9);
    countryCode                   : String(3);
    city                          : String(20);
    state                         : String(27);
}

type typeKycDetails {
    identityProof    : typeIdentifyProof;
    addressProof     : typeAddressProof;
    businessProof    : array of typeBusinessProof;
    shareHolderProof : array of typeShareholderProof;
}

type typeSupplierBankingInfo {
    accountNumber     : String(30);
    bankCode          : String(30);
    accountHolderName : String(36);
    branchCity        : String(36);
}

type typeIdentifyProof {
    documentName   : String(100);
    nameOnDocument : String(100);
    documentNumber : String(20);
    dateOfBirth    : String(10);
    issuingDate    : String(10);
    expiryDate     : String(10);
    fileName       : String(100);
    encodedContent : String;
}

type typeAddressProof {
    documentName   : String(100);
    nameOnDocument : String(100);
    documentNumber : String(20);
    fileName       : String(100);
    encodedContent : String;
}

type typeBusinessProof {
    documentName     : String(100);
    nameOnDocument   : String(100);
    documentNumber   : String(20);
    expiryDate       : String(10);
    fileName         : String(100);
    encodedContent   : String;
    registrationDate : String(10);
}

type typeShareholderProof {
    name            : String(100);
    sharePercentage : Integer;
    identityProof   : typeIdentifyProof;
    documentProof   : typeDocumentProof;
    completeAddress : String(500);
}

type typeDocumentProof {
    documentName   : String(100);
    nameOnDocument : String(100);
    documentNumber : String(20);
    fileName       : String(100);
    encodedContent : String;
}


type typeCountries : array of {
    Code2 : String(2);
    Code3 : String(3);
    Desc  : String(100);
}

type typeCardInfo  : {
    cardNumber : String;
    cvv2       : String;
    expiredate : String;
    status     : String;
}
