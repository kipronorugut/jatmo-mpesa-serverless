const express = require("express");
const c2bRegistrationRouter = express.Router();

const auth = require("../../auth/auth");
const mpesaFunctions = require("../../helpers/mpesaFunctions");
const GENERIC_SERVER_ERROR_CODE = "01";

// Load config values
const config = require("../../../config");

const CallbackURLModel = require("./c2bCallbackUrlModel");
const C2B_URL_REGISTRATION_SERVICE_NAME = "C2B-URL-REGISTRATION";

const registerMerchantCallBackUrl = (req, res, next) => {
  if (mpesaFunctions.isEmpty(res.body))
    return mpesaFunctions.handleError(res, "Invalid request recieved", "01");

  // Check initial registration
  const query = CallbackURLModel.findOne({
    shortCode: req.body.shortCode,
  });

  // Execute query
  query.exec((err, callbackURLs) => {
    // Handle Error
    if (err)
      return mpesaFunctions.handleError(
        res,
        "Error fetching url registration object" + err.message,
        GENERIC_SERVER_ERROR_CODE
      );

    // New Record
    const newRecord = {
      shortCode: req.body.shortCode,
      merchant: {
        confirmation: req.body.confirmationURL,
        validation: req.body.validationURL,
      },
    };

    if (callbackURLs) {
      console.log("Updating C2B Urls to local database ");
      // Update record
      const filter = {
        shortCode: req.body.shortCode,
      };
      const options = { multi: true };
      CallbackURLModel.update(filter, new newRecord(), options, (err) => {
        if (err)
          return mpesaFunctions.handleError(
            res,
            "Unable to update transaction. " + err.message,
            GENERIC_SERVER_ERROR_CODE
          );
        next();
      });
    } else {
      console.log("Saving C2B Urls to local database");
      const callbackUrl = new CallbackURLModel(newRecord);

      // Save new Record
      callbackUrl.save((err) => {
        if (err)
          return mpesaFunctions.handleError(
            res,
            err.message,
            GENERIC_SERVER_ERROR_CODE
          );
        next();
      });
    }
  });
};

const registerAPICallBackUrl = (req, res, next) => {
  // Prepare request object
  const URLsRegistrationObject = {
    ValidationURL: config.validationConfirm.validationURL,
    ConfirmationURL: config.validationConfirm.confirmationURL,
    ResponseType: config.validationConfirm.responseType,
    ShortCode: config.validationConfirm.shortCode,
  };

  // Set URL, AUTH token and transaction
  mpesaFunctions.sendMpesaTxnToSafaricomAPI(
    {
      url: config.validationConfirm.registerURLs,
      auth: "Bearer " + req.transactionToken,
      transaction: URLsRegistrationObject,
    },
    req,
    res,
    next
  );
};

const setServiceName = (req, res, next) => {
  req.body.service = C2B_URL_REGISTRATION_SERVICE_NAME;
  next();
};

/**
 * API Service call back URL setup.
 * Safaricom will use the end point to send validation and confirmation requests
 */

c2bRegistrationRouter.put(
  "/register/safaricom",
  setServiceName,
  auth,
  registerAPICallBackUrl,
  (req, res, next) => {
    res.json({
      status: "00",
      message:
        "Merchant URLs registration successful for pay bill" +
        req.body.shortCode,
    });
  }
);

module.exports = c2bRegistrationRouter;
