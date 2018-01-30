const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');
const md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;
    res.send("You have visited this page " + req.session.visitCount + " times");
});

router.post('/register', function(req, res, next) {
    if(!req.body) {
        res.status(400).send();
        return;
    };
    const body = req.body;
    const Username = body.username;
    const Email = body.email;
    const Password = body.password;
    if(!Username || !Email || !Password) {
        res.status(400).send();
        return;
    }
    connection.query(
        `INSERT INTO Users (
            Username,
            Email,
            Password
        )
        VALUES (
            ${connection.escape(Username)},
            ${connection.escape(Email)},
            MD5(${connection.escape(Password)}));`,
    function(err, result) {
        if(err) {
            let reason = err.sqlMessage;
            let code = 500;
            if(err.code === 'ER_DUP_ENTRY') {
                reason = err.sqlMessage.match(/'[^']+'/g)[1].replace(/'/g, '');
                code = 400;
            }
            res.status(code).json({"error":err.code, "reason":reason});
            return;
        }
        console.log(result);
        res.status(200).send(result);
    });
});

router.post('/login', function(req, res, next) {
    if(!req.body) {
        res.status(400).send();
        return;
    };
    if(req.session.userID) {
        res.status(403).send("Already logged in.");
        return;
    }
    const body = req.body;
    const Email = body.email;
    const Password = body.password;
    connection.query(`SELECT ID, Username, Email, Password FROM Users WHERE Email = ${connection.escape(Email)};`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        if(md5(Password) === result[0].Password) {

            req.session.userID = result[0].ID;
            res.status(204).send();
        }
    });
});

router.get('/logout', function(req, res, next) {
    if(!req.session.userID) {
        res.status(400).send("Not logged in.");
        return;
    }
    req.session.userID = null;
    res.status(204).send();
});

module.exports = router;
