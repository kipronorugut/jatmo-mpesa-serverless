const express = require("express");
const c2bValidaitionRouter = express.Router();
const moment = require("moment");

const mpesaFunctions = require("../../helpers/mpesaFunctions");
const C2BTransaction = require("./c2bCallbackUrlModel");
const CallbackURLModel = require("./c2bCallbackUrlModel");
const GENERIC_SERVER_ERROR_CODE = "01";
const VALIDATION_TRANSACTION_ACTION_TYPE = "validate";

const validateRequest = (req, res, next) => {
  // Check request validiity
  if (!req.body) {
    mpesaFunctions.handleError(
      res,
      "Invalid request received",
      GENERIC_SERVER_ERROR_CODE
    );
  }

  // Package Request
  const validationReq = {
    transactionType: req.body.TransactionType || "Pay Bill",
    action: VALIDATION_TRANSACTION_ACTION_TYPE,
    phone: req.body.MSISDN,
    firstName: req.body.FirstName,
    middleName: req.body.MiddleName,
    lastName: req.body.LastName,
    amount: req.body.BillRefNumber,
    time: moment(moment(req.body.TransTime, "YYYYMMDDHHmmss")).format(
      "YYYY-MM-DD HH:mm:ss"
    ),
  };


// Find remoe URL configuration from database
CallbackURLModel.findOne({
    "shortCode": req.body.BusinessShortCode
}, (err, remoteEndPoints) {
    // Invalid database response
    if (!req.body) return mpesaFunctions.handleError(res, "Pay Bill" + req.body.BusinessShortCode + " remote URLs not registered", GENERIC_SERVER_ERROR_CODE)

    // Short code remote endpoints not found
    if(!remoteEndPoints) return mpesaFunctions.handleError(res, "Remote endpoints for "+ req.body.BusinessShortCode + " not found.", GENERIC_SERVER_ERROR_CODE)

    console.log("Validation request %s", JSON.stringify(validationReq))

    // Forward to remote server
    mpesaFunctions.sendCallbackMpesaTxnToAPIInitiator({
        url: remoteEndPoints.merchant.confirmation,
        transaction: validateReq
    }, req, res, next)
    
})
}

const saveTransaction = (req, res, next) => {
    const transacation = new C2BTransaction({
        validation: req.body,
        validateRequest: req.transacationResp
    })

    // Persist transaction details
    transacation.save((err) => {
        if (err) mpesaFunctions.handleError(req, "Validating account reference request failed.", GENERIC_SERVER_ERROR_CODE)

        // Design response to Safaricom
        req.body.safaricomResp = {
            ResultCode: req.transacationResp.status === "00" ? 0 : 1,
            ResultDesc: req.transacationResp.message,
            ThirdPartyTransID: req.transacationResp.transacationId
        }
    })
}

c2bValidaitionRouter.post('/',
    validateRequest,
    processRemoteValidationResp,
    saveTransaction,
    (req, res, next) => {
        res.json(req.body.safaricomResp)
    }
);

module.exports = c2bValidaitionRouter
