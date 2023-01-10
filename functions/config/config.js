module.exports = {
  mongodbUri: "",
  firebaseProjectId: "",
  port: "3000",
  mongodb: {
    url: "mongodb://localhost:27017/darajaAPI",
  },
  auth: {
    url:
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
  },
  lipaNaMpesa: {
    processRequest:
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    queryRequest: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    key: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    shortCode: "174379",
    consumerKey: "H65FlGErvyuFvsajRekG9zcRdnQ30kHO",
    consumerSecret: "2ARcZPg7Gc8gWFBd",
    callBackURL: "https://api.sample.co.ke/api/v1/lipaNaMpesaService/callback",
  },
  validationConfirm: {
    registerURLs: "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
    consumerKey: "3uHElGTxJIBqf3LfcUJ8UJPYmV8sX25s",
    consumerSecret: "PbhGFEm9Adu0VA7g",
    shortCode: "600169",
    confirmationURL: "https://api.binary.co.ke/v1/payBill/confirmation",
    validationURL: "https://api.sample.co.ke/v1/account/validation",
    responseType: "Completed",
  },
};
