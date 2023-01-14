const mongoose = require("mongoose");

const tokenRepository = new mongoose.Schema({
  lastUpdated: String,
  accessToken: String,
  timeout: String,
  service: String,
});

// Create a model based on the schema
const TokensModel = mongoose.model("tokens", tokenRepository);

// Export Model
module.exports = TokensModel;
