const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;
    res.send("You have visited this page " + req.session.visitCount + " times");
});

module.exports = router;
