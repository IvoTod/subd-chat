const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

router.post('/send/pm', function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const UserID = req.body.ID;
    const Content = req.body.Content;
    if(!UserID || !Content) {
        res.status(400).send();
        return;
    }
    connection.query(`INSERT INTO Messages(
        Content,
        AuthorID,
        (SELECT MessageContainerID FROM PMChannels
            WHERE User1ID = ${connection.escape(req.session.userID)} AND User2ID = ${connection.escape(UserID)} OR
            User1ID = ${connection.escape(UserID)} AND User2ID = ${connection.escape(req.session.userID)}
        )
    )
    VALUES(${connection.escape(Content)}, ${connection.escape(req.session.userID)}, ${connection.escape(ContainerID)})`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(204).send();
    });
});

router.post('/send/server', function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const ContainerID = req.body.ID;
    const Content = req.body.Content;
    if(!ContainerID || !Content) {
        res.status(400).send();
        return;
    }
    connection.query(`SELECT ServerID FROM ServerMemberships
        WHERE UserID=${connection.escape(req.session.userID)} AND
        ServerID=(SELECT sc.ServerID FROM ServerChannels
            INNER JOIN ServerMemberships sm ON sm.ServerID = sc.ServerID
            WHERE sc.MessageContainerID = ${connection.escape(ContainerID)} AND sm.UserID=${connection.escape(req.session.userID)})`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        if(result.length === 0) {
            res.status(403).send();
            return;
        }
        connection.query(`INSERT INTO Messages(Content, AuthorID, MessageContainerID)
        VALUES(${connection.escape(Content)}, ${connection.escape(req.session.userID)}, ${connection.escape(ContainerID)})`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(204).send();
        });
    });
});


module.exports = router;
