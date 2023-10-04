const mysql = require('mysql');

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'organizer-projects'
});

db.connect(function(error){
    if(error){
        console.log('Database connection error ' + error.stack);
    }
    console.log('Connecting to the database success');
});

module.exports = db;