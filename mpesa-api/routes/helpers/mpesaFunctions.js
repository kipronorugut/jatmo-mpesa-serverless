const request = require("request");

// Lipa Na M-pesa model
const LipaNaMpesaTxn = require("../api/lipanaMPesa/lipaNaMPesaTnxModel");

const GENERIC_SERVER_ERROR_CODE = "01";

const handleError = (res, message, code) => {
  // Transaction Failed
  res.send({
    status: code || GENERIC_SERVER_ERROR_CODE,
    message: message,
  });
};

/**
 * Send all transaction requests to Safaricom
 */

const sendMpesaTxnToSafaricomAPI = (txnDetails, req, res, next) => {
  request(
    {
      method: "POST",
      url: txnDetails.url,
      headers: {
        Authorization: txnDetails.auth,
      },
      json: txnDetails.transaction,
    },
    (error, response, body) => {
      httpResponseBodyProcessor(
        {
          body: body,
          error,
          error,
        },
        req,
        res,
        next
      );
    }
  );
};

const sendCallbackMpesaTxnToAPIInitiator = (txnDetails, req, res, next) => {
  console.log("Requesting:" + JSON.stringify(txnDetails));
  request(
    {
      method: "POST",
      url: txnDetails.url,
      json: txnDetails.transaction,
    },
    (error, response, body) => {
      httpResponseBodyProcessor(
        {
          body: body,
          error: error,
        },
        req,
        res,
        next
      );
    }
  );
};

const httpResponseBodyProcessor = (responseDate, req, res, next) => {
  console.log("HttpResponseBody Processor:" + JSON.stringify(responseData));
  if (responseData.body) {
    if (responseData.body) {
      if (responseData.body.ResponseCode === "0") {
        console.log("POST Resp:" + JSON.stringify(responsedata.body));
        // Succesful Processing
        req.transactionResp = responseData.body;
        next();
      }
    }
  } else {
    console.log("Error Occured: " + JSON.stringify(responseData.body));
    return handleError(
      res,
      "Invalid remote response",
      responseData.body.error || GENERIC_SERVER_ERROR_CODE
    );
  }
};

const fetchLipaNaMpesaTransaction = (keys, req, res, next) => {
  console.log("Fetch initial transaction request...");
  // Check validity of message
  if (!req.body) {
    handleError(res, "Invalid message received");
  }

  const query = LipaNaMpesaTxn.findOne({
    "mpesaInitResponse.MerchantRequestID": keys.MerchantRequestID,
    "mpesaInitResponse.CheckoutRequestID": keys.CheckoutRequestID,
  });

  // Execute the query at a later time
  const promise = query.exec((err, lipaNaMPesaTransaction) => {
    // Handle Error
    if (err) {
      handleError(res, "Lipa Mpesa transaction not found");
    } else if (!lipaNaMPesaTransaction) {
      console.log("Lipa na Mpesa transaction not found");
      next();
    } else {
      console.log("Transaction request found...");
      // Add transaction to req body
      req.lipaNaMPesaTransaction = lipaNaMPesaTransaction;
      next();
    }
  });
};

const isEmpty = (val) => {
  return !(val !== undefined && val != null && val.length > 0);
};

// Export Model
module.exports = {
  isEmpty: isEmpty,
  handleError: handleError,
  sendMpesaTxnToSafaricomAPI: sendMpesaTxnToSafaricomAPI,
  sendCallbackMpesaTxnToAPIInitiator: sendCallbackMpesaTxnToAPIInitiator,
  fetchLipaNaMpesa: fetchLipaNaMpesaTransaction,
};
