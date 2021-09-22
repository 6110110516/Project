let mysql = require('mysql');
let connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "ReactP"

})

connection.connect((error) => {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Connected');
    }
})

module.exports = connection;