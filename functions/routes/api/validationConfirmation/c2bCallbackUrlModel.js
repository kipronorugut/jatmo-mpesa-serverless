const mongoose = require("mongoose");

let callBackURLRepository = new mongoose.Schema({
  shortCode: String,
  merchant: {
    confirmation: String,
    validation: String,
  },
});

// Create a model based on the schema
const c2bCallbackURL = mongoose.model("c2bUrl", callBackURLRepository);

// Export Model
module.exports = c2bCallbackURL;
