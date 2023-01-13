require("dotenv").config();

module.exports = {
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  },
  port: process.env.PORT,
  mongodb: {
    url: process.env.MONGO_URL,
  },
  auth: {
    url: process.env.AUTH_URL,
  },
  lipaNaMpesa: {
    processRequest: process.env.LIPANAMPESA_PROCESS_REQUEST,
    queryRequest: process.env.LIPANAMPESA_QUERY_REQUEST,
    key: process.env.LIPANAMPESA_KEY,
    shortCode: process.env.LIPANAMPESA_SHORT_CODE,
    consumerKey: process.env.LIPANAMPESA_CONSUMER_KEY,
    consumerSecret: process.env.LIPANAMPESA_CONSUMER_SECRET,
    callBackURL: process.env.LIPANAMPESA_CALLBACK_URL,
  },
  validationConfirm: {
    registerURLs: process.env.VALIDATION_CONFIRM_REGISTER_URLS,
    consumerKey: process.env.VALIDATION_CONFIRM_CONSUMER_KEY,
    consumerSecret: process.env.VALIDATION_CONFIRM_CONSUMER_SECRET,
    shortCode: process.env.VALIDATION_CONFIRM_SHORT_CODE,
    confirmationURL: process.env.VALIDATION_CONFIRM_CONFIRMATION_URL,
    validationURL: process.env.VALIDATION_CONFIRM_VALIDATION_URL,
    responseType: process.env.VALIDATION_CONFIRM_RESPONSE_TYPE,
  },
};
