const express = require("express");
const moment = require("moment");
const c2bConfirmationRouter = express.Router();

const mpesaFunctions = require("../../helpers/mpesaFunctions");
const C2BTransaction = require("./c2bCallbackUrlModel");
const CallbackURLModel = require("./c2bCallbackUrlModel");

const GENERIC_SERVER_ERROR_CODE = "01";
const CONFIRMATION_TRANSACTION_ACTION_TYPE = 'confirmation';


const findInitialTransaction = (req, res, next) => {
    // Invalid body request
    if(!req.body){
        mpesaFunctions.handleError(res, "Invalid request receieved", GENERIC_SERVER_ERROR_CODE);
    }

    C2BTransaction.findOne({
        "validation.MSISDN": req.body.MSISDN,
        "validation.BillRefNumber": req.body.BillRefNumber,
        "validaition.TransID": req.body.TransID
    }, (err, validatedTnx) => {
        // Check for error
        if (err) return mpesaFunctions.handleError(res, "Error occurred fetching initial request", GENERIC_SERVER_ERROR_CODE)

        // Initial transaction not found
        if(mpesaFunctions.isEmpty(validatedTnx)) return mpesaFunctions.handleError(res, "Transaction not found", GENERIC_SERVER_ERROR_CODE)

        console.log("C2B validation transaction found for %s Bill reference number %s",
            validatedTnx.validation.MSISDN, validatedTnx.validation.BillRefNumber
        );
        req.body.tnxFound = true;
        next();
    })

}

const sendRequestToRemoteApplication = (req, res, next) => {
    // Prepare Object
    const confirmationReq = {
        transactionType: req.body.TransactionType,
        actions: CONFIRMATION_TRANSACTION_ACTION_TYPE,
        phone: req.body.MSISDN,
        firstName: req.body.FirstName,
        middleName: req.body.MiddleName,
        lastName: req.body.LastName,
        OrgAccountBalance: req.body.OrgAccountBalance,
        amount: req.body.TransAmount,
        accountNumber: req.body.BillRefNumber,
        transID: req.body.TransID,
        time: moment(moment(req.body.TransTime, "YYYYMMDDHHmmss")).format("YYYY-MM-DD HH:mm:ss")
    }


// Find remote URL configuration from database
CallbackURLModel.findOne({
    'shortCode': req.body.BusinessShortCode
}, (err, remoteEndPoints) => {
    // Invalid database response
    if(mpesaFunctions.isEmpty(remoteEndPoints)) return mpesaFunctions.handleError(res, 'Pay Bill' + req.body.BusinessShortCode + ' remoteURLS not registered', GENERIC_SERVER_ERROR_CODE)

    console.log('Confirmation Request %s', JSON.stringify(confirmationReq));
    // Forward to remote server
    mpesaFunctions.sendCallbackMpesaTxnToAPIInitiator({
        url: remoteEndPoints.merchant.confirmation,
        transaction: confirmationReq
    }, req, res, next)
})
}

let saveTransaction = function (req, res, next) {

    let filter = {
        'validation.MSISDN': req.body.MSISDN,
        'validation.BillRefNumber': req.body.BillRefNumber,
        'validation.TransID': req.body.TransID
    }
    //Update initial validation transaction
    C2BTransaction.update(filter, {$set: {confirmation: req.body}}, {upsert: true}, function (err) {
        if (err) return mpesaFunctions.handleError(req, 'Unable to save validation request.', GENERIC_SERVER_ERROR_CODE)

        console.log('Tnx Id: %s from %s for %s update successfully', req.body.TransID, req.body.MSISDN, req.body.BillRefNumber)
        next();
    })

}

c2bConfirmationRouter.post('/',
    findInitialTransaction,
    sendRequestToRemoteApplication,
    saveTransaction,
    (req, res, next) => {
        // Static response as customer account is already debited
        res.json({
            ResultCode: 0,
            ResultDesc: 'Transaction confirmation successful',
            ThirdPartyTransID: ''
        })
    }
)

module.exports = c2bConfirmationRouter
