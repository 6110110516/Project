let mysql = require('mysql');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host: "us-cdbr-east-05.cleardb.net",
    user: "ba9a447f1e9924",
    password: "1388ae21",
    database: "heroku_fdfd54bdc2b9edf"
  });
  
  pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
  });



// let connection = mysql.createConnection({
//     // host: "localhost",
//     // user: "root",
//     // password: "",
//     // database: "reactp"

//     host: "us-cdbr-east-05.cleardb.net",
//     user: "ba9a447f1e9924",
//     password: "1388ae21",
//     database: "heroku_fdfd54bdc2b9edf"

// })

// connection.connect((error) => {
//     if (!!error) {
//         console.log(error);
//     } else {
//         console.log('Connected');
//     }
// })

module.exports = pool;