const fs = require('fs');
const jsdom = require("jsdom");
const express = require('express');
const app = express();
const { JSDOM } = jsdom;
let newFilePath='updatedSourcecode.html';
//const express = require('express');
const router = express.Router();
const path = require('path');

app.use(express.static('public'));


module.exports = async function(logs, filePath) 
{
    // Read HTML file content
    const htmlSource = await fs.promises.readFile(filePath, 'utf8');
    const dom = new JSDOM(htmlSource);
    const doc = dom.window.document;

    // Define the element types to check for tabindex
    const elementTypesToCheck = [
        '<a', // Links
        '<button', // Buttons
        '<select', // Dropdown/select elements
        '<textarea', // Textareas
        '<input' // inputs
    ];


    // Apply fixes based on violations
    logs.forEach(violationList => {
        violationList.forEach(violation => {
   
            switch (violation.keyy) 
            {
                case "1.1.1":
                    const imgElements = doc.getElementsByTagName('img');
                    Array.from(imgElements).forEach((imgElement, index) => {
                        if (index === violation.indexNo) 
                        {
                            imgElement.setAttribute('alt', 'an image');
                        }
                    });
                    break;

                case "1.2.2":
                    const videoElements = doc.getElementsByTagName('video');
                    Array.from(videoElements).forEach((videoElement, index) => {
                        if (index === violation.indexNo) 
                        {
                            const trackElements = videoElement.getElementsByTagName('track');
                            if (trackElements.length > 0) 
                            {
                                Array.from(trackElements).forEach(trackElement => {
                                    trackElement.setAttribute('kind', 'captions');
                                });
                            } 
                            else 
                            {
                                const track = doc.createElement('track');
                                track.setAttribute('kind', 'captions');
                                track.setAttribute('src', 'add-your-captionfile.vtt'); // Example caption file
                                // track.setAttribute('srclang', 'en');
                                // track.setAttribute('label', 'English');
                                videoElement.appendChild(track);
                            }
                        }
                    });
                    break;
                
                case "1.3.1":
                    const tableElements = doc.getElementsByTagName('table');
                    Array.from(tableElements).forEach((tableElement, index) => {
                        if (index === violation.indexNo) {
                            const captionElements = tableElement.getElementsByTagName('caption');
                            if (captionElements.length === 0) {
                                const caption = doc.createElement('caption');
                                caption.textContent = 'give a table caption';
                                tableElement.insertBefore(caption, tableElement.firstChild);
                            }
                        }
                    });
                    break;  
                
                case "1.4.2":
                    const audioElements = doc.getElementsByTagName('audio');
                    Array.from(audioElements).forEach((audioElement, index) => {
                        if (index === violation.indexNo) {
                            audioElement.controls = true;
                        }
                    });
                    break; 

                case "2.1.1": 
                    elementTypesToCheck.forEach(tag => {
                        const elements = doc.getElementsByTagName(tag);
                        Array.from(elements).forEach((element, index) => {
                            // const tabIndexValue = parseInt(element.getAttribute('tabindex'));
                            if (index === violation.indexNo) {
                                element.setAttribute('tabindex', '0');
                            }
                        });
                    });
                    break;

                case "2.4.3":
                    elementTypesToCheck.forEach(tag => {
                        const elements = doc.getElementsByTagName(tag);
                        Array.from(elements).forEach((element, index) => {
                            // const tabIndexValue = parseInt(element.getAttribute('tabindex'));
                            if (index === violation.indexNo) {
                                element.setAttribute('tabindex', '0');
                            }
                        });
                    });
                    break; 

                case "2.1.4":
                    const allElements = doc.querySelectorAll('[accesskey]');
                    allElements.forEach((element, index) => {
                        if (index === violation.indexNo) {
                            const accessKey = element.getAttribute('accesskey');
                            if (accessKey && accessKey.length === 1) 
                            {
                                // Remove the one-character accesskey attribute
                                element.removeAttribute('accesskey');
                            }
                        }
                    });
                    break;
                
                case "2.4.1":
                    const commentText = 'Add main-content id to main content element';
                    const commentNode = doc.createComment(commentText);
                    // const brk=doc.createElement('br');
                    const skipLink = doc.createElement('a');
                    skipLink.setAttribute('href', '#main-content');
                    skipLink.textContent = 'Skip to main content';
    
                    // Find the body element and insert the skip link as the first child
                    const bodyElement = doc.querySelector('body');
                    if (bodyElement) 
                    {
                        bodyElement.insertBefore(skipLink, bodyElement.firstChild);
                        bodyElement.insertBefore(commentNode, skipLink);
                        // bodyElement.insertBefore(brk,commentNode);
                        
                    }
                    break;
                

                case "3.2.2":
                    const formElements = doc.querySelectorAll('form');
                    if (formElements.length > 0) 
                    {
                        formElements.forEach((formElement,index) => {
                        // Create a submit button element
                        if(index===violation.indexNo) 
                        {
                            console.log("was here");
                            const submitButton = doc.createElement('input');
                            submitButton.type = 'submit';
                            submitButton.value = 'Submit';

                            // Append the submit button to the form
                            formElement.appendChild(submitButton);
                        }
                        });
                    }                
                    break;

                case "3.3.2":
                    const inputElements = doc.querySelectorAll('input');

                    inputElements.forEach((inputElement,index) => {
                        if(index==violation.indexNo) 
                        {
                            const inputType = inputElement.getAttribute('type');
                            const isCheckboxOrRadio = ['checkbox', 'radio'].includes(inputType);
                            
                            // Create label element
                            const label = doc.createElement('label');
                            label.textContent = 'include your label Text';
                            
                            if (isCheckboxOrRadio) 
                            {
                                inputElement.parentNode.insertBefore(label, inputElement.nextSibling);
                            } 
                            else 
                            {
                                inputElement.parentNode.insertBefore(label, inputElement);
                            }
                        }
                    });
                    break;
                
                case "1.3.3":
                    const labelElements = doc.querySelectorAll('label');
                    
                    labelElements.forEach(labelElement => {

                        const textContent = labelElement.textContent.trim();
                        
                        if (textContent === '') {
                            // If the label does not contain text, create a text node and insert it
                            const textNode = doc.createTextNode('provide your label Text');
                            labelElement.appendChild(textNode);
                        }
                    });
                    break;

                case "4.1.2": 
                    const anchorElements = doc.querySelectorAll('a');

                    anchorElements.forEach(anchorElement => {
                        const textContent = anchorElement.textContent.trim();
                        if (textContent === '') {
                            
                            const textNode = doc.createTextNode('Link');
                            anchorElement.appendChild(textNode);
                        }
                
                        const titleAttr = anchorElement.getAttribute('title');
                        if (!titleAttr) 
                        {
                            anchorElement.setAttribute('title', 'add your link title');
                        }
                    });
                    break; 
                
                case "2.5.2": 
                    const elements = doc.querySelectorAll('a, button');
        
                    elements.forEach(element => {
                        if (element.hasAttribute('onmousedown')) {
                            element.removeAttribute('onmousedown');
                        }
                    });
                    break;
            }
        });
    });

    // Serialize the DOM back to HTML
    const updatedHtml = dom.serialize();
    await fs.promises.writeFile(newFilePath, updatedHtml, 'utf8');
      
    // console.log('Updated HTML written to', newFilePath);
};


