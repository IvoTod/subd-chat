const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

router.get("/", function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    connection.query(`SELECT s.ID, s.Name FROM ServerMemberships sm
    INNER JOIN Servers s ON sm.ServerID = s.ID
    WHERE sm.UserID = ${connection.escape(req.session.userID)}`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(200).json(result);
    });
});

router.get("/members/:id?", function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const serverID = req.params.id;
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
        connection.query(`SELECT u.ID, u.Username FROM ServerMemberships sm
            INNER JOIN Users u ON sm.UserID = u.ID
            WHERE sm.ServerID=${connection.escape(ServerID)}`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(200).json(result);
        });
    });
});

router.get('/channels/:id?', function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const ServerID = req.params.id;
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
        connection.query(`SELECT Name, MessageContainerID FROM ServerChannels WHERE ServerID = ${connection.escape(ServerID)}`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(200).json(result);
        });
    });
});

router.post("/create", function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const Name = req.body.name;
    connection.query(`INSERT INTO Servers(Name, CreatorID) VALUES(${connection.escape(Name)}, ${connection.escape(req.session.userID)});
    INSERT INTO ServerMemberships(ServerID, UserID) VALUES(LAST_INSERT_ID(), ${connection.escape(req.session.userID)})`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(204).send();
    });
});

router.post("/invite", function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const ServerID = req.body.ID;
    if(!ServerID) {
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
        connection.query(`INSERT INTO ServerInvites(CreatorID, ServerID)
        VALUES(${connection.escape(req.session.userID)}, ${connection.escape(ServerID)})`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(204).send();
        });
    });

});

router.post("/invite/accept", function(req, res, next) {
    const ServerID = body.ID;
    if(!ServerID) {
        res.status(400).send();
        return;
    }
    connection.query(`INSERT INTO ServerMemberships (ServerID, UserID) VALUES (${connection.escape(ServerID)}, ${connection.escape(req.session.userID)})`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(204).send();
    });
});

module.exports = router;
