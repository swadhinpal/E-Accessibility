const express = require('express');
const bodyParser = require('body-parser');
const handler = require('./routes/handler.js');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); // Add cors middleware
app.use('/', handler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1); // Exit the process if unable to connect
  }
  console.log('Connected to MySQL database');

  // Create 'authentication' database if it doesn't exist
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`;
  connection.query(createDatabaseQuery, (err, result) => {
    if (err) {
      console.error(`Error creating ${process.env.DB_NAME} database:`, err);
      process.exit(1); // Exit the process if database creation fails
    }
    console.log(`${process.env.DB_NAME} database created`);
    // After creating the database, switch to it
    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) {
        console.error(`Error switching to ${process.env.DB_NAME} database:`, err);
        process.exit(1); // Exit the process if unable to switch databases
      }
      console.log(`Switched to ${process.env.DB_NAME} database`);

      // Create users table
      const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          country VARCHAR(255),
          email VARCHAR(255),
          password VARCHAR(255)
        )
      `;
      connection.query(createUserTableQuery, (err, result) => {
        if (err) {
          console.error('Error creating users table:', err);
          process.exit(1); // Exit the process if table creation fails
        }
        console.log('Users table created');
      });
    });
  });
});

// Register a new user
app.post('/register', async (req, res) => {
  const { name, country, email, password } = req.body;
  const saltRounds = 10; // Number of salt rounds for bcrypt
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert hashed password into the database
    const createUserQuery = `INSERT INTO users (name, country, email, password) VALUES (?, ?, ?, ?)`;
    connection.query(createUserQuery, [name, country, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Error registering user' });
      } else {
        console.log('User registered successfully');
        res.status(200).json({ message: 'User registered successfully' });
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const getUserQuery = `SELECT * FROM users WHERE email = ?`;
  connection.query(getUserQuery, [email], async (err, result) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ message: 'Error logging in' });
    } else if (result.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
    } else {
      const user = result[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // Passwords match, generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Send the token in response
        console.log("Logged in and token created");
        res.status(200).json({ message: 'Login successful', token });
      } else {
        // Passwords don't match
        console.log("Invalid credential");
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  });
});
