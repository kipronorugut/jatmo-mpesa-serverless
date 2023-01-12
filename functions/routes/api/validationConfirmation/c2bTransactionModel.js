const mongoose = require("mongoose");

const c2bTransaction = new mongoose.Schema({
  status: String,
  validation: {
    TransacationType: String,
    MSISDN: String,
    FirstName: String,
    MiddleName: String,
    LastName: String,
    TransAmount: String,
    BillRefNumber: String,
    TransAmount: String,
    BillRefNumber: String,
    TransTime: String,
    OrgAccountBalance: String,
    BusinessShortCode: String,
    TransID: String,
    BillRefNumber: String,
    TransTime: String,
    message: String,
    transactionId: String,
  },
});

// Create a model based on the schema
const transacationC2B = mongoose.model("c2bTxn", c2bTransaction);

// Export model
module.export = transacationC2B;
