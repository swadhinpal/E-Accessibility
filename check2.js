// it is gonaa be a huge file

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const cheerio = require('cheerio');
const { SpeechClient } = require('@google-cloud/speech');
const convert = require('color-convert');
const { parse } = require('node-html-parser');

const filePath='sourcecode.html';
var logs=[];

// non-text-content
async function parseHTMLFile(filePath) {
    const imagesWithoutAlt = [];

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber1 = 0; // Initialize line number counter
    let check=0;
    let srcMatch;
    let altMatch;
    let lineNumber;
    for await (const line of rl) 
    {
        lineNumber1++; // Increment line number for each line read
        if(check==1) 
        {
            if(line.includes('<img')) 
            {
                check=0;
                const src=srcMatch[1];
                imagesWithoutAlt.push({ src, lineNumber });    
            }
            else if(line.includes('alt')) 
            {
                altMatch = line.match(/alt="([^"]+)"/);
                check=0;
                let altt=altMatch[1];
                if (altt==="") 
                {
                    const src=srcMatch[1];
                    imagesWithoutAlt.push({ src, lineNumber });  
                }
            }

        }
        if (line.includes('<img')) {
            // Extract src and alt attributes from the img tag
            srcMatch = line.match(/src="([^"]+)"/);
            altMatch = line.match(/alt="([^"]+)"/);

            if (srcMatch) {
                const src = srcMatch[1];
                lineNumber=lineNumber1;
                
                if (!line.includes('alt')) 
                {
                    check=1;
                }
                else 
                {
                    let alt = altMatch ? altMatch[1] : ""; // Get alt attribute or empty string if not found
                    check=0;
                    if (alt==="") 
                    {
                        imagesWithoutAlt.push({ src, lineNumber });  
                    }
                }
            }
        }
    }

    if(imagesWithoutAlt.length)
    {
        //console.log('Images without alt attribute:');
        //console.log(imagesWithoutAlt);
        logs.push(imagesWithoutAlt);
    }
}

// caption
async function checkCaption(filePath)
{
    const noCaption = [];

    // const rl = readline.createInterface({
    //     input: fs.createReadStream(filepath),
    //     crlfDelay: Infinity
    // });

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const lines = [];
    let lineNumber = 0;
    let check = 0;
    let srcMatch;
    let kindmatch;
    let temp;
    for await (const line of rl) {
        lines.push(line);
    }
    //console.log(lines.length);
    let notHidden = 0;
    for (let i = 0; i < lines.length; i++) 
    {
        if (check == 1) 
        {
            if (lines[i].includes('<track')) 
            {
                srcMatch = lines[i].match(/src="([^"]+)"/);
                kindmatch = lines[i].match(/kind="([^"]+)"/);
                if (srcMatch) 
                {
                    let value = kindmatch[1];
                    if (value === 'captions') 
                    {
                        check = 0;
                    }
                    else noCaption.push(lineNumber);
                }
            }  
            else if (lines[i].includes('</video>')) 
            {
                check = 0;
                noCaption.push(lineNumber);
            }
        }
        if (lines[i].includes('<video')) 
        {
            check = 1;
            if (lines[i].includes('<track')) {
                srcMatch = lines[i].match(/src="([^"]+)"/);
                kindmatch = lines[i].match(/kind="([^"]+)"/);
                if (srcMatch) {
                    let value = kindmatch[1];
                    if (value === 'captions') {
                        check = 0;
                    }
                    else noCaption.push(lineNumber);
                }
            }
            lineNumber = i + 1;
        }
    }

    //console.log('video without caption:');
    //console.log(noCaption);
    logs.push(noCaption);
}

// relationship
async function checkTableCaption(filePath)
{
    const noTableCaption = [];

    // const rl = readline.createInterface({
    //     input: fs.createReadStream(filePath),
    //     crlfDelay: Infinity
    // });

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const lines=[];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    for(let i=0;i<lines.length;i++) 
    {
        if(check==1) 
        {
            if(lines[i].includes('<caption')) 
            {
                check=0;
            }
            else if(lines[i].includes('<tbody') || lines[i].includes('<thead') || lines[i].includes('<tr')) 
            {
                noTableCaption.push(lineNumber);
                check=0;
            } 
        }
        if(lines[i].includes('<table')) 
        {
            check=1;
            if(lines[i].includes('<caption')) 
            {
                check=0;
            }
            else lineNumber=i+1;
        }

    }

    //console.log('table without caption:');
    //console.log(noTableCaption);
    logs.push(noTableCaption);
}

// audio checking
async function checkAudioElements(filePath) {
    const problematicLines = [];

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber = 0;

    for await (const line of rl) {
        lineNumber++;
        //console.log(line);
        if(line.includes('<audio') && line.includes('autoplay') && !line.includes('controls'))
            problematicLines.push({ line: lineNumber, content: line.trim() });
    }

    //console.log('Problematic Audio Elements:');
    //console.log(problematicLines);
    logs.push(problematicLines);
}

// keyboard
async function checkAccessibilityWithTabindex(filePath)
{
    const elementsWithTabIndexLessThanZero = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Define the element types to check for tabindex
    const elementTypesToCheck = [
        '<a', // Links
        '<button', // Buttons
        '<select', // Dropdown/select elements
        '<textarea', // Textareas
        '<input' // Telephone inputs
    ];

    // Process each line of the HTML content
   
    let lineNumber = 0;
    let check = 0;
    let temp;
    let tabIndexMatch;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<a ')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<a>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline:  '<a>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<a ')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            //console.log(line);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline:  '<a>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }
    
    lineNumber = 0;
    check = 0;
    // button 
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<button')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<button',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<button>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<button')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<button>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

    // select 
    lineNumber = 0;
    check = 0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<select')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<select>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<select>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<select')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<select>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

    // textaria
    lineNumber = 0;
    check = 0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<textaria')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<textaria>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<textaria>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<textaria')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<textaria>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

    // input
    lineNumber = 0;
    check = 0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<input')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<input>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<input>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<input')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<input>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

        
    if (elementsWithTabIndexLessThanZero.length > 0) 
    {
        //console.log('Elements with tabindex < 0:');
        elementsWithTabIndexLessThanZero.forEach(element => {
            //console.log(`Error: ${element.errorline}, Line Number: ${element.lineNumber}`);
        });
        logs.push(elementsWithTabIndexLessThanZero);
    } 
    else 
    {
        //console.log('All elements have valid tabindex values!');
    }
}

//focus order
async function checkFocusOrder(filePath)
{
    const elementsWithTabIndexLessThanZero = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Define the element types to check for tabindex
    const elementTypesToCheck = [
        '<a', // Links
        '<button', // Buttons
        '<select', // Dropdown/select elements
        '<textarea', // Textareas
        '<input' // Telephone inputs
    ];

    // Process each line of the HTML content
   
    let lineNumber = 0;
    let check = 0;
    let temp;
    let tabIndexMatch;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<a ')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<a>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline:  '<a>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<a ')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            //console.log(line);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline:  '<a>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }
    
    lineNumber = 0;
    check = 0;
    // button 
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<button')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<button',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<button>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<button')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<button>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

    // select 
    lineNumber = 0;
    check = 0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<select')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<select>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<select>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<select')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<select>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

    // textaria
    lineNumber = 0;
    check = 0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<textaria')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<textaria>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<textaria>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<textaria')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<textaria>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

    // input
    lineNumber = 0;
    check = 0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<input')) {
                check = 0;
                elementsWithTabIndexLessThanZero.push({
                    errorline: '<input>',
                    lineNumber: temp    
                });
            }
            else if (line.includes('tabindex')) 
            {
                check=0;
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    if(tabIndexValue < 0)
                    {
                        elementsWithTabIndexLessThanZero.push({
                        errorline: '<input>',
                        lineNumber: temp
                        });
                    }
                }
            }
        }
        if (line.includes('<input')) 
        {
            tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
            if (tabIndexMatch) 
            {
                const tabIndexValue = parseInt(tabIndexMatch[1]);
                if(tabIndexValue < 0)
                {
                    elementsWithTabIndexLessThanZero.push({
                    errorline: '<input>',
                    lineNumber: lineNumber
                    });
                }
            }
            else 
            {
                temp=lineNumber;
                check=1;
            }
        }
    }

        
    if (elementsWithTabIndexLessThanZero.length > 0) 
    {
        //console.log('Elements with tabindex < 0:');
        elementsWithTabIndexLessThanZero.forEach(element => {
            //console.log(`Error: ${element.errorline}, Line Number: ${element.lineNumber}`);
        });
        logs.push(elementsWithTabIndexLessThanZero);
    } 
    else 
    {
        //console.log('All elements have valid tabindex values!');
    }
}

// one character key
async function checkOneCharacterkey(filePath)
{
    const oneCharShortcut = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    }); 

    const lines=[];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('accesskey')) 
        {
            let keyMatch=lines[i].match(/accesskey="([^"]+)"/);
            let keyshortcut=keyMatch[1];
            if(keyshortcut.length==1) 
            {
                oneCharShortcut.push(i+1);
            }
        }
    }

    //console.log('one character shortcut:');
    //console.log(oneCharShortcut);
    logs.push(oneCharShortcut);
}

// skip link
async function checkSkipLink(filePath) 
{
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    }); 

    let lineNumber = 0;
    let check=0;
    let temp;
    const lines=[];
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<body')) 
        {
            check=1;
            temp=i+1;
        }
        if(check==1) 
        {
            if(lines[i].includes('<a')) 
            {
                let hrefMatch=lines[i].match(/href="([^"]+)"/);
                let value=hrefMatch[1];
                if(value.length>0 && value[0]=='#') 
                {
                    check=0;
                    break;
                }
                else 
                {
                    lineNumber=temp;
                    break;
                }
            }
            else if(!lines[i].includes('<header') && lines[i].includes('<')) 
            {
                lineNumber=temp;
                break;
            }
        }
    }

    if(lineNumber==0) ;//console.log("skip link is provided");
    else 
    {
        //console.log('skip link is not provided');
        //console.log(lineNumber);
    }
}

// input
async function checkOnInput(filePath)
{
    const oninput = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    }); 

    const lines=[];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    let notHidden=0;
    for(let i=0;i<lines.length;i++) 
    {
        if(check==1) 
        {
            if(lines[i].includes('<button'))
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1];
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                    }
                }
            }
            else if(lines[i].includes('<input')) 
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1];
                    //console.log(value);
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                    }
                    else if(value==='image')
                    {
                        check=0;
                        notHidden=0;
                    }
                    else if(value!=='hidden') 
                    {
                        //console.log(value, 'uff', i+1);
                        notHidden=1;
                    }
                }
            }
            else if(lines[i].includes('</form>')) 
            {
                check=0;
                if(notHidden===1)
                {
                    oninput.push(lineNumber);
                }
                notHidden=0;
            }
        }
        if(lines[i].includes('<form')) 
        {
            check=1;
            if(lines[i].includes('<button'))
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1];
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                    }
                }
            }
            else if(lines[i].includes('<input')) 
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1];
                    // console.log(value);
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                    }
                    else if(value==='image')
                    {
                        check=0;
                        notHidden=0;
                    }
                    else if(value!=='hidden') 
                    {
                        notHidden=1;
                    }
                }
            }
            lineNumber=i+1;
        }
    }

    //console.log('form without submit option:');
    //console.log(oninput);
    logs.push(oninput);
}

// labels
async function checkLabel(url) 
{
    const noLabel = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    }); 

    const lines=[];
    const emit=['button','hidden','image','reset','submit'];
    const after=['checkbox','radio'];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<input')) 
        {
            typeMatch=lines[i].match(/type="([^"]+)"/);
            if(typeMatch) 
            {
                let value=typeMatch[1];
                if(emit.includes(value)) continue;
                if(after.includes(value)) 
                {
                    let idMatch=lines[i].match(/id="([^"]+)"/);
                    let id=idMatch[1];
                    if(lines[i+1].includes('<label')) 
                    {
                        let forMatch=lines[i+1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1];
                        if(forValue!=id) 
                        {
                            noLabel.push(i+1);
                        }
                    }
                    else if(lines[i-1].includes('<label')) 
                    {
                        let forMatch=lines[i-1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1];
                        if(forValue!=id) 
                        {
                            noLabel.push(i+1);
                        }
                    }
                    else 
                    {
                        noLabel.push(i+1);
                    }
                }
                else 
                {
                    let idMatch=lines[i].match(/id="([^"]+)"/);
                    let id=idMatch[1];
                    if(lines[i-1].includes('<label')) 
                    {
                        let forMatch=lines[i-1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1];
                        if(forValue!=id) 
                        {
                            noLabel.push(i+1);
                        }
                    }
                    else if(lines[i+1].includes('<label'))
                    {
                        let forMatch=lines[i+1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1];
                        if(forValue!=id) 
                        {
                            noLabel.push(i+1);
                        }
                    }
                    else 
                    {
                        noLabel.push(i+1);
                    }
                }
            }
        }
    }

   // console.log('input without label:');
    //console.log(noLabel);
    logs.push(noLabel);
}

//sensory
async function checkLabelsHaveText(filePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        //await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.setContent(filePath, { waitUntil: 'domcontentloaded' });
        // Evaluate the page to find all label elements
        const labelsWithText = [];
        const labelsWithoutText = {};

        const labelElements = await page.evaluate(() => {
            const labels = Array.from(document.querySelectorAll('label'));
            return labels.map(label => ({
                tagName: label.tagName.toLowerCase(),
                id: label.id || '',
                className: label.className || '',
                textContent: label.innerText.trim()
            }));
        });

        // Check each label's text content
        labelElements.forEach(label => {
            const { tagName, id, className, textContent } = label;
            const key = `${tagName}#${id}.${className}`.replace(/\s+/g, ''); // Create a unique key for the object

            if (!textContent) {
                if (!labelsWithoutText[key]) {
                    labelsWithoutText[key] = [];
                }
                labelsWithoutText[key].push(label);
            } else {
                labelsWithText.push(label);
            }
        });

        // Log labels without text
        if (Object.keys(labelsWithoutText).length > 0) {
            //console.log('Labels without text content:');
            Object.entries(labelsWithoutText).forEach(([key, labels]) => {
                //console.log(`- Key: ${key}`);
                labels.forEach(label => {
                   // console.log(`  - Tag Name: ${label.tagName}`);
                    //console.log(`  - ID: ${label.id || 'N/A'}`);
                   // console.log(`  - Class Name: ${label.className || 'N/A'}`);
                });
            });
        } 
        else {
            //console.log('All label elements contain text content.');
        }

    } catch (error) {
        //console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

// name role value
async function extractLinks(filePath) {
    const browser = await puppeteer.launch({timeout: 0});
    const page = await browser.newPage();

    try {
        //await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.setContent(filePath, { waitUntil: 'domcontentloaded' });
        // Extract all <a> elements from the page
        const links = await page.evaluate(() => {
            const linkElements = Array.from(document.querySelectorAll('a'));
            const linkData = [];

            linkElements.forEach(link => {
                const linkText = link.textContent.trim();
                const hasTitleAttribute = link.hasAttribute('title');
                
                // Check conditions for storing in map
                if (!linkText && !hasTitleAttribute) {
                    const key = `${link.tagName}.${link.id || ''}.${link.className || ''}`;
                    linkData.push({
                        key,
                        tagName: link.tagName,
                        id: link.id || null,
                        className: link.className || null,
                        href: link.href || null,
                        title: link.getAttribute('title') || null
                    });
                }
            });
           // logs.push(linkData);

            return linkData;
        });

        
        if (links.length > 0) {
           // console.log('Links with missing link text and title attribute:');
            links.forEach(link => {
                //console.log(`Key: ${link.key}`);
                //console.log(`Tag Name: ${link.tagName}`);
                //console.log(`ID: ${link.id}`);
                //console.log(`Class Name: ${link.className}`);
                //console.log(`Href: ${link.href}`);
                //console.log(`Title: ${link.title}`);
                //console.log('---');
            });
        } 
        else {
            //console.log('No links found with missing link text and title attribute.');
        }

    } catch (error) {
        //console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

//pointer cancellation
async function checkDefaultEventOverrides(filePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // console.log(url);
        //await page.goto(url, { waitUntil: 'domcontentloaded' }); 
        await page.setContent(filePath, { waitUntil: 'domcontentloaded' });
        const overriddenElements = await page.evaluate(() => {
            const overriddenElements = [];
            const allElements = document.querySelectorAll('a, button');
            // console.log('Total elements:', allElements.length); // Check if elements are found
            // console.log('Elements:', allElements); // Log the elements

            allElements.forEach(element => {
                ['mousedown'].forEach(eventType => {
                    const eventListener = element.events && element.events[eventType];
                    
                    if (eventListener && eventListener.length > 0) {
                        overriddenElements.push({
                            tagName: element.tagName.toLowerCase(),
                            id: element.id || '',
                            className: element.className || '',
                            eventType: eventType
                        });
                    }
                });
            });

            return overriddenElements;
        });

        if (overriddenElements.length > 0) {
            //console.log('Elements with overridden default events:');
            overriddenElements.forEach(element => {
                //console.log(`- TagName: ${element.tagName}`);
                //console.log(`- ID: ${element.id || 'N/A'}`);
                //console.log(`- Class: ${element.className || 'N/A'}`);
                //console.log(`- Event Type: ${element.eventType}`);
            });
        } else {
            //console.log('No elements with overridden default events found.');
        }

    } catch (error) {
        //console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

//let arr= [1,2,3,4];
async function sendLogs(logs) {
    //console.log(logs);
    try {
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await axios.post('http://localhost:4000/logs', { logs });
        console.log('Logs sent successfully');
        console.log(logs);
       
        //console.log("xyz");
    } catch (error) {
        //console.error('Error sending logs:', error.message);
    }
}

module.exports = { sendLogs };

async function transcribeMedia(mediaFilePath) {
    try {
        // Create a SpeechClient
        const speechClient = new SpeechClient();

        // Read media file
        const mediaBytes = fs.readFileSync(mediaFilePath);

        // Determine media type based on file extension
        const isAudio = mediaFilePath.endsWith('.mp3') || mediaFilePath.endsWith('.wav');
        const isVideo = mediaFilePath.endsWith('.mp4') || mediaFilePath.endsWith('.avi');

        // Configure request
        const request = {
            audio: {
                content: mediaBytes.toString('base64'),
            },
            config: {
                encoding: isAudio ? 'LINEAR16' : 'LINEAR16', // Adjust encoding based on media type
                sampleRateHertz: isAudio ? 16000 : 44100, // Adjust sample rate based on media type
                languageCode: 'en-US',
            },
        };

        // Perform speech recognition
        const [response] = await speechClient.recognize(request);
        const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');

        return transcription;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function checkVideoAccessibility(filePath) {
    try {
        // Initialize array to store line numbers of violations
        const lineNumbers = [];

        // Create a read stream for the HTML file
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineNumber = 0;

        rl.on('line', async (line) => {
            lineNumber++; // Increment line number

            // Load the line into Cheerio for easy DOM manipulation
            const $ = cheerio.load(line);

            // Check if there is a video element
            const videoElement = $('video');
            if (videoElement.length > 0) {
                // Fetch transcript content if link found
                const videoParent = videoElement.parent();
                const transcriptLink = videoParent.find('a[href*="transcript"]');
                if (transcriptLink.length === 0) {
                    lineNumbers.push(lineNumber);
                    console.log(`Error: No transcript link found for the video at line ${lineNumber}.`);
                    var arr=[];
                    arr.push(`No transcript link found for the video at line ${lineNumber}`)
                    logs.push(arr);
                    return;
                }
                const transcriptUrl = transcriptLink.attr('href');
                const transcriptContent = fs.readFileSync(transcriptUrl, 'utf8');

                // Transcribe video content
                const videoFilePath = videoElement.attr('src');
                const videoTranscription = await transcribeMedia(videoFilePath);

                // Check if transcript content matches video transcription
                if (transcriptContent.trim() === videoTranscription.trim()) {
                    console.log(`Success: Video accessibility checks passed for the video at line ${lineNumber}.`);

                    // Check for audio elements inside the video
                    const audioElements = videoElement.find('audio');
                    if (audioElements.length > 0) {
                        audioElements.each(async (index, audioElement) => {
                            const audioParent = $(audioElement).parent();
                            const audioTranscriptLink = audioParent.find('a[href*="transcript"]');
                            if (audioTranscriptLink.length === 0) {
                                //lineNumbers.push(lineNumber);
                                //console.log(`Error: No transcript link found for the audio inside the video (${index}) at line ${lineNumber}.`);
                            } else {
                                const audioTranscriptUrl = audioTranscriptLink.attr('href');
                                const audioTranscriptContent = fs.readFileSync(audioTranscriptUrl, 'utf8');

                                // Transcribe audio content inside the video
                                const audioFilePath = $(audioElement).attr('src');
                                const audioTranscription = await transcribeMedia(audioFilePath);

                                // Check if transcript content matches audio transcription inside the video
                                if (audioTranscriptContent.trim() !== audioTranscription.trim()) {
                                    lineNumbers.push(lineNumber);
                                    console.log(`Error: Transcript for audio inside the video (${index}) does not match its transcription at line ${lineNumber}.`);
                                    var arr=[];
                                    arr.push(`transcript audio does not match video at line ${lineNumber}`)
                                    logs.push(arr);
                                }
                            }
                        });
                    }
                } else {
                    lineNumbers.push(lineNumber);
                    console.log(`Error: Transcript does not match video transcription at line ${lineNumber}.`);
                    var arr=[];
                    arr.push(`transcript does not match video at line ${lineNumber}`)
                    logs.push(arr);
                }
            }
        });

        rl.on('close', () => {
            console.log('Finished reading file.');
            console.log('Line numbers of violations:', lineNumbers);
        });

        return lineNumbers;
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

async function checkAudioAccessibility(filePath) {
    try {
        // Initialize array to store line numbers of violations
        const lineNumbers = [];

        // Create a read stream for the HTML file
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineNumber = 0;

        rl.on('line', async (line) => {
            lineNumber++; // Increment line number

            // Load the line into Cheerio for easy DOM manipulation
            const $ = cheerio.load(line);

            // Check if there is an audio element
            const audioElement = $('audio');
            if (audioElement.length > 0) {
                // Fetch transcript content if link found
                const audioParent = audioElement.parent();
                const transcriptLink = audioParent.find('a[href*="transcript"]');
                if (transcriptLink.length === 0) {
                    lineNumbers.push(lineNumber);
                    console.log(`Error: No transcript link found for the audio at line ${lineNumber}.`);
                    var arr=[];
                    arr.push(`No transcript link found for the audio at line ${lineNumber}`)
                    logs.push(arr);
                    return;
                }
                const transcriptUrl = transcriptLink.attr('href');
                const transcriptContent = fs.readFileSync(transcriptUrl, 'utf8');

                // Transcribe audio content
                const audioFilePath = audioElement.attr('src');
                const audioTranscription = await transcribeMedia(audioFilePath);

                // Check if transcript content matches audio transcription
                if (transcriptContent.trim() !== audioTranscription.trim()) {
                    lineNumbers.push(lineNumber);
                    console.log(`Error: Transcript does not match audio transcription at line ${lineNumber}.`);
                    var arr=[];
                    arr.push(`transcript does not match video at line ${lineNumber}`)
                    logs.push(arr);
                }
            }
        });

        rl.on('close', () => {
            console.log('Finished reading file.');
            console.log('Line numbers of violations:', lineNumbers);
        });

        return lineNumbers;
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

function checkDeviceOrientation(filePath) {
    try {
        // Initialize an array to store the line numbers where errors occur
        const errorLineNumbers = [];

        // Create a read stream for the HTML file
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineNumber = 0;

        rl.on('line', (line) => {
            lineNumber++; // Increment line number

            // Load the line into Cheerio for easy DOM manipulation
            const $ = cheerio.load(line);

            // Define an array to store the elements and messages related to device orientation
            const elementsToCheck = [
                '.rotate',
                '.content',
                '.landscape',
                '.portrait',
                '.orientation-control',
                '.orientation-failure',
                '.orientation-failure-message',
                '.reorientation-info',
                '.orientation-alert',
                '.orientation-warning',
                '.orientation-error',
            ];

            // Loop through each element to check if it's present in the line
            elementsToCheck.forEach((selector) => {
                const element = $(selector);
                if (element.length > 0) {
                    // Check if the element contains any text
                    const message = element.text().trim();
                    if (message === '') {
                        // If no message is found, add the line number to the error array
                        errorLineNumbers.push(lineNumber);
                    }
                }
            });
        });

        rl.on('close', () => {
            console.log('Device orientation check complete.');
            if (errorLineNumbers.length > 0) {
                console.log('Line numbers where errors occurred:', errorLineNumbers);
            } else {
                console.log('No errors found.');
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

function getColorFormat(color) {
    // Check if color is defined and not empty
    if (color && color.trim()) {
        // Regular expressions to match hexadecimal and RGB colors
        const hexRegex = /^#[0-9a-f]{3,6}$/i;
        const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;

        // Check if the color matches the hex or RGB color format
        if (hexRegex.test(color)) {
            return 'hex'; // Color is in hexadecimal format
        } else if (rgbRegex.test(color)) {
            return 'rgb'; // Color is in RGB format
        } else {
            return 'unknown'; // Unable to determine the color format
        }
    } else {
        return 'unknown'; // Color is undefined or empty
    }
}


function linkContrastRatio(filePath) {
    try {
        // Read HTML file
        const html = fs.readFileSync(filePath, 'utf8');

        // Parse HTML using cheerio
        const $ = cheerio.load(html);

        // Retrieve link color from inline style
        let linkColor = $('a').attr('style');
        let textColor = $('body').css('color');

        var checker = getColorFormat(textColor);
        if (checker == "unknown") textColor = convert.keyword.rgb(textColor);

        if (linkColor) {
            const colorIndex = linkColor.indexOf('color:');
            if (colorIndex !== -1) {
                // Extract the color value from the inline style
                linkColor = linkColor.slice(colorIndex + 6); // 6 is the length of 'color:'
                linkColor = linkColor.split(';')[0].trim(); // Extract the color value before the next ';'
            }
        }

        // Check for CSS rules
        $('style').each((index, element) => {
            const cssContent = $(element).text();
            if (cssContent.includes('a {')) {
                const startIndex = cssContent.indexOf('color:');
                if (startIndex !== -1) {
                    const endIndex = cssContent.indexOf(';', startIndex);
                    if (endIndex !== -1) {
                        // Extract the color value from the CSS rule
                        linkColor = cssContent.slice(startIndex + 6, endIndex).trim(); // 6 is the length of 'color:'
                    }
                }
            }
        });

        // Fallback to browser default if no color is defined
        if (!linkColor) {
            // Specify the default link color used by browsers
            const defaultLinkColor = '#0000ff'; // Example default color

            // Log that the default color is being used
            console.log('Link color not defined. Using browser default color:', defaultLinkColor);

            // Assign default color
            linkColor = defaultLinkColor;
        }

        if (!textColor) {
            // Specify the default link color used by browsers
            const defaultTextColor = '#ffffff'; // Example default color

            // Log that the default color is being used
            console.log('Text color not defined. Using browser default color:', defaultTextColor);

            // Assign default color
            textColor = defaultTextColor;
        }

        console.log('Link color:', linkColor);

        // Function to calculate relative luminance
        function calculateRelativeLuminance(color) {
            const srgbAdjusted = color.map(value => {
                console.log("value: " + value);
                const srgbValue = value / 255;
                if (srgbValue <= 0.03928) {
                    return srgbValue / 12.92;
                } else {
                    return Math.pow((srgbValue + 0.055) / 1.055, 2.4);
                }
            });
            return 0.2126 * srgbAdjusted[0] + 0.7152 * srgbAdjusted[1] + 0.0722 * srgbAdjusted[2];
        }

        // Function to check if a color meets the 3:1 contrast ratio with black
        function meetsContrastRatio(color1, color2) {
            const textLuminance = calculateRelativeLuminance(color2); // Black
            const colorLuminance = calculateRelativeLuminance(color1);
            console.log(colorLuminance);
            console.log(textLuminance);
            var L1 = textLuminance,
                L2 = colorLuminance;
            if (textLuminance < colorLuminance) {
                L1 = colorLuminance;
                L2 = textLuminance;
            }

            const contrastRatio = (L1 + 0.05) / (L2 + 0.05); // Adding 0.05 to prevent division by zero
            console.log("color contrast:" + contrastRatio);
            return contrastRatio >= 3;
        }

        // Function to convert hex color to sRGB values
        function hexToSrgb(hex) {
            // Check if hex is a string
            if (typeof hex === 'string') {
                return [
                    parseInt(hex.slice(1, 3), 16), // Red component
                    parseInt(hex.slice(3, 5), 16), // Green component
                    parseInt(hex.slice(5, 7), 16) // Blue component
                ];
            } else console.log("error");
            // If hex is not a string, return null or handle the error as appropriate
            return null;
        }

        function rgbToArray(rgbString) {
            // Remove the 'rgb(' and ')' parts and split the string by commas
            const rgbValues = rgbString.substring(4, rgbString.length - 1).split(',');

            // Convert the extracted RGB values to integers and return them in an array
            return [
                parseInt(rgbValues[0].trim()), // Red value
                parseInt(rgbValues[1].trim()), // Green value
                parseInt(rgbValues[2].trim()) // Blue value
            ];
        }

        let lineNumbers = [];

        // Example usage
        const linkColorHex = linkColor; // Color in #RRGGBB format
        const linkColor1 = hexToSrgb(linkColorHex);

        if (checker == "hex") {
            const textColor1 = hexToSrgb(textColor);
        } else textColor1 = rgbToArray(textColor);

        const linkColor2 = [0, 0, 255];

        if (!meetsContrastRatio(linkColor1, textColor1)) {
            console.log("Link color does not meet the 3:1 contrast ratio with black text.");
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');
            lines.forEach((line, index) => {
                if (line.includes('<a')) {
                    lineNumbers.push(index + 1);
                }
            });
        }

        console.log('Line numbers where link color violates contrast ratio:', lineNumbers);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

function bodyTextContrastRation(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const root = parse(html);

        function calculateRelativeLuminance(color) {
            const srgbAdjusted = color.map(value => {
                const srgbValue = value / 255;
                if (srgbValue <= 0.03928) {
                    return srgbValue / 12.92;
                } else {
                    return Math.pow((srgbValue + 0.055) / 1.055, 2.4);
                }
            });
            return 0.2126 * srgbAdjusted[0] + 0.7152 * srgbAdjusted[1] + 0.0722 * srgbAdjusted[2];
        }

        function meetsContrastRatio(color1, color2) {
            const textLuminance = calculateRelativeLuminance(color2); // Black
            const colorLuminance = calculateRelativeLuminance(color1);

            var L1 = textLuminance,
                L2 = colorLuminance;
            if (textLuminance < colorLuminance) {
                L1 = colorLuminance;
                L2 = textLuminance;
            }

            const contrastRatio = (L1 + 0.05) / (L2 + 0.05); // Adding 0.05 to prevent division by zero
            return contrastRatio;
        }

        function hexToSrgb(hex) {
            if (typeof hex === 'string') {
                return [
                    parseInt(hex.slice(1, 3), 16), // Red component
                    parseInt(hex.slice(3, 5), 16), // Green component
                    parseInt(hex.slice(5, 7), 16)  // Blue component
                ];
            }
            return null;
        }

        // Get all text elements
        const textElements = root.querySelectorAll('*:not(script):not(style)')
            .map(element => element.text.trim())
            .filter(text => text.length > 0); // Filter out empty texts

        // Check contrast for each text element
        textElements.forEach((text, index) => {
            const fontSize = 16; // Font size in pixels
            const fontWeight = 'normal'; // Font weight
            const backgroundColor = '#ffffff'; // Background color in hex format
            const textColor = '#000000'; // Text color in hex format

            let backgroundColor1 = hexToSrgb(backgroundColor);
            let textColor1 = hexToSrgb(textColor);

            const contrastRatio = meetsContrastRatio(textColor1, backgroundColor1);

            // Determine the situation based on font size and weight
            let situation;
            if (fontSize < 18 && fontWeight !== 'bold') {
                situation = 'Situation A';
            } else if (fontSize >= 18 && fontWeight !== 'bold') {
                situation = 'Situation B';
            } else if (fontSize < 14 && fontWeight === 'bold') {
                situation = 'Situation A';
            } else {
                situation = 'Situation B';
            }

            // Determine if the contrast ratio meets the requirements
            let meetsRequirements;
            if (situation === 'Situation A') {
                meetsRequirements = contrastRatio >= 4.5;
            } else {
                meetsRequirements = contrastRatio >= 3;
            }

            // Output the result
            console.log(`Text: "${text}"`);
            console.log(`Contrast Ratio: ${contrastRatio}`);
            console.log(`Situation: ${situation}`);
            console.log(`Meets Requirements: ${meetsRequirements}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}


parseHTMLFile(filePath);
checkCaption(filePath);
checkTableCaption(filePath);
checkAudioElements(filePath);
checkAccessibilityWithTabindex(filePath);
//checkFocusOrder(filePath);
checkOneCharacterkey(filePath);
checkSkipLink(filePath);
checkOnInput(filePath);
checkLabel(filePath);
checkLabelsHaveText(filePath);
extractLinks(filePath);
checkDefaultEventOverrides(filePath);

//linkContrastRatio(filePath);
checkVideoAccessibility(filePath);
checkAudioAccessibility(filePath);
checkDeviceOrientation(filePath);
bodyTextContrastRation(filePath);
sendLogs(logs);
