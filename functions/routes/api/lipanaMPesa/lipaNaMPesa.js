const express = require("express");
const stkPushRouter = express.Router();

// Lipa Na M-pesa Model
const lipaNaMPesa = require("./lipaNaMPesaTnxModel");
const auth = require("../../auth/auth");
const mpesaFunctions = require("../../helpers/mpesaFunctions");

const config = require("../../../config/config");
const moment = require("moment/moment");

const LIPA_NA_MPESA_SERVICE_NAME = "STK-PUSH";
const GENERIC_SERVER_ERROR_CODE = "01";

const bootstrapRequest = (req, res, next) => {
  req.body.service = LIPA_NA_MPESA_SERVICE_NAME;
  const request = req.body;

  console.log("===========", request.phoneNumber);
  /****************************
     {"amount":"5","phoneNumber":"2547******","callBackURL":"http://some-url","accountReference":"123456","description":"school fees"}
     *******************************/
  if (
    !(
      request.amount ||
      request.phoneNumber ||
      request.callBackURL ||
      request.accountReference ||
      request.description
    )
  ) {
    mpesaFunctions.handleError(res, "Invalid Request Recieved");
  } else {
    const BusinessShortCode = config.lipaNaMPesa.BusinessShortCode;
    const timeStamp = moment().format("YYYYMMDDHmmss");
    const rawPass = BusinessShortCode + config.lipaNaMpesa.key + timeStamp;

    // Request Object
    req.mpesaTransaction = {
      BusinessShortCode: BusinessShortCode,
      Password: Buffer.from(rawPass).toString("base64"),
      Timestamp: timeStamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: BusinessShortCode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: config.lipaNaMpesa.callBackURL,
      AccountReference: request.accountReference,
      TransactionDesc: request.description,
    };
    console.log(" POST Req: " + JSON.stringify(req.mpesaTransaction));
    next();
  }
};

/**
 * Post transaction to Mpesa
 */

const postTransaction = (req, res, next) => {
  // Set URL, AUTH token and Transaction
  mpesaFunctions.sendMpesaTxnToSafaricomAPI(
    {
      url: config.lipaNaMpesa.processRequest,
      auth: "Bearer " + req.transactionToken,
      transaction: req.mpesaTransaction,
    },
    req,
    res,
    next
  );
};

const processResponse = (req, res, next) => {
  // Prepare external response message
  console.log("Process Response");
  req.merchantMsg = {
    status:
      req.transactionResp.ResponseCode === "0"
        ? "00"
        : req.transactionResp.ResponseCode,
    message: req.transactionResp.ResponseDescription,
    merchantRequestID: req.transactionResp.MerchantRequestID,
    checkoutRequestID: req.transactionResp.CheckoutRequestID,
  };
  // Prepare Persistence Object
  const transaction = new lipaNaMPesa({
    request: req.body,
    mpesaInitRequest: req.mpesaTransaction,
    mpesaInitResponse: req.transactionResp,
  });
  // Persist transaction objejct
  transaction.save((err) => {
    if (err) {
      mpesaFunctions.handleError(
        res,
        "Unable to persist lipa na mpesa transaction" + err.message,
        GENERIC_SERVER_ERROR_CODE
      );
    } else {
      next();
    }
  });
};

/**
 * Use this API to initiate online payment on behalf of a customer
 */

stkPushRouter.post(
  "/process",
  bootstrapRequest,
  auth,
  postTransaction,
  processResponse,
  (req, res) => {
    // Check processing status
    res.json(req.merchantMsg);
  }
);

const fetchTransaction = (req, res, next) => {
  console.log("Fetch initial transaction request...");
  // Check validity of message
  if (!req.body) {
    mpesaFunctions.handleError(res, "Invalid message received");
  }

  const query = LipaNaMpesa.findOne({
    "mpesaInitResponse.MerchantRequestID":
      req.body.Body.stkCallback.MerchantRequestID,
    "mpesaInitResponse.CheckoutRequestID":
      req.body.Body.stkCallback.CheckoutRequestID,
  });

  //execute the query at a later time
  query.exec((err, lipaNaMPesaTransaction) => {
    // Handle error
    if (err || !lipaNaMPesaTransaction) {
      mpesaFunctions.handleError(res, "Initial Mpesa transaction not found");
    }
    console.log("Initial transacation request found...");
    // Add transaction to req body
    req.lipaNaMPesaTransaction = lipaNaMPesaTransaction;
    next();
  });
};

const updateTransaction = (req, res, next) => {
  console.log("Update Transaction Callback...");

  const conditions = {
    "mpesaInitResponse.MerchantRequestID":
      req.body.Body.stkCallback.MerchantRequestID,
    "mpesaInitResponse.CheckoutRequestID":
      req.body.Body.stkCallback.CheckoutRequestID,
  };

  const options = { multi: true };

  // Set callback request to existing transacation
  req.lipaNaMPesaTransaction.mpesaCallback = req.body.Body;
  // Update existing Transaction
  LipaNaMpesa.update(conditions, req.lipaNaMPesaTransaction, options, (err) => {
    (err) => {
      mpesaFunctions.handleError(res, "Unable to update transaction", Ge);
    };
    next();
  });
};

const forwardRequestToRemoteClient = (req, res, next) => {
  console.log('Send request to originator..');
  // Forward request to remote server
  mpesaFunctions.sendCallbackMpesaTxnToAPIInitiator({
    url: req.lipaNaMPesaTransaction.mpesaInitRequest.CallBackURL,
    transaction: {
      status: req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.ResultCode === 0 ? : req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.ResultCode,
      message: req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.ResultDesc,
      merchantRequestId: req.lipaNaMPesaTransaction.merchantRequestId,
      mpesaReference: fetchMpesaReferenceNumber(req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.CallbackMetadata.Item)
    }
  }, req, res, next)
};

stkPushRouter.post('/callback',
    fetchTransaction,
    updateTransaction,
    forwardRequestToRemoteClient,
    (req, res) => {
      res.json({
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.'
      })
    }
)

module.exports = stkPushRouter