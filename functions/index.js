const functions = require("firebase-functions");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const config = require("./config/config");
const mongoose = require("mongoose");
const app = express.Router();
const admin = require("firebase-admin");

admin.initializeApp({ projectId: config.firebaseProjectId });

let db;
mongoose.connect(config.mongodbUri, { usenewUrlParser: true });
db = mongoose.connection;
// db.on('error', console.bind(console, 'connection error:'));

const lipaNaMpesa = require("./routes/api/lipanampesa/lipaNaMPesa");
const lipaNaMpesaQuery = require("./routes/api/lipanampesa/lipaNaMPesaQuery");
const c2b = require("./routes/api/validationConfirmation/urlRegistration");
const c2bValidation = require("./routes/api/validationConfirmation/c2bValidation");
const c2bConfirmation = require("./routes/api/validationConfirmation/c2bConfirmation");
const index = require("./routes/index");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", index);

// STK PUSH
app.use("/stkpush", lipaNaMpesa);
app.use("/stkpush/query", lipaNaMpesaQuery);

// C2B CONFIRMATION & VALIDATION
app.use("/c2b", c2b);
app.use("/c2b/validate", c2bValidation);
app.use("/c2b/confirm", c2bConfirmation);

// CATCH 404 AND FORWARD TO ERROR HANDLER
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

exports.jatmoMpesaApi = functions.https.onRequest((request, response) => {
  morgan("dev")(req, res, () => {
    if (!req.path) {
      req.url = `/${req.url}`; // prepend '/' to keep query params if any
    }
    return router(req, res);
  });
});

exports.db = db;
