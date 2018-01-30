const mysql = require('mysql');

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'harmony'
});

connection.connect();
connection.on('error', function(err) {
  console.log(err.code);
});

module.exports = connection;
