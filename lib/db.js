let mysql = require('mysql');
let connection = mysql.createConnection({
    // host: "localhost",
    // user: "root",
    // password: "",
    // database: "reactp"

    host: "us-cdbr-east-05.cleardb.net",
    user: "ba9a447f1e9924",
    password: "1388ae21",
    database: "heroku_fdfd54bdc2b9edf"

})

connection.connect((error) => {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Connected');
    }
})

module.exports = connection;