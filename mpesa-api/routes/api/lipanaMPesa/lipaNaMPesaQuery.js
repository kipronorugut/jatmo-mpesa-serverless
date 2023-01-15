const express = require("express");
const lipaNaMPesaQueryRouter = express.Router();
const auth = require("../../auth/auth");
const moment = require("moment");

const mpesaFunctions = require("../../helpers/mpesaFunctions");
// Then load config from a designated file.
const config = require("../../../config");

const LIPA_NA_MPESA_SERVICE_NAME = "STK-PUSH";

const queryDBForRecord = (req, res, next) => {
  req.body.service = LIPA_NA_MPESA_SERVICE_NAME;
  // Check validity of request
  if (!req.body) {
    mpesaFunctions.handleError(res, "Invalid message receieved");
  }

  //Fetch from Database
  mpesaFunctions.fetchLipaNaMpesa(
    {
      MerchantRequestID: req.body.MerchantRequestId,
      CheckoutRequestID: req.body.checkoutRequestId,
    },
    req,
    res,
    next
  );
};

const confirmSourceOfTrnx = (req, res, next) => {
  // If transaction is not found, query Safaricom for result
  if (req.lipaNaMPesaTransaction) {
    req.txnFoundLocally = true;
    next();
  } else {
    console.log("Query Safaricom");
    // Query
    const BusinessShortCode = config.lipaNaMpesa.shortCode;
    const timeStamp = moment().format("YYYYMMDDHHmmss");
    const rawPass = BusinessShortCode + config.lipaNaMpesa.key + timeStamp;

    req.mpesaTransaction = {
      BusinessShortCode: BusinessShortCode,
      Password: Buffer.from(rawPass, "utf8").toString("base64"),
      Timestamp: timeStamp,
      CheckoutRequestID: req.body.checkoutRequestId,
    };
    console.log("Req object created");
    // Add auth token then send to Safaricom
    auth(req, res, next);
  }
};

const querySafaricomForRecord = (req, res, next) => {
  // Set url, AUTH token and transaction
  mpesaFunctions.sendMpesaTxnToSafaricomAPI({
    url: config.lipaNaMpesa.queryRequest,
    auth: "Bearer " + req.transactionToken,
    transaction: req.mpesaTransaction,
  });
};

const result = (req, res, next) => {
  if (req.transactionResp) {
    console.log(req.transactionResp);
  }

  if (req.txnFoundLocally) {
    res.json({
      MerchantRequestId:
        req.lipaNaMPesaTransaction.mpesaInitResponse.MerchantRequestID,
      checkoutRequestId:
        req.lipaNaMPesaTransaction.mpesaInitResponse.CheckoutRequestID,
      message: req.lipaNaMPesaTransaction.mpesaInitResponse.ResponseDescription,
      status:
        req.lipaNaMPesaTransaction.mpesaInitResponse.ResponseCode === "0"
          ? "00"
          : req.lipaNaMPesaTransaction.mpesaInitResponse.ResponseCode,
    });
  } else {
    res.json({
      merchantRequestId: req.body.merchantRequestId,
      checkoutRequestId: req.body.checkoutRequestId,
      message: req.statusMessage,
      status: req.code,
    });
  }
};

lipaNaMPesaQueryRouter.post(
  "/",
  queryDBForRecord,
  confirmSourceOfTrnx,
  querySafaricomForRecord,
  result
);

module.exports = lipaNaMPesaQueryRouter;
