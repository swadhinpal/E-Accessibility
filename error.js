const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
// const langdetect = require('langdetect');
let newFilePath='errormarked.html';


module.exports = async function(logs, filePath) 
{
    // Read HTML file content
    const htmlSource = await fs.promises.readFile(filePath, 'utf8');
    const dom = new JSDOM(htmlSource);
    const doc = dom.window.document;

    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    doc.head.appendChild(link); 

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
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title="image without alt tag";
                            
                            imgElement.parentNode.insertBefore(icon, imgElement);
                        }
                    });
                    break;

                case "1.2.2":
                    const videoElements = doc.getElementsByTagName('video');
                    Array.from(videoElements).forEach((videoElement, index) => {
                        if (index === violation.indexNo) 
                        {
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='video without caption';
                            videoElement.parentNode.insertBefore(icon, videoElement);
                        }
                    });
                    break;
                
                case "1.3.1":
                    const tableElements = doc.getElementsByTagName('table');
                    Array.from(tableElements).forEach((tableElement, index) => {
                        if (index === violation.indexNo) {
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='table without caption';
                            tableElement.parentNode.insertBefore(icon, tableElement);
                        }
                    });
                    break;  
                
                case "1.4.2":
                    const audioElements = doc.getElementsByTagName('audio');
                    Array.from(audioElements).forEach((audioElement, index) => {
                        if (index === violation.indexNo) {
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title="audio without controls";
                            audioElement.parentNode.insertBefore(icon, audioElement);
                        }
                    });
                    break; 

                case "2.1.1": 
                    elementTypesToCheck.forEach(tag => {
                        const elements = doc.getElementsByTagName(tag);
                        Array.from(elements).forEach((element, index) => {
                            // const tabIndexValue = parseInt(element.getAttribute('tabindex'));
                            if (index === violation.indexNo) {
                                const icon = doc.createElement('i');
                                // Use Font Awesome alert icon
                                icon.className = 'fas fa-exclamation-triangle fa-4x';
                                // Optionally, style the icon
                                icon.style.marginRight = '8px';
                                icon.style.color = 'red';
                                icon.title="tabindex less than 0";
                                element.parentNode.insertBefore(icon, element);
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
                                const icon = doc.createElement('i');
                                // Use Font Awesome alert icon
                                icon.className = 'fas fa-exclamation-triangle fa-4x';
                                // Optionally, style the icon
                                icon.style.marginRight = '8px';
                                icon.style.color = 'red';
                                icon.title="tabindex less than 0";
                                element.parentNode.insertBefore(icon, element);
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
                                const icon = doc.createElement('i');
                                // Use Font Awesome alert icon
                                icon.className = 'fas fa-exclamation-triangle fa-4x';
                                // Optionally, style the icon
                                icon.style.marginRight = '8px';
                                icon.style.color = 'red';
                                icon.title="one  character shorcut key";
                                element.parentNode.insertBefore(icon, element);
                            }
                        }
                    });
                    break;
                
                case "2.4.1":
                    
                    // Find the body element and insert the skip link as the first child
                    const element = doc.querySelector('body');
                    if (element) 
                    {
                        const icon = doc.createElement('i');
                        // Use Font Awesome alert icon
                        icon.className = 'fas fa-exclamation-triangle fa-4x';
                        // Optionally, style the icon
                        icon.style.marginRight = '8px';
                        icon.style.color = 'red';
                        icon.title='no skip link';
                        element.parentNode.insertBefore(icon, element);
                        
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
                            
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='form without submit button';
                            formElement.parentNode.insertBefore(icon, formElement);
                        }
                        });
                    }                
                    break;

                case "3.3.2":
                    const inputElements = doc.querySelectorAll('input');

                    inputElements.forEach((inputElement,index) => {
                        if(index==violation.indexNo) 
                        {
                            const icon = doc.createElement('i');
                     
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                           
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='input without label';
                            inputElement.parentNode.insertBefore(icon, inputElement);
                        }
                    });
                    break;
                
                case "1.3.3":
                    const labelElements = doc.querySelectorAll('label');
                    
                    labelElements.forEach(labelElement => {

                        const textContent = labelElement.textContent.trim();
                        
                        if (textContent === '') {
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='label without text';
                            labelElement.parentNode.insertBefore(icon, labelElement);
                        }
                    });
                    break;

                case "4.1.2": 
                    const anchorElements = doc.querySelectorAll('a');

                    anchorElements.forEach(anchorElement => {
                        const textContent = anchorElement.textContent.trim();
                        if (textContent === '') {
                            
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='link without text and title';
                            anchorElement.parentNode.insertBefore(icon, anchorElement);
                        }
                
                    });
                    break; 
                
                case "2.5.2": 
                    const elements = doc.querySelectorAll('a, button');
        
                    elements.forEach(element => {
                        if (element.hasAttribute('onmousedown')) {
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='default event overridden';
                            element.parentNode.insertBefore(icon, element);
                        }
                    });
                    break;  


                //------------ solution level AA----------------
                //------------ Shifa --------------------- 

                case "1.3.5": 
                    const allForms = doc.querySelectorAll('form');

                    allForms.forEach((item, index) => {
                        if (index === violation.indexNo) 
                        {
                            const icon = doc.createElement('i');
                            // Use Font Awesome alert icon
                            icon.className = 'fas fa-exclamation-triangle fa-4x';
                            // Optionally, style the icon
                            icon.style.marginRight = '8px';
                            icon.style.color = 'red';
                            icon.title='';
                            item.parentNode.insertBefore(icon, item);
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
