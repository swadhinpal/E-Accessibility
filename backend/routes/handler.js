const express = require('express');
const router = express.Router();

// Global array to store logs
let logsArray = [];

// Route to handle POST requests containing URL data
router.post('/url', (req, res) => {
    // Extract the URL data from the request body
    const { url } = req.body;
    console.log('URL received from frontend:', url); // Log the URL received from the frontend

    // Pass the URL data to analysis.js
    const analysis = require('../analysis');
    analysis(url); // Assuming analysis.js exports a function that accepts URL data

    // Send a response back to the frontend
    res.status(200).json({ message: 'URL received successfully' });
});

// Route to handle POST requests containing logs data
router.post('/logs', (req, res) => {
    // Extract the logs array from the request body
    const { violations } = req.body;
    console.log('Logs received from check.js:', violations); // Log the logs array received from check.js

    // Process the logs array as needed
    // For example, you can save it to a database or perform any other operation
    logsArray = violations; // Update the global logs array

    // Send a response back to check.js
    res.status(200).json({ message: 'Logs received successfully' });
});

// Route to handle GET requests for fetching logs
router.get('/output', (req, res) => {
    // Send the logs stored in logsArray to the frontend
    res.status(200).json(logsArray);

    // Clear logs after sending
    //logsArray = [];
    //rfce
});

// Existing route to handle GET requests
router.get('/tweet', (req, res) => {
    const data = [
        {
            name: "swadhin",
            roll: 1302,
            batch: "13th"
        }
    ];

    console.log('Data sent from backend:', data); // Log the data being sent
    res.send(data);
});

module.exports = router;
