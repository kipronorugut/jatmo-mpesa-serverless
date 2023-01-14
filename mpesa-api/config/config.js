const cfg = require("../env.json");

module.exports = {
  firebaseConfig: {
    apiKey: cfg.fb.apikey,
    authDomain: cfg.fb.authdomain,
    projectId: cfg.fb.projectid,
    storageBucket: cfg.fb.storagebucket,
    messagingSenderId: cfg.fb.messagingsenderid,
    appId: cfg.fb.appid,
    measurementId: cfg.fb.measurementid,
  },
  mongodb: {
    mongoUrl: cfg.mongodb.url,
  },
  lipaNaMpesa: {
    processRequest: cfg.lipanampesa.processrequest,
    queryRequest: cfg.lipanampesa.queryrequest,
    key: cfg.lipanampesa.key,
    shortCode: cfg.lipanampesa.shortcode,
    consumerKey: cfg.lipanampesa.consumerkey,
    consumerSecret: cfg.lipanampesa.consumersecret,
    callBackURL: cfg.lipanampesa.callbackurl,
  },
  validationConfirm: {
    registerURLs: cfg.validationconfirm.registerurls,
    consumerKey: cfg.validationconfirm.consumerkey,
    consumerSecret: cfg.validationconfirm.consumersecret,
    shortCode: cfg.validationconfirm.shortcode,
    confirmationURL: cfg.validationconfirm.confirmationurl,
    validationURL: cfg.validationconfirm.validationurl,
    responseType: cfg.validationconfirm.responsetype,
  },
};
