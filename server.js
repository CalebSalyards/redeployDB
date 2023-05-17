const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

const mysqlClient = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });

mysqlClient.connect((error) => {
    if (error) throw error;
    console.log("Connected to MySQL Server");
});