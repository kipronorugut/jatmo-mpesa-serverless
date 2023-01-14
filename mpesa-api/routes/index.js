const express = require("express");
const router = express.Router();

/* Get Home Page */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'Safaricom Daraja API'})
})

module.exports = router