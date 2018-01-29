const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(200).send();
});

module.exports = router;
