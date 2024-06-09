// it is gonaa be a huge file

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const filePath='SPL-02/merge/sourcecode.html';
let violations=[];
let details={};

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
    if(!details[keyy]) 
        details[keyy]=[];

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
                //imagesWithoutAlt.push({ src, lineNumber });  

                // ***** changed ******
                details[keyy].push(lineNumber, "null", "null");
                let temp;
                temp="Image without alt attribute or alt with null value:  ";
                temp=temp.concat("src: ",src);
                temp=temp.concat(" , line number: ",lineNumber);
                imagesWithoutAlt.push(temp);   

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
                    details[keyy].push(lineNumber, "null", "null");
                    let temp;
                    temp="Image without alt attribute or alt with null value:  ";
                    temp=temp.concat("src: ",src);
                    temp=temp.concat(" , line number: ",lineNumber);
                    imagesWithoutAlt.push(temp);  

                    // ***** changed ******
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
                        // ***** changed ******
                        details[keyy].push(lineNumber, "null", "null");
                        let temp;
                        temp="Image without alt attribute or alt with null value:  ";
                        temp=temp.concat("src: ",src);
                        temp=temp.concat(" , line number: ",lineNumber);
                        imagesWithoutAlt.push(temp);  

                        // ***** changed ******
                    }
                }
            }
        }
    }

    if(imagesWithoutAlt.length)
    {
        //console.log('Images without alt attribute:');
        console.log(imagesWithoutAlt);
        if(imagesWithoutAlt.length>0)
        violations.push(imagesWithoutAlt);
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
    if(!details[keyy])
        details[keyy]=[];

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
                    else 
                    {
                        // ****** changed *****
                        details[keyy].push(lineNumber,"null","null");
                        let temp="Video without caption: line number - ";
                        temp=temp.concat(lineNumber);
                        noCaption.push(temp);

                        // ****** changed *****
                    }
                }
            }  
            else if (lines[i].includes('</video>')) 
            {
                check = 0;
                //noCaption.push(lineNumber);

                // ****** changed *****
                details[keyy].push(lineNumber,"null","null");
                let temp="Video without caption: line number - ";
                temp=temp.concat(lineNumber);
                noCaption.push(temp);

                // ****** changed *****
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
                    else 
                    {
                        //noCaption.push(lineNumber);
                        // ****** changed *****
                        details[keyy].push(lineNumber,"null","null");
                        let temp="Video without caption: line number - ";
                        temp=temp.concat(lineNumber);
                        noCaption.push(temp);

                        // ****** changed *****
                    }
                }
            }
            lineNumber = i + 1;
        }
    }

    // changed 
    if(noCaption.length>0){
    console.log('video without caption:');
    console.log(noCaption);
     
    violations.push(noCaption);}
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
    if(!details[keyy])
        details[keyy]=[];

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
                
                check=0;
                //noTableCaption.push(lineNumber);

                // ***** changed ***********
                details[keyy].push(lineNumber,"null","null");
                let temp="Table without caption: line number - ";
                temp=temp.concat(lineNumber);
                noTableCaption.push(temp);

                // ***** changed ***********
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

    // changed
    if(noTableCaption.length>0) {
    console.log('table without caption:');
    console.log(noTableCaption);
    
    violations.push(noTableCaption);}
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
    if(!details[keyy])
        details[keyy]=[];

    for await (const line of rl) {
        lineNumber++;
        //console.log(line);
        if(line.includes('<audio') && line.includes('autoplay') && !line.includes('controls'))
        {   
            let temp="Audio element without controls: line number : "
            problematicLines.push(lineNumber);
            details[keyy].push(lineNumber,"null","null");
        }
    }

    if(problematicLines.length>0) 
        violations.push(problematicLines);
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
    if(!details[keyy]) 
        details[keyy]=[];

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
            if (line.includes('<a ')) 
            {
                check = 0;
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check=0;
                        // ***** changed *****
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);

                        // ***** changed *****
                        check = 0;
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
            if (line.includes('<select')) 
            {
                check = 0;
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        // ***** changed *****
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
                   // **** changed ********
                   details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        // ***** changed *****
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        // ***** changed *****
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
        console.log('Elements with tabindex < 0:');
        console.log(elementsWithTabIndexLessThanZero);
        violations.push(elementsWithTabIndexLessThanZero);
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
    if(!details[keyy]) 
        details[keyy]=[];

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
            if (line.includes('<a ')) 
            {
                check = 0;
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check=0;
                        // ***** changed *****
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);

                        // ***** changed *****
                        check = 0;
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
            if (line.includes('<select')) 
            {
                check = 0;
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        // ***** changed *****
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
                   // **** changed ********
                   details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        // ***** changed *****
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
                        details[keyy].push(temp,"null","null");
                        let val="Tab index less than zero: line number - ";
                        val=val.concat(temp);
                        elementsWithTabIndexLessThanZero.push(val);
                        check = 0;
                        // ***** changed *****
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
                    // **** changed ********
                    details[keyy].push(temp,"null","null");
                    let val="Tab index less than zero: line number - ";
                    val=val.concat(temp);
                    elementsWithTabIndexLessThanZero.push(val);
                    check = 0;
                    // ***** changed *****
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
        console.log('Elements with tabindex < 0:');
        console.log(elementsWithTabIndexLessThanZero);
        violations.push(elementsWithTabIndexLessThanZero);
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
    if(!details[keyy]) 
        details[keyy]=[];

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
                // ***** changed *******
                details[keyy].push(i+1, "null","null");
                let temp="One character shortcut key: line number - ";
                temp=temp.concat(i+1);
                oneCharShortcut.push(temp);

                // ***** changed *******
            }
        }
    }

    // ********* changed 
    if(oneCharShortcut.length>0){
    console.log('one character shortcut:');
    console.log(oneCharShortcut);
    violations.push(oneCharShortcut);
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
    for await(const line of rl) 
    {
        lines.push(line);
    }

    // changed
    let keyy="2.4.1";
    if(!details[keyy]) 
        details[keyy]=[];

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

    /// changed ****
    if(lineNumber!=0) 
    {
        let temp='skip link is not provided: line number - ';
        details[keyy].push(lineNumber+1,"null","null");        
        temp=temp.concat(lineNumber+1);
        console.log(temp);
        violations.push(temp);
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
    if(!details[keyy]) details[keyy]=[];

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
                    // ******* changed ******
                    let temp="button without submit type or input without submit or image type: line number - ";
                    temp=temp.concat(lineNumber);
                    oninput.push(temp);
                    details[keyy].push(lineNumber,"null","null");
                    // ******* changed ******
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

    if(oninput.length>0){
    console.log('form without submit option:');
    console.log(oninput);
    violations.push(oninput);}
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
    let keyy="3.2.2";
    if(!details[keyy]) details[keyy]=[];

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
                            // **** changed ****
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            details[keyy].push(i+1,"null","null");
                        }
                    }
                    else if(lines[i-1].includes('<label')) 
                    {
                        let forMatch=lines[i-1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1];
                        if(forValue!=id) 
                        {
                            // ***** changed
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            details[keyy].push(i+1,"null","null");
                        }
                    }
                    else 
                    {
                        //noLabel.push(i+1);
                        // ***** changed
                        let temp="without label: element in line number - ";
                        temp=temp.concat(i+1);
                        noLabel.push(temp);
                        details[keyy].push(i+1,"null","null");
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
                            //noLabel.push(i+1);
                            // ***** changed
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            details[keyy].push(i+1,"null","null");
                        }
                    }
                    else if(lines[i+1].includes('<label'))
                    {
                        let forMatch=lines[i+1].match(/for="([^"]+)"/);
                        let forValue=forMatch[1];
                        if(forValue!=id) 
                        {
                            //noLabel.push(i+1);
                            // ***** changed
                            let temp="without label: element in line number - ";
                            temp=temp.concat(i+1);
                            noLabel.push(temp);
                            details[keyy].push(i+1,"null","null");
                        }
                    }
                    else 
                    {
                        //noLabel.push(i+1);
                        // ***** changed
                        let temp="without label: element in line number - ";
                        temp=temp.concat(i+1);
                        noLabel.push(temp);
                        details[keyy].push(i+1,"null","null");
                    }
                }
            }
        }
    }

    // cahnged
    if(noLabel.length>0){
    console.log('input without label:');
    console.log(noLabel);
    violations.push(noLabel);
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
        if(!details[keyy]) details[keyy]=[];

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

        //  ****** changed
        const labelWithoutText=[];
        // Log labels without text
        if (Object.keys(labelsWithoutText).length > 0) {
            
            Object.entries(labelsWithoutText).forEach(([key, labels]) => {
                
                
                labels.forEach(label => {
                    let temp='Labels without text content: ';

                    // console.log(`  - Tag Name: ${label.tagName}`);
                    // console.log(`  - ID: ${label.id || 'N/A'}`);
                    // console.log(`  - Class Name: ${label.className || 'N/A'}`);

                    temp=temp.concat("tag name: ",label.tagName, " id: ",`${label.id || 'N/A'}`, `class name: ${label.className || 'N/A'}`);
                    labelWithoutText.push(temp);
                    details[keyy].push("null",`${label.id || 'null'}`,`${label.className || 'null'}`);
                });
            });
        } 
        if(labelWithoutText.length>0) violations.push(labelWithoutText);

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
        if(!details[keyy]) details[keyy]=[];
        const faultlink=[];
        if (links.length > 0) {
            //console.log('Links with missing link text and title attribute:');
            links.forEach(link => {
                let temp="Links with missing link text and title attribute: ";
                temp=temp.concat(`Tag Name: ${link.tagName}`,`ID: ${link.id}`,`Class Name: ${link.className}`,`Href: ${link.href}`)
                //console.log(`Tag Name: ${link.tagName}`);
                //console.log(`ID: ${link.id}`);
                // console.log(`Class Name: ${link.className}`);
                // console.log(`Href: ${link.href}`);
                
                faultlink.push(temp);
                details[keyy].push("null",`${link.id}`,` ${link.className}`);
            });
            if(faultlink.length>0) 
            {
                violations.push(faultlink);
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
         if(!details[keyy]) details[keyy]=[];
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
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}


parseHTMLFile(filePath);
checkCaption(filePath);
checkTableCaption(filePath);
checkAudioElements(filePath);
checkAccessibilityWithTabindex(filePath);
// // //checkFocusOrder(filePath);
checkOneCharacterkey(filePath);
checkSkipLink(filePath);
checkOnInput(filePath);
checkLabel(filePath);
checkLabelsHaveText(filePath);
extractLinks(filePath);
checkDefaultEventOverrides(filePath);
//console.log(violations);