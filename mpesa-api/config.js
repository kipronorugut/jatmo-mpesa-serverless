require("dotenv").config();

module.exports = {
  firebaseConfig: {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  },
  mongodb: {
    mongoUrl: process.env.MONGODB_URL,
  },
  auth: {
    authurl: process.env.AUTH_URL,
  },
  lipaNaMpesa: {
    processRequest: process.env.STK_PROCESS_REQUEST,
    queryRequest: process.env.STK_QUERY_REQUEST,
    key: process.env.STK_KEY,
    shortCode: process.env.STK_SHORT_CODE,
    consumerKey: process.env.STK_CONSUMER_KEY,
    consumerSecret: process.env.STK_CONSUMER_SECRET,
    callBackURL: process.env.STK_CALLBACK_URL,
  },
  validationConfirm: {
    registerURLs: process.env.C2B_REGISTER_URLS,
    consumerKey: process.env.C2B_CONSUMER_KEY,
    consumerSecret: process.env.C2B_CONSUMER_SECRET,
    shortCode: process.env.C2B_SHORT_CODE,
    confirmationURL: process.env.C2B_CONFIRMATION_URL,
    validationURL: process.env.C2B_VALIDATION_URL,
    responseType: process.env.C2B_RESPONSE_TYPE,
  },
};
