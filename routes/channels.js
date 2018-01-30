const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

router.get('/server/messages/:id?', function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const ContainerID = req.body.ID;
    if(!ContainerID) {
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
        connection.query(`SELECT m.Content, u.Username, m.TimeSent FROM Messages m
            INNER JOIN Users u ON u.ID = m.AuthorID
            INNER JOIN MessageContainers mc ON mc.ID = m.MessageContainerID`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(200).json(result);
        });
    });
});

router.post('/server', function(res, req, next) {
    console.log("TEST");
    console.log(req);
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const ServerID = req.body.ID;
    const Name = req.body.Name;
    if(!ServerID || !Name) {
        res.status(400).send();
        return;
    }
    connection.query(`SELECT ServerID FROM ServerMemberships WHERE UserID=${connection.escape(req.session.userID)} AND ServerID=${connection.escape(ServerID)}`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        if(result.length === 0) {
            res.status(403).send();
            return;
        }
        connection.query(`INSERT INTO MessageContainers VALUES());
        INSERT INTO ServerChannels(ServerID, MessageContainerID, Name) VALUES(${connection.escape(ServerID)}, LAST_INSERT_ID()), ${connection.escape(Name)}`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(204).send();
        });
    });
});

router.get('/pm/messages/:id?', function(res, req, next){
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const UserID = req.body.ID;
    if(!ContainerID) {
        res.status(400).send();
        return;
    }
    connection.query(`SELECT m.Content, u.Username, m.TimeSent FROM Messages m
        INNER JOIN Users u ON u.ID = m.AuthorID
        INNER JOIN MessageContainers mc ON mc.ID = m.MessageContainerID
        INNER JOIN PMChannels pmc ON pmc.MessageContainerID = m.MessageContainerID
            AND pmc.User1ID = ${connection.escape(req.session.userID)} AND pmc.User2ID = ${connection.escape(UserID)} OR
            pmc.User1ID${connection.escape(UserID)} AND pmc.User2ID = ${connection.escape(req.session.userID)}`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(200).json(result);
    });
});

router.post('/pm', function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const UserID = req.body.ID;
    if(!UserID) {
        res.status(400).send();
        return;
    }
    connection.query(`INSERT INTO MessageContainers VALUES());
    INSERT INTO PMChannels(User1ID, User2ID, MessageContainerID) VALUES(${connection.escape(req.session.userID)}, ${connection.escape(UserID)}, LAST_INSERT_ID())`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(204).send();
    });
});



module.exports = router;
