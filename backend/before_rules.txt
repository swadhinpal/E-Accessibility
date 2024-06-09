const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

// Define the path to your check.js script
const checkScriptPath = 'check.js';

// Function to execute the check.js script
function runCheckScript(filePath) {
    // Construct the command to run the check.js script with the file path argument
    const command = `node ${checkScriptPath} ${filePath}`;

    // Execute the command using exec
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing check.js:', error);
            return;
        }
        // Log the output from the check.js script
        console.log('Output from check.js:', stdout);

        // Handle any errors or additional output
        if (stderr) {
            console.error('Error from check.js:', stderr);
        }
    });
}

// Example usage of runCheckScript function



// Function to perform analysis on the provided URL
function analysis(url) {
    console.log('Performing analysis on URL:', url);

    // Call getSourceCode to get the source code of the webpage
    getSourceCode(url);
    const filePath = 'sourceCode.html';
    runCheckScript(filePath);
}

// Export the analysis function
module.exports = analysis;

// Function to get the source code of a webpage
async function getSourceCode(url) {
    try {
        // Use axios to fetch the HTML content of the URL
        const response = await axios.get(url);
        const htmlContent = response.data;

        // Write the HTML content to a file
        const filePath = 'sourcecode.html';
        fs.writeFileSync(filePath, htmlContent);

        // Perform any additional actions with the source code if needed
    } catch (error) {
        console.error('Error downloading source code:', error);
    }
}
