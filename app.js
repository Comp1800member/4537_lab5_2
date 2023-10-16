/*
    I used ChatGPT to help code parts of this.
*/
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '4537lab5', // Use the container name
  user: 'root',            // Replace with your MySQL username
  password: 'P@$$w0rd', // Replace with your MySQL password
  database: 'Hospital',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL server in Docker container.');
  // Your application logic here
});