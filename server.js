const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

const webApp = express();
const port = 9000;
const mysqlClient = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });

webApp.listen(port, () => {
    console.log("Listening on port: " + port);
    mysqlClient.connect((error) => {
        if (error) throw error;
        console.log("Connected to MySQL Server");
    });
});

webApp.get('/', (request, result) => {
    result.send("<h1>Welcome, welcome! There's nothing here for now.</h1>");
});

webApp.post('/', async (request, result) => {
    const body = request.body;
});