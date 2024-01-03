sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(t,e){"use strict";return{createDeviceModel:function(){var n=new t(e);n.setDefaultBindingMode("OneWay");return n},authorize:async function(t){try{const e=await fetch("/odata/v4/auth/Authorize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});return await e.json()}catch(t){return t}},authorizeCode:async function(t){try{const e=await fetch("/odata/v4/auth/AuthorizeCode",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});return await e.json()}catch(t){return t}},getSupplier:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/getSupplier",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});try{let t=await a.json();n.response=t.value}catch(t){n.response=a;n.error=t}}catch(t){n.error=t}return n},getBuyer:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/getBuyer",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},getBuyerOnboarding:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/getBuyerOnboarding",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},getVBIP:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/getVBIP",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},getBusinessNature:async function(t){let e={response:{},catchError:{}};try{const n=await fetch("/odata/v4/supplier/getBusinessNature",{method:"POST",headers:{"Content-Type":"application/json",Authorization:t}});e.response=await n.json()}catch(t){e.catchError=t}return e},getDocumentType:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/getDocumentType",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},updateSupplier:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/updateSupplier",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},updateSupplierB1:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/updateSupplierB1",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},sendMailOTP:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/sendMailOTP",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=a}catch(t){n.catchError=t}return n},checkOTP:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/checkOTP",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json();if(a.ok){return n.response}else{throw new Error(n.response.error.message)}}catch(t){throw new Error(t)}},decryptID:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/decryptID",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},encryptFile:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/encryptFile",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},decryptFile:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/decryptFile",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},checkMalware:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/malwareScanning",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},encryptString:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/encryptString",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},decryptString:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/decryptString",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},submitSupplier:async function(t,e){let n={response:{},catchError:{}};try{const a=await fetch("/odata/v4/supplier/submitSupplier",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},checkService:async function(){try{const t=await fetch("/odata/v4/supplier/checkService",{method:"POST",headers:{"Content-Type":"application/json"}})}catch(t){}},getCardInfo:async function(t,e){let n={};try{const a=await fetch("/odata/v4/supplier/getCardInfo",{method:"POST",headers:{"Content-Type":"application/json",Authorization:e},body:JSON.stringify(t)});n.response=await a.json()}catch(t){n.catchError=t}return n},reportInfo:async function(t,e){try{const n=await fetch(`/odata/v4/supplier/reportInfo(buyerID='${t.sBuyerID}',supplierID='${t.sSupplierID}')`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:e}});return n}catch(t){return t}},getCountries:async function(t,e){try{const n=await fetch("/odata/v4/supplier/get3DigitCountry()",{method:"GET",headers:{"Content-Type":"application/json",Authorization:e}});let a=await n.json();t.setData(a.value)}catch(t){return null}},get3DigitCountry:async function(t,e){try{const n=await fetch(`/odata/v4/supplier/get3DigitCountry(code2='${t}')`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:e}});let a=await n.json();return a.value}catch(t){return t}},getEmailTemplate:async function(t,e){try{const n=await fetch(`/odata/v4/supplier/getEmailTemplate(type='${t}')`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:e}});let a=await n.json();return a.value}catch(t){return t}},getCountryDocument:async function(t,e){try{const n=await fetch(`/odata/v4/supplier/getCountryDocument(country='${t.country}',businessNature='${t.businessNature}')`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:e}});let a=await n.json();return a.value}catch(t){return t}}}});