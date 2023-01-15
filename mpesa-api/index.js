const functions = require("firebase-functions");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("morgan");
const bodyParser = require("body-parser");
const config = require("./config");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const lipaNaMpesa = require("./routes/api/lipanaMPesa/lipaNaMPesa");
const lipaNaMpesaQuery = require("./routes/api/lipanaMPesa/lipaNaMPesaQuery");
const c2b = require("./routes/api/validationConfirmation/urlRegistration");
const c2bValidation = require("./routes/api/validationConfirmation/c2bValidation");
const c2bConfirmation = require("./routes/api/validationConfirmation/c2bConfirmation");
const index = require("./routes/index");

const app = express();
app.use(helmet());
app.use(cors());

const firebase = require("firebase-admin");

const FIREBASE_CONFIG = {
  apiKey: config.firebaseConfig.apiKey,
  authDomain: config.firebaseConfig.authDomain,
  projectId: config.firebaseConfig.projectId,
  storageBucket: config.firebaseConfig.storageBucket,
  messagingSenderId: config.firebaseConfig.messagingSenderId,
  appId: config.firebaseConfig.appId,
  measurementId: config.firebaseConfig.measurementId,
};

console.log(FIREBASE_CONFIG);
console.log(config.mongodb);
// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);

mongoose
  .connect(config.mongodb.mongoUrl, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB Connected...");
    db = mongoose.connection;
    app.get("/health", (req, res) => {
      // check if the database connection is established
      if (db.readyState === 1) {
        res.send({ status: "UP" });
      } else {
        res.status(503).send({ status: "DOWN" });
      }
    });
  })
  .catch((err) => {
    console.error(`MongoDB Connection Error: ${err}`);
  });

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// STK PUSH
app.use("/stkpush", lipaNaMpesa);
app.use("/stkpush/query", lipaNaMpesaQuery);

// C2B CONFIRMATION & VALIDATION
app.use("/c2b", c2b);
app.use("/c2b/validate", c2bValidation);
app.use("/c2b/confirm", c2bConfirmation);

exports.mpesaApi = functions.https.onRequest(app);
