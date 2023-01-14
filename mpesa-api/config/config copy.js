const functions = require("firebase-functions");
console.log(functions.config());
module.exports = {
  firebaseConfig: {
    apiKey: functions.config().fb.apikey,
    authDomain: functions.config().fb.authdomain,
    projectId: functions.config().fb.projectid,
    storageBucket: functions.config().fb.storagebucket,
    messagingSenderId: functions.config().fb.messagingsenderid,
    appId: functions.config().fb.appid,
    measurementId: functions.config().fb.measurementid,
  },
  mongodb: {
    url: functions.config().mongodb.url,
  },
  auth: {
    url: functions.config().auth.url,
  },
  lipaNaMpesa: {
    processRequest: functions.config().lipanampesa.processrequest,
    queryRequest: functions.config().lipanampesa.queryrequest,
    key: functions.config().lipanampesa.key,
    shortCode: functions.config().lipanampesa.shortcode,
    consumerKey: functions.config().lipanampesa.consumerkey,
    consumerSecret: functions.config().lipanampesa.consumersecret,
    callBackURL: functions.config().lipanampesa.callbackurl,
  },
  validationConfirm: {
    registerURLs: functions.config().validationconfirm.registerurls,
    consumerKey: functions.config().validationconfirm.consumerkey,
    consumerSecret: functions.config().validationconfirm.consumersecret,
    shortCode: functions.config().validationconfirm.shortcode,
    confirmationURL: functions.config().validationconfirm.confirmationurl,
    validationURL: functions.config().validationconfirm.validationurl,
    responseType: functions.config().validationconfirm.responsetype,
  },
};
