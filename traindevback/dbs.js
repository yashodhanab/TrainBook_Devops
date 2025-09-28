const mysql = require("mysql2");

// Create MariaDB connection
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "asf1asf1",  // your DB password
    database: "trainbook_dev"
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error("DB Connection Error:", err);
        return;
    }
    console.log("Connected to Database!");
});

// Export the connection
module.exports = db;
