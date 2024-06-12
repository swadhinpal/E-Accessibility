// it is gonna be a huge file

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();
const cheerio = require('cheerio');
const { SpeechClient } = require('@google-cloud/speech');
const convert = require('color-convert');
const { parse } = require('node-html-parser');
const filePath='sourcecode.html';

let violations=[];
let details=[];
let numbering=[];

// non-text-content
async function parseHTMLFile(filePath) {
    const imagesWithoutAlt = [];

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    // added
    let keyy="1.1.1";
    let ruleName="Image without alt";
    // if(!details[keyy]) 
    //     details[keyy]=[];

    let lineNumber1 = 0; // Initialize line number counter
    let check=0;
    let srcMatch;
    let altMatch;
    let lineNumber;
    let indexNo=0;
    let perLine=[];
    let cmnt=0;
    for await (const line of rl) 
    {
        lineNumber1++; // Increment line number for each line read
        if(line.includes('<!--')) 
        {
            cmnt=1;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(check==1) 
        {
            if(line.includes('<img')) 
            {
                check=0;
                const src=srcMatch[1];
                //imagesWithoutAlt.push({ src, lineNumber });  
                
                // ***** changed ******
                //details[keyy].push(lineNumber, "null", "null");
                let temp;
                temp="Image without alt attribute or alt with null value:  ";
                temp=temp.concat("src: ",src);
                temp=temp.concat(" , line number: ",lineNumber);
                imagesWithoutAlt.push(temp); 
                
                perLine.push({keyy,indexNo});
                indexNo++;
                // ***** changed *******
            }
            else if(line.includes('alt')) 
            {
                altMatch = line.match(/alt="([^"]+)"/);
                check=0;
                let altt=altMatch[1];
                if (altt==="") 
                {
                    const src=srcMatch[1];
                    
                    // ***** changed ******
                    //details[keyy].push(lineNumber, "null", "null");
                    let temp;
                    temp="Image without alt attribute or alt with null value:  ";
                    temp=temp.concat("src: ",src);
                    temp=temp.concat(" , line number: ",lineNumber);
                    imagesWithoutAlt.push(temp);  
                    
                    perLine.push({keyy,indexNo});
                    // ***** changed ******
                }
                indexNo++;
            }

        }
        if (line.includes('<img')) 
        {
            // Extract src and alt attributes from the img tag
            
            srcMatch = line.match(/src="([^"]+)"/);
            altMatch = line.match(/alt="([^"]+)"/);

            if (srcMatch) 
            {
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
                        // ***** changed ******
                        //details[keyy].push(lineNumber, "null", "null");
                        let temp;
                        temp="Image without alt attribute or alt with null value:  ";
                        temp=temp.concat("src: ",src);
                        temp=temp.concat(" , line number: ",lineNumber);
                        imagesWithoutAlt.push(temp); 
                        perLine.push({keyy,indexNo});
                        // ***** changed ******
                    }
                    indexNo++;
                }
            }
        }
    }

    if(imagesWithoutAlt.length)
    {
        //console.log('Images without alt attribute:');
        // console.log(imagesWithoutAlt);
        // if(imagesWithoutAlt.length>0){}
        violations.push(imagesWithoutAlt);
        details.push(perLine);
        let num=imagesWithoutAlt.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
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

    // changed 
    let keyy="1.2.2";
    let ruleName="video without caption";
    // if(!details[keyy])
    //     details[keyy]=[];

    const lines = [];
    let lineNumber = 0;
    let check = 0;
    let srcMatch;
    let kindmatch;
    let temp;
    let indexNo=0;
    let perLine=[];
    let cmnt=0;
    for await (const line of rl) {
        lines.push(line);
    }
    //console.log(lines.length);
    let notHidden = 0;
    for (let i = 0; i < lines.length; i++) 
    {
        if(lines[i].includes('<!--')) 
        {
            cmnt=1;
            
        }
        if(cmnt) 
        {
            if(lines[i].includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
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
                    else 
                    {
                        // ****** changed *****
                        //details[keyy].push(lineNumber,"null","null");
                        let temp="Video without caption: line number - ";
                        temp=temp.concat(lineNumber);
                        noCaption.push(temp);
                        perLine.push({keyy,indexNo});
                        // ****** changed *****
                    }
                    indexNo++;
                }
            }  
            else if (lines[i].includes('</video>')) 
            {
                check = 0;
                //noCaption.push(lineNumber);

                // ****** changed *****
                //details[keyy].push(lineNumber,"null","null");
                let temp="Video without caption: line number - ";
                temp=temp.concat(lineNumber);
                noCaption.push(temp);
                perLine.push({keyy,indexNo});
                indexNo++;
                // ****** changed *****
            }
        }
        if (lines[i].includes('<video')) 
        {
            check = 1;
            if (lines[i].includes('<track')) 
            {
                srcMatch = lines[i].match(/src="([^"]+)"/);
                kindmatch = lines[i].match(/kind="([^"]+)"/);
                if (srcMatch) 
                {
                    let value = kindmatch[1];
                    if (value === 'captions') {
                        check = 0;
                    }
                    else 
                    {
                        //noCaption.push(lineNumber);
                        // ****** changed *****
                        //details[keyy].push(lineNumber,"null","null");
                        let temp="Video without caption: line number - ";
                        temp=temp.concat(lineNumber);
                        noCaption.push(temp);
                        perLine.push({keyy,indexNo});
                        // ****** changed *****
                    }
                    indexNo++;
                }
            }
            lineNumber = i + 1;
        }
    }

    // changed 
    if(noCaption.length>0)
    {
        // console.log('video without caption:');
        // console.log(noCaption);
        violations.push(noCaption);
        details.push(perLine);
        let num=noCaption.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
    }
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

    // changed 
    let keyy="1.3.1";
    let ruleName="table without caption";
    // if(!details[keyy])
    //     details[keyy]=[];

    const lines=[];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    let indexNo=0;
    let perLine=[];
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    let cmnt=0;
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(lines[i].includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(check==1) 
        {
            if(lines[i].includes('<caption')) 
            {
                check=0;
                indexNo++;
            }
            else if(lines[i].includes('<tbody') || lines[i].includes('<thead') || lines[i].includes('<tr')) 
            {
                
                check=0;
                //noTableCaption.push(lineNumber);

                // ***** changed ***********
                // details[keyy].push(lineNumber,"null","null");
                let temp="Table without caption: line number - ";
                temp=temp.concat(lineNumber);
                noTableCaption.push(temp);
                perLine.push({keyy,indexNo});
                indexNo++;
                // ***** changed ***********
            } 
        }
        if(lines[i].includes('<table')) 
        {
            check=1;
            if(lines[i].includes('<caption')) 
            {
                check=0;
                indexNo++;
            }
            else lineNumber=i+1;
        }

    }

    // changed
    if(noTableCaption.length>0) 
    {
        // console.log('table without caption:');
        // console.log(noTableCaption);
        details.push(perLine);
        violations.push(noTableCaption);
        let num=noTableCaption.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
    }
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

    // changed 
    let keyy="1.4.2";
    let ruleName="audio without control";
    // if(!details[keyy])
    //     details[keyy]=[];

    let indexNo=0;
    let perLine=[];
    let cmnt=0;
    for await (const line of rl) {
        lineNumber++;
        //console.log(line);
        if(line.includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(line.includes('<audio') && line.includes('autoplay') && !line.includes('controls'))
        {   
            let temp="Audio element without controls. line number : "
            problematicLines.push(lineNumber);
            //details[keyy].push(lineNumber,"null","null");
            perLine.push({keyy,indexNo});
            indexNo++;
        }
        else if(line.includes('<audio')) 
        {
            indexNo++;
        }
    }

    if(problematicLines.length>0) 
    {
        violations.push(problematicLines);
        details.push(perLine);
        let num=problematicLines.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
    }
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
        '<input' // inputs
    ];

    // changed 
    let keyy="2.1.1";
    let ruleName="tab index less than 0";
    // if(!details[keyy]) 
    //     details[keyy]=[];

    // Process each line of the HTML content
   
    let lineNumber = 0;
    let check = 0;
    let temp;
    let tabIndexMatch;
    let indexNo=0;
    let perLine=[];
    let cmnt=0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<a ')) 
            {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check=0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    cmnt=0;
    // button 
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        // if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<button')) 
            {
                check = 0;
                indexNo++;
            }
            else if (line.includes('tabindex')) 
            {
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    
                    if(tabIndexValue < 0)
                    {
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                        check = 0;
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    cmnt=0;
    for await(const line of rl) 
    {
        lineNumber++;
        // if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        if(line.includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        
        if (check == 1) 
        {
            if (line.includes('<select')) 
            {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                   // **** changed ********
                //    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    cmnt=0;
    for await(const line of rl) 
    {
        lineNumber++;
        // if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        if(line.includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if (check == 1) 
        {
            if (line.includes('<textaria')) {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    cmnt=0;
    for await(const line of rl) 
    {
        lineNumber++;
        // if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        if(line.includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(line.includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if (check == 1) 
        {
            if (line.includes('<input')) {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
        // console.log('Elements with tabindex < 0:');
        // console.log(elementsWithTabIndexLessThanZero);
        violations.push(elementsWithTabIndexLessThanZero);
        details.push(perLine);
        let num=elementsWithTabIndexLessThanZero.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
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
        '<input' // inputs
    ];

    // changed 
    let keyy="2.4.3";
    
    // if(!details[keyy]) 
    //     details[keyy]=[];

    // Process each line of the HTML content
   
    let lineNumber = 0;
    let check = 0;
    let temp;
    let tabIndexMatch;
    let indexNo=0;
    let perLine=[];
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<a ')) 
            {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check=0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
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
                indexNo++;
            }
            else if (line.includes('tabindex')) 
            {
                tabIndexMatch = line.match(/tabindex="(-?\d+)"/);
                if (tabIndexMatch) 
                {
                    const tabIndexValue = parseInt(tabIndexMatch[1]);
                    
                    if(tabIndexValue < 0)
                    {
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                        check = 0;
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<select')) 
            {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                    indexNo++;
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
                   // **** changed ********
                //    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<textaria')) {
                check = 0;
                indexNo++;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
    indexNo=0;
    for await(const line of rl) 
    {
        lineNumber++;
        if(line.includes('<!--')) continue;
        //if(cnt==10) break;
        
        if (check == 1) 
        {
            if (line.includes('<input')) {
                check = 0;
                indexNo=0;
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
                        // **** changed ********
                        // details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        perLine.push({keyy,indexNo});
                        // ***** changed *****
                    }
                }
                indexNo++;
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
                    // **** changed ********
                    // details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    perLine.push({keyy,indexNo});
                    // ***** changed *****
                }
                indexNo++;
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
        // console.log('Elements with tabindex < 0:');
        // console.log(elementsWithTabIndexLessThanZero);
        violations.push(elementsWithTabIndexLessThanZero);
        details.push(perLine);
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

    // changed
    let keyy="2.1.4";
    let ruleName="one char shortcut key";
    // if(!details[keyy]) 
    //     details[keyy]=[];

    for await(const line of rl) 
    {
        lines.push(line);
    }
    let indexNo=0;
    let perLine=[];
    let cmnt=0;
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(lines[i].includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(lines[i].includes('accesskey')) 
        {
            let keyMatch=lines[i].match(/accesskey="([^"]+)"/);
            let keyshortcut=keyMatch[1];
            if(keyshortcut.length==1) 
            {
                // ***** changed *******
                // details[keyy].push(i+1, "null","null");
                let temp="One character shortcut key: line number - ";
                temp=temp.concat(i+1);
                oneCharShortcut.push(temp);
                perLine.push({keyy,indexNo});
                // ***** changed *******
            }
            indexNo++;
        }
    }

    // ********* changed 
    if(oneCharShortcut.length>0)
    {
        // console.log('one character shortcut:');
        // console.log(oneCharShortcut);
        violations.push(oneCharShortcut);
        details.push(perLine);
        let num=oneCharShortcut.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
    }
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
    let indexNo=0;
    let perLine=[];
    for await(const line of rl) 
    {
        lines.push(line);
    }

    let cmnt=0;
    // changed
    let keyy="2.4.1";
    let ruleName="no skip link";
    // if(!details[keyy]) 
    //     details[keyy]=[];

    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(lines[i].includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(lines[i].includes('<body')) 
        {
            check=1;
            temp=i+1;
        }
        if(check==1) 
        {
            if(lines[i].includes('<a ')) 
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

    /// changed ****
    if(lineNumber!=0) 
    {
        let temp='skip link is not provided. line number : ';
        // details[keyy].push(lineNumber+1,"null","null");        
        temp=temp.concat(lineNumber);
        violations.push(temp);
        perLine.push({keyy,indexNo});
        details.push(perLine);
        let num=1;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
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

    // changed
    let keyy="3.2.2";
    let ruleName="no submit type";
    // if(!details[keyy]) details[keyy]=[];

    const lines=[];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    let indexNo=0;
    let perLine=[];
    for await(const line of rl) 
    {
        lines.push(line);
    }
    //console.log(lines.length);
    let notHidden=0;
    let cmnt=0;
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(lines[i].includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(check==1) 
        {
            if(lines[i].includes('<button'))
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1].trim();
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                        indexNo++;
                    }
                }
            }
            else if(lines[i].includes('<input')) 
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1].trim();
                    //console.log(value);
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                        indexNo++;
                    }
                    else if(value==='image')
                    {
                        check=0;
                        notHidden=0;
                        indexNo++;
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
                    // ******* changed ******
                    let temp="button without submit type or input without submit or image type: line number - ";
                    temp=temp.concat(lineNumber);
                    oninput.push(temp);
                    perLine.push({keyy,indexNo});
                    // details[keyy].push(lineNumber,"null","null");
                    // ******* changed ******
                }
                notHidden=0;
                indexNo++;
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
                    let value=typeMatch[1].trim();
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                        indexNo++;
                    }
                }
            }
            else if(lines[i].includes('<input')) 
            {
                typeMatch=lines[i].match(/type="([^"]+)"/);
                if(typeMatch)
                {
                    let value=typeMatch[1].trim();
                    // console.log(value);
                    if(value==='submit') 
                    {
                        check=0;
                        notHidden=0;
                        indexNo++;
                    }
                    else if(value==='image')
                    {
                        check=0;
                        notHidden=0;
                        indexNo++;
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

    if(oninput.length>0)
    {
    // console.log('form without submit option:');
    // console.log(oninput);
        violations.push(oninput);
        details.push(perLine);
        let num=oninput.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
    }
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

    // changed
    let keyy="3.3.2";
    let ruleName="input without label";
    // if(!details[keyy]) details[keyy]=[];

    const lines=[];
    const emit=['button','hidden','image','reset','submit'];
    const after=['checkbox','radio'];
    let lineNumber = 0;
    let check = 0;
    let typeMatch;
    let temp; 
    let indexNo=0;
    let perLine=[];
    for await(const line of rl) 
    {
        lines.push(line);
    }
    let cmnt=0;
    for(let i=0;i<lines.length;i++) 
    {
        if(lines[i].includes('<!--')) 
        {
            cmnt=1;
            // continue;
        }
        if(cmnt) 
        {
            if(lines[i].includes('-->')) 
            {
                cmnt=0;
            }
            continue;
        }
        if(lines[i].includes('<input')) 
        {
            
            typeMatch=lines[i].match(/type="([^"]+)"/);
            if(typeMatch) 
            {
                let value=typeMatch[1].trim();
                
                if(emit.includes(value)) 
                {
                    indexNo++;
                    continue;
                }
                if(after.includes(value)) 
                {
                    let idMatch=lines[i].match(/id="([^"]+)"/);
                    if(idMatch){
                    let id=idMatch[1].trim();
                    if(lines[i+1].includes('<label')) 
                    {
                        let forMatch=lines[i+1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1].trim();
                        if(forValue!=id) 
                        {
                            // **** changed ****
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            // details[keyy].push(i+1,"null","null");  
                            perLine.push({keyy,indexNo});
                        }
                    }
                    else if(lines[i-1].includes('<label')) 
                    {
                        let forMatch=lines[i-1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1].trim();
                        if(forValue!=id) 
                        {
                            // ***** changed
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            // details[keyy].push(i+1,"null","null");
                            perLine.push({keyy,indexNo});
                        }
                    }
                    else 
                    {
                        //noLabel.push(i+1);
                        // ***** changed
                        let temp="without label: element in line number - ";
                        temp=temp.concat(i+1);
                        noLabel.push(temp);
                        console.log("hellooo");
                        // details[keyy].push(i+1,"null","null");
                        perLine.push({keyy,indexNo});
                    }
                    indexNo++;
                    }
                }
                else 
                {
                    let idMatch=lines[i].match(/id="([^"]+)"/);
                    if(idMatch){
                    let id=idMatch[1].trim();
                    if(lines[i-1].includes('<label')) 
                    {
                        let forMatch=lines[i-1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1].trim();
                        if(forValue!=id) 
                        {
                            //noLabel.push(i+1);
                            // ***** changed
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            // details[keyy].push(i+1,"null","null");
                            perLine.push({keyy,indexNo});
                        }
                    }
                    else if(lines[i+1].includes('<label'))
                    {
                        let forMatch=lines[i+1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1].trim();
                        if(forValue!=id) 
                        {
                            //noLabel.push(i+1);
                            // ***** changed
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            // details[keyy].push(i+1,"null","null");
                            perLine.push({keyy,indexNo});
                        }
                    }
                    else 
                    {
                        //noLabel.push(i+1);
                        // ***** changed
                        let temp="without label: element in line number - ";
                        temp=temp.concat(i+1);
                        noLabel.push(temp);
                        // details[keyy].push(i+1,"null","null");
                        perLine.push({keyy,indexNo});
                    }
                    indexNo++;
                    }
                }
            }
        }
    }

    // cahnged
    if(noLabel.length>0)
    {
        // console.log('input without label:');
        // console.log(noLabel);
        
        violations.push(noLabel);
        details.push(perLine);
        let num=noLabel.length;
        let another=[];
        another.push({ruleName,num});
        numbering.push(another);
    }
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

        // chnaged
        let keyy="1.3.3";
        let ruleName="label without text";
        // if(!details[keyy]) details[keyy]=[];

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

            if (!textContent) 
            {
                if (!labelsWithoutText[key]) {
                    labelsWithoutText[key] = [];
                }
                labelsWithoutText[key].push(label);
            } 
            else 
            {
                labelsWithText.push(label);
            }
        });

        //  ****** changed
        const labelWithoutText=[];
        // Log labels without text
        if (Object.keys(labelsWithoutText).length > 0) {
            
            Object.entries(labelsWithoutText).forEach(([key, labels]) => {
                labels.forEach(label => {
                    let temp='Labels without text content: ';

                    temp=temp.concat("tag name: ",label.tagName, " id: ",`${label.id || 'N/A'}`, `class name: ${label.className || 'N/A'}`);
                    labelWithoutText.push(temp);
                    // details[keyy].push("null",`${label.id || 'null'}`,`${label.className || 'null'}`);   
                });
            });
        } 
        if(labelWithoutText.length>0) 
        {
            violations.push(labelWithoutText);
            let indexNo=0;
            let perLine=[];
            perLine.push({keyy,indexNo});
            details.push(perLine);
            let num=labelWithoutText.length;
            let another=[];
            another.push({ruleName,num});
            numbering.push(another);
        }

    } catch (error) {
        console.error('Error:', error);
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

            return linkData;
        });

        // ****** changed 
        // changed 
        let keyy="4.1.2";
        let ruleName="link without text or tittle";
        // if(!details[keyy]) details[keyy]=[];
        const faultlink=[];
        if (links.length > 0) {
            //console.log('Links with missing link text and title attribute:');
            links.forEach(link => {
                let temp="Links with missing link text and title attribute: ";
                temp=temp.concat(`Tag Name: ${link.tagName}`,`ID: ${link.id}`,`Class Name: ${link.className}`,`Href: ${link.href}`)
                
                
                faultlink.push(temp);
                // details[keyy].push("null",`${link.id}`,` ${link.className}`);
            });
            if(faultlink.length>0) 
            {
                violations.push(faultlink);
                let indexNo=0;
                let perLine=[];
                perLine.push({keyy,indexNo});
                details.push(perLine);
                let num=faultlink.length;
                let another=[];
                another.push({ruleName,num});
                numbering.push(another);
            }
        } 
        

    } catch (error) {
        console.error('Error:', error);
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

        // changed
         // changed
         let keyy="2.5.2";
         let ruleName="default event overridden";
        //  if(!details[keyy]) details[keyy]=[];
        const overridden=[];
        if (overriddenElements.length > 0) {
            
            overriddenElements.forEach(element => {
                let temp='Elements with overridden default click event: ';
                temp=temp.concat(`- TagName: ${element.tagName}`,`- ID: ${element.id || 'N/A'}`,`- Class: ${element.className || 'N/A'}`)
                
                // console.log(`- TagName: ${element.tagName}`);
                // console.log(`- ID: ${element.id || 'N/A'}`);
                // console.log(`- Class: ${element.className || 'N/A'}`);
                
                overridden.push(temp);
                details[keyy].push("null",`${element.id || 'null'}`,`${element.className || 'N/A'}`);
            });
        }
        if(overridden.length>0) 
        {
            violations.push(overridden);
            let indexNo=0;
            let perLine=[];
            perLine.push({keyy,indexNo});
            details.push(perLine);
            let num=overridden.length;
            let another=[];
            another.push({ruleName,num});
            numbering.push(another);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}


async function sendLogs(violations, numbering) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await axios.post(`${process.env.BACKEND_URL}/logs`, { violations, numbering });
        console.log('Logs sent successfully');
        //console.log(numbering);
    } catch (error) {
        console.error('Error sending logs:', error.message);
    }
}




//parseHTMLFile(filePath);
// checkCaption(filePath);
// checkTableCaption(filePath);
// checkAudioElements(filePath);
// checkAccessibilityWithTabindex(filePath);
// // // //checkFocusOrder(filePath);
// checkOneCharacterkey(filePath);
// checkSkipLink(filePath);
// checkOnInput(filePath);
// //checkLabel(filePath);
// checkLabelsHaveText(filePath);
// extractLinks(filePath);
// checkDefaultEventOverrides(filePath);
// console.log(violations);
// console.log(details);  
module.exports = { sendLogs };
//async function runDetection() 
//{
     parseHTMLFile(filePath);
     checkCaption(filePath);
     checkTableCaption(filePath);
     checkAudioElements(filePath);
     checkAccessibilityWithTabindex(filePath);
     checkOneCharacterkey(filePath);
     checkSkipLink(filePath);
     checkOnInput(filePath);
     checkLabel(filePath);
     checkLabelsHaveText(filePath);
     extractLinks(filePath);
     checkDefaultEventOverrides(filePath);
     sendLogs(violations, numbering);
    //console.log(violations);
    // console.log(details);
 
    // Pass logs to the solution file
    require('./solution')(details, filePath);
    require('./error')(details, filePath);
//}

//runDetection();
