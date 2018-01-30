const express = require('express');
const router = express.Router();
const connection = require('../db/connection.js');

router.get('/:id?', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
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
    }
    connection.query(`SELECT Username, Email, TimeCreated FROM Users WHERE ID = ${connection.escape(req.session.userID)};`, function(err, result) {
        if(err) {
            console.log(err);
            res.status(500).send();
        }
        res.status(200).send(result);
    });
});

router.get('/friends', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
    }
    connection.query(`SELECT u2.ID, u2.Username, u2.TimeCreated FROM Users u1
        INNER JOIN Friends fr ON Friends.User1ID = u1.ID OR Friends.User2ID = u1.ID
        INNER JOIN Users u2 ON u2.ID != u1.ID AND u2.ID = Friends.User1ID OR u2.ID = Friends.User2ID
        WHERE u1.ID = ${connection.escape()}`, function(err, result) {
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
    }
    connection.query(`SELECT FriendInvites.SenderID User.Username FROM FriendInvites`, function(err, result) {

    })
});

router.post('/invite', function(req, res, next) {
    if(!req.session.userID) {
        res.status(403).send();
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
    }
    const ID = req.body.senderID;
    if(Email) {
        connection.query(`INSERT INTO Friends (User1ID, User2ID) VALUES (${connection.escape(ID)}, ${connection.escape(req.session.userID)})`, function(err, result) {
            if(err) {
                console.log(err);
                res.status(500).send();
                return;
            }
            connection.query(`DELETE FROM`)
            res.status(204).send();
        });
    }
});

module.exports = router;
