const express = require('express');
const bodyParser = require('body-parser');
const handler = require('./routes/handler.js');
const mysql = require('mysql');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SSLCommerzPayment = require('sslcommerz-lts'); 

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); // Add cors middleware
app.use('/', handler);

const PORT = process.env.PORT || 4000;

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
console.log(store_id);
console.log(store_passwd);
const is_live = false

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

      const createSubscriptionTableQuery = `
      CREATE TABLE IF NOT EXISTS subscription (
        subscription_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        transaction_id VARCHAR(255),
        amount DECIMAL(10, 2),
        subscription_plan VARCHAR(255) DEFAULT 'lifetime'
      )
    `;
    
    connection.query(createSubscriptionTableQuery, (err, result) => {
      if (err) {
        console.error('Error creating subscription table:', err);
        process.exit(1); // Exit the process if table creation fails
      }
      console.log('Subscription table created');
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

        const getSubscriptionQuery = `SELECT * FROM subscription WHERE email = ?`;
        connection.query(getSubscriptionQuery, [email], async (err, result) => {
          if (err) {
            console.error('Error querying subscription:', err);
            res.status(500).json({ message: 'Error querying subscription' });
          } else {
            if (result.length > 0) {
              // Rows found, set your variable to true
              const subscriptionExists = true;
              console.log('Subscription found for email:', email);
              // Now you can use the subscriptionExists variable in your code
              // For example, you can send it as part of your response
              res.status(200).json({ message: 'Subscription found', subscriptionExists });
            } else {
              // No rows found, set your variable to false
              const subscriptionExists = false;
              console.log('No subscription found for email:', email);
              // Now you can use the subscriptionExists variable in your code
              // For example, you can send it as part of your response
              res.status(200).json({ message: 'No subscription found', subscriptionExists });
            }
          }
        });
        
        //res.status(200).json({ message: 'Login successful', token, email: user.email });
        //res.redirect('/input');
      } else {
        // Passwords don't match
        console.log("Invalid credential");
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  });
});

const tran_id = uuidv4();
var emailAdd;
var amountPaid;

app.post('/pay', async (req, res) => {
  //console.log(req.body);
  const detail= req.body;
  emailAdd = detail.email;
  amountPaid= detail.amount;
  const data = {
    total_amount: detail.amount,
    currency: 'BDT',
    tran_id: tran_id, // use unique tran_id for each api call
    success_url: 'http://localhost:3000/PaymentSuccess',
    fail_url: 'http://localhost:3000/Fail',
    cancel_url: 'http://localhost:3030/cancel',
    ipn_url: 'http://localhost:3030/ipn',
    shipping_method: 'Courier',
    product_name: 'Computer.',
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Customer Name',
    cus_email: detail.email,
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
    };
    console.log(data);
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
    
        res.send({ url: GatewayPageURL });
      
        const subscript = {
            paymentStatus: false,
            transactionId : tran_id,
        };

        //res.redirect(`http://localhost:4000/paymentSuccess`);
        if(subscript.transactionId==req.params.transID)
          {
            //res.redirect(`http://localhost:4000/paymentSuccess/`);
          }

        console.log('Redirecting to: ', GatewayPageURL);
    });

    app.post("/PaymentSuccess", async(req, res)=>{
      //console.log(req.params.transID);
      //res.redirect("/PaymentSuccess/:transID");
      const { amount } = req.body;
      const transaction_id = tran_id;
      const email = emailAdd;

      const createSubscriptionQuery = `INSERT INTO subscription (email, amount, transaction_id) VALUES (?, ?, ?)`;
      connection.query(createSubscriptionQuery, [email, amount, transaction_id], (err, result) => {
        if (err) {
          console.error('Error inserting subscription:', err);
          res.status(500).json({ message: 'Error inserting subscription' });
        } else {
          console.log('Subscription inserted successfully');
          //res.status(200).json({ message: 'Subscription inserted successfully' });
          res.redirect("http://localhost:3000/paymentSuccess");
        }
      });
    

      //res.redirect("http://localhost:3000/paymentSuccess");
    });

    app.post("/Fail", async(req, res)=>{
      //console.log(req.params.transID);
      //res.redirect("/PaymentSuccess/:transID");
      res.redirect("http://localhost:3000/Fail");
    });
});
