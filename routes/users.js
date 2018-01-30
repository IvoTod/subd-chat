const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

router.get('/get/:id?', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    connection.query(`SELECT Username, TimeCreated FROM Users WHERE ID = ${connection.escape(req.params.id)};`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
        }
        res.status(200).send(result);
    });
});

router.get('/me', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    connection.query(`SELECT Username, Email, TimeCreated FROM Users WHERE ID = ${connection.escape(req.session.userID)};`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(200).json(result);
    });
});

router.get('/friends', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    connection.query(`SELECT u2.ID, u2.Username, u2.TimeCreated FROM Users u1
        INNER JOIN Friends fr ON fr.User1ID = u1.ID OR fr.User2ID = u1.ID
        INNER JOIN Users u2 ON u2.ID != u1.ID AND (u2.ID = fr.User1ID OR u2.ID = fr.User2ID)
        WHERE u1.ID = ${connection.escape(req.session.userID)}`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(200).send(result);
    });
});

router.get('/invite', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    connection.query(`SELECT fri.SenderID, u.Username FROM FriendInvites fri
        INNER JOIN Users u ON u.ID = fri.senderID
        WHERE fri.RecipientID = ${connection.escape(req.session.userID)}`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(200).json(result);
    })
});

router.post('/invite', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const body = req.body;
    const Username = body.username;
    const Email = body.email;
    const ID = body.ID;
    if(ID) {
        connection.query(`INSERT INTO FriendInvites(SenderID, RecipientID)
        VALUES(${connection.escape(req.session.userID)}, ${connection.escape(ID)})`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(204).send();
        })
    }
    else if(Email) {
        connection.query(`INSERT INTO FriendInvites(SenderID, RecipientID)
        VALUES(${connection.escape(req.session.userID)}, (SELECT ID FROM Users WHERE Email = ${connection.escape(Email)}))`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(204).send();
        })
    }
    else {
        connection.query(`INSERT INTO FriendInvites(SenderID, RecipientID)
        VALUES(${connection.escape(req.session.userID)}, (SELECT ID FROM Users WHERE Username = ${connection.escape(Username)}))`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            res.status(204).send();
        })
    }
});

router.post('/invite/accept', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const ID = req.body.ID;
    if(!ID) {
        res.status(403).end();
        return;
    }
    connection.query(`INSERT INTO Friends (User1ID, User2ID) VALUES (${connection.escape(ID)}, ${connection.escape(req.session.userID)});
        DELETE FROM FriendInvites WHERE SenderID=${connection.escape(ID)} AND RecipientID=${connection.escape(req.session.userID)};`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(204).send();
    });
});

router.get('/pm/:id?', function(res, req, next) {
    if(!req.session.userID) {
        res.status(403).send();
        return;
    }
    const UserID = req.params.id;
    connection.query(`SELECT MessageContainerID FROM PMChannels WHERE User1ID = ${connection.escape(UserID)} AND User2ID = ${connection.escape(req.session.userID)}`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
            return;
        }
        res.status(200).json(result);
    });
});

module.exports = router;
