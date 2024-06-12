const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const app = express();
const { analysis0, analysis1 } = require('../analysis');
//const upload = multer();
const upload = multer({ dest: 'uploads/' });
/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Save with original name first
    }
  });*/

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Ensure 'uploads' directory exists
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
  }
  
//const upload = multer({ storage: storage });

// Global array to store logs
let logsArray = [];
let stat=[];

// Route to handle POST requests containing URL data
router.post('/url', (req, res) => {
    // Extract the URL data from the request body
    const { url } = req.body;
    console.log(req.body);
    console.log('URL received from frontend:', url); // Log the URL received from the frontend

    // Pass the URL data to analysis.js
    const analysis = require('../analysis');
    analysis0(url); // Assuming analysis.js exports a function that accepts URL data

    // Send a response back to the frontend
    res.status(200).json({ message: 'URL received successfully' });
});

/*router.post('/upload', upload.none(), (req, res) => {
    console.log(req.body);
    // Extract the URL data from the request body
    const { url } = req.body;
    console.log('inside request body:', req.body);
    console.log('URL received from frontend1:', url); // Log the URL received from the frontend

    const analysis = require('../analysis');
    analysis(url); // Assuming analysis.js exports a function that accepts URL data

    res.status(200).json({ message: 'URL received successfully' });
});*/

/*router.post('/upload', upload.single('file'), (req, res) => {
    const { url } = req.body;
    const oldPath = req.file.path;
  
    //console.log('Email received from frontend:');
    //console.log('Original file name:', originalFileName);
    console.log('URL received from frontend:', url);
  
    //const oldPath = path.join('uploads', req.file.originalname);
    //const newPath = path.join('uploads', 'sourcecode1.html');

    const newFilePath = `sourcecode.html`;//path.join(uploadDir, 'sourceCode1.html');
  
    // Rename the file to sourcecode.html
    fs.rename(oldPath, newFilePath, (err) => {
      if (err) {
        console.error('Error renaming the file:', err);
        return res.status(500).json({ message: 'Error processing file' });
      }
  
      if (url) {
        //const analysis = require('../analysis');
        analysis(url); // Call the analysis function with the URL
      }
      else {
        //const analysis1 = require('../analysis');
        analysis1();
      }
  
      res.status(200).json({ message: 'Data received successfully' });
    });
  });*/

  router.post('/upload', upload.single('file'), (req, res) => {
    const { url } = req.body;
    const file = req.file; // Get the uploaded file, if any

    // Check if both URL and file are provided
    if (url && file) {
        console.log('URL and file received from frontend:', url, file);
        // Handle both URL and file
        // For example, save the file and perform analysis on the URL
        const oldPath = file.path;
        const newFilePath = `sourcecode.html`; // Define the new file path
        fs.rename(oldPath, newFilePath, (err) => {
            if (err) {
                console.error('Error renaming the file:', err);
                return res.status(500).json({ message: 'Error processing file' });
            }
            // Call the analysis function with the URL
            analysis0(url);
            res.status(200).json({ message: 'Data received successfully' });
        });
    } 
    // Check if only URL is provided
    else if (url) {
        console.log('URL received from frontend:', url);
        // Handle URL only
        analysis0(url);
        res.status(200).json({ message: 'Data received successfully' });
    } 
    // Check if only file is provided
    else if (file) {
        console.log('File received from frontend:', file);
        // Handle file only
        const oldPath = file.path;
        const newFilePath = `sourcecode.html`; // Define the new file path
        fs.rename(oldPath, newFilePath, (err) => {
            if (err) {
                console.error('Error renaming the file:', err);
                return res.status(500).json({ message: 'Error processing file' });
            }
            // Perform analysis on the uploaded file
            // For example, call analysis1 function
            analysis1();
            res.status(200).json({ message: 'Data received successfully' });
        });
    } 
    // If neither URL nor file is provided
    else {
        console.log('Neither URL nor file received from frontend');
        res.status(400).json({ message: 'Bad request: Please provide either URL or file' });
    }
});

  

// Route to handle POST requests containing logs data
router.post('/logs', (req, res) => {
    // Extract the logs array from the request body
    const { violations, numbering } = req.body;
   // console.log('Logs received from check.js:', violations); // Log the logs array received from check.js

    // Process the logs array as needed
    // For example, you can save it to a database or perform any other operation
    logsArray = violations;
    stat= numbering;
    //console.log(logsArray);
    //console.log('stathhhh',stat);
    // Update the global logs array

    // Send a response back to check.js
    res.status(200).json({ message: 'Logs received successfully' });
   
});

// Route to handle GET requests for fetching logs
router.get('/output', (req, res) => {
    //Send the logs stored in logsArray to the frontend
    setTimeout(() => {

       /* let html = `
    <div>
        <h1>Generated Table</h1>
        
        <h2>Logs</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>Message</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>`;
    
    stat.forEach(sta => {
        html += `
                <tr>
                    <td>${sta.ruleName}</td>
                    <td>${sta.num}</td>
                </tr>`;
    });
    

    html += `
            </tbody>
        </table>
    </div>`;*/
        // Send the response after the wait time
        res.status(200).json({ logs: logsArray, stat: stat});
      }, 2000); 
      //res.status(200).json(logsArray);
   

    // Clear logs after sending
    //logsArray = [];
    //rfce
});

router.get('/solution', (req, res) => {
    //Send the logs stored in logsArray to the frontend
    setTimeout(() => {
        // Send the response after the wait time
        res.status(200).json({ logs: logsArray, stats: stat });
      }, 2000); 
      //res.status(200).json(logsArray);
   

    // Clear logs after sending
    //logsArray = [];
    //rfce
});

router.get('/output1', (req, res) => {
    //Send the logs stored in logsArray to the frontend
    setTimeout(() => {
        // Send the response after the wait time
        res.status(200).json(logsArray);
      }, 2000); 
      //res.status(200).json(logsArray);
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

router.get('/download', (req, res) => {
    // Define the absolute path to the updated HTML file
    const filePath = path.join(__dirname, '../updatedSourcecode.html');
  
    // Set the appropriate headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=updatedSourcecode.html');
    res.setHeader('Content-Type', 'text/html');
  
    // Send the file to the frontend
    res.sendFile(filePath);
});

router.get('/viewError', (req, res) => {
    // Define the absolute path to the updated HTML file
    const filePath = path.join(__dirname, '../errormarked.html');
  
    // Set the appropriate headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=errormarked.html');
    res.setHeader('Content-Type', 'text/html');
  
    // Send the file to the frontend
    res.sendFile(filePath);
});



module.exports = router;
