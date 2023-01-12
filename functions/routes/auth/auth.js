const moment = require("moment");
const request = require("request");
const STK_PUSH = "STK-PUSH";
const C2B_URL_REGISTRATION_SERVICE_NAME = "C2B-URL-REGISTRATION";
const TOKEN_INVALIDITY_WINDOW = 240;
const GENERIC_SERVER_ERROR_CODE = "01";

// Authentication Model
const TokenModel = require("./tokenModel");
const config = require("../../config/config");

const mpesaFunctions = require("../helpers/mpesaFunctions");
const { service } = require("firebase-functions/v1/analytics");
const { lipaNaMpesa } = require("../../config/config");
const { response } = require("express");

const fetchToken = (req, res, next) => {
  console.log("Fetching Token");
  const serviceName = req.body.serviceName;
  TokenModel.findOne({})
    .where("service")
    .equals(serviceName)
    .exec((err, records) => {
      if (!err) {
        if (records) {
          // Record exists : update
          if (isTokenValid(records)) {
            console.log("Current Token is still valid: " + serviceName);
            req.transactionToken = records.accessToken;
            next();
          } else {
            console.log("Current Tokken is invalid: " + serviceName);
            // Token is invalid, resetting
            setNewToken(req, res, serviceName, false, next);
          }
        } else {
          // Record does not exist: Create
          console.log("Record does not exist: " + serviceName);
          setNewToken(req, res, serviceName, true, next);
        }
      } else {
        mpesaFunctions.handleError(
          res,
          "Error occurred updating token",
          GENERIC_SERVER_ERROR_CODE
        );
      }
    });
};

const isTokenValid = (service) => {
  const tokenAge =
    moment.duration(moment(new Date()).diff(service.lastUpdated)).asSeconds() +
    TOKEN_INVALIDITY_WINDOW;
  return tokenAge < service.timeout;
};

const setNewToken = (req, res, serviceName, newInstance, next) => {
  const consumerKey = "";
  const consumerSecret = "";
  const token = {};
  const url = config.auth;

  // Load consumer keys and secrets for each service
  switch (serviceName) {
    case STK_PUSH: {
      consumerKey = config.lipaNaMpesa.consumerKey;
      consumerSecret = lipaNaMpesa.consumerSecret;
      break;
    }
    case C2B_URL_REGISTRATION_SERVICE_NAME: {
      consumerKey = config.validationConfirm.consumerKey;
      consumerSecret = config.validationConfirm.consumerSecret;
    }
  }

  // Combine consumer key with the secret
  const auth =
    "Basic " +
    Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");
   
   request({ url:url, headers: {"Authorization": auth}},
        (error, response, body) => {
            // Process successful token response
            const tokenResp = JSON.parse(body);

            // Check if response contains error
            if(!error || !tokenResp.errorCode){
                const newToken = {
                    lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss"),
                    accessToken: tokenResp.access_token,
                    timeout: tokenResp.expires_in,
                    service: serviceName
                }
            

            if (newInstance) {
                // Create new access token for M-Pesa service
                token = new TokenModel(
                    newToken
                )
                // Save service token
                token.save((err) => {
                    if (err){
                        mpesaFunctions.handleError(res, "Unable to save token. Service:" + serviceName)
                    } else {
                        req.transactionToken = token.accessToken
                    }
                    next();
                }
            } else {
                // Update existing access token
                const conditions = {service: serviceName}
                const options = {multi: true}
                // Update existing token
                TokenModel.update(conditions, newToken, options,
                    (err, record) => {
                        if(err){
                            mpesaFunctions.handleError(res, "Unable to update token. Service:"+ serviceName)
                        } else{
                            (record) => {
                                req.transactionToken = newToken.accessToken;
                            }
                        }
                        next();
                    })
                

            }
        } else {
            // Body is empty
            mpesaFunctions.handleError(res, (tokenResp.errorMessage ? tokenResp.errorMessage : "Failed Auth Token Processing") ||
            error.getMessage(), GENERIC_SERVER_ERROR_CODE)
        }
    })
}


module.exports = fetchToken