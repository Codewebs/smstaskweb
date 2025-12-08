/*const mysql = require('mysql'); 

global.DBase = "indizapaiebd"
global.DBuser = "indiza"
global.DBpass = "Securise21"
global.DBhost = "db4free.net"


global.DBdialect = "mysql" 

global.DBase = "nweb"
global.DBuser = "indiza"
global.DBpass = ""
global.DBhost = "hxtn1zu.localto.net"
*/
/*
/*const sequelize = new Sequelize('heroku_d5243f28b216730', 'bdc544f82295b8', '65169927', {
  host: 'us-cdbr-iron-east-05.cleardb.net',
  dialect: 'mysql',
});

var pool = mysql.createPool({
    connectionLimit : 500, 
    host     : "localhost",
    port     :  3306,
    user:"root",
    password:"",
    database:"chop_db"
    });

*/

/*
var pool = mysql.createPool({
    connectionLimit : 500,
    host     : "db4free.net",
    port     :  3306,
    user:"indiza",
    password:"Securise21",
    database:"indizapaie"
    }); 
exports.getConnection = function(callback) {
  pool.getConnection(function(err, conn) {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
};



/*var pool = mysql.createPool({
      connectionLimit : 500,
        host     : "us-cdbr-iron-east-02.cleardb.net",
        port     :  3306,
    user:"b18f0e8f694af9",
    password:"afcf83da",
    database:"heroku_b0dd8502d35c1f4"

    heroku run ls
    git status
    git add <folder/file>
    git status
    git commit -m "message"
    git push heroku master
    heroku logs --tail
    }); 


mysql://bdc544f82295b8:65169927@us-cdbr-iron-east-05.cleardb.net/heroku_d5243f28b216730?reconnect=true

    */