const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const index = require('./routes/index');
const users = require('./routes/users');

let options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'harmonySessions'
};

let sessionStore = new MySQLStore(options);

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    key: 'test',
    secret: '8nvtCV4Krg',
    resave: false,
    store: sessionStore,
    checkExpirationInterval: 900000,
    expiration: 2 * 24 * 3600 * 1000,
    saveUninitialized: false,
    cookie : {
        maxAge : 7 * 24 * 3600 * 1000
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).send();
});

module.exports = app;
