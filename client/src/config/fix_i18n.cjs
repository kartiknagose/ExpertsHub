const fs = require('fs');
const path = require('path');

const i18nPath = path.join('d:', 'mini_project', 'ExpertsHub V2', 'client', 'src', 'config', 'i18n.js');
let content = fs.readFileSync(i18nPath, 'utf8');

// Function to detect if a string contains Hindi characters
function isHindi(str) {
  return /[\u0900-\u097F]/.test(str);
}

// We will split the file by languages to handle them separately
// This is a bit fragile but better than manual editing for 2000+ lines
const lines = content.split('\n');
let newLines = [];
let currentLang = null;
let inTranslation = false;

// We'll keep track of keys seen in EN to avoid duplicates and Hindi overwrites
let enKeys = new Map();
let hiKeys = new Map();

// Simplified approach: scan the file and pick out the keys for EN and HI
// Then reconstruct the objects.
// HOWEVER, we want to preserve comments and formatting if possible.

// Let's try a different approach:
// Identify the Hindi blocks in the EN section and remove them.
// Blocks are often preceded by comments like // Additional Customer Keys

let output = [];
let skipBlock = false;
let nestingLevel = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('en: {')) {
    currentLang = 'en';
  } else if (line.includes('hi: {')) {
    currentLang = 'hi';
  } else if (line.includes('mr: {')) {
    currentLang = 'mr';
  } else if (line.trim() === '},' && line.includes('}')) {
      // End of a language block
      currentLang = null;
  }

  // Detect and fix the duplicate blocks in EN
  // We know that in EN, some keys are repeated with Hindi values.
  // Example: 
  // "Welcome back,": "Welcome back,", (line 327)
  // ...
  // "Welcome back,": "वापसी पर स्वागत है,", (line 367)
  
  if (currentLang === 'en') {
    const match = line.match(/^\s*"([^"]+)":\s*"([^"]*)",?$/);
    if (match) {
      const key = match[1];
      const value = match[2];
      
      if (isHindi(value)) {
        // This is a Hindi value in the EN block. SKIP IT.
        console.log(`Skipping Hindi key in EN: ${key}`);
        continue; 
      }
      
      // If it's an English value but we've seen it before (and it was English), 
      // we might want to skip it too if it's a duplicate, but usually they aren't.
    }
    
    // Also skip comments that precede Hindi blocks in EN
    if (line.includes('//') && line.includes('Keys')) {
        // Look ahead to see if the next line is a Hindi translation
        let nextLine = lines[i+1];
        if (nextLine) {
            const nextMatch = nextLine.match(/^\s*"([^"]+)":\s*"([^"]*)",?$/);
            if (nextMatch && isHindi(nextMatch[2])) {
                console.log(`Skipping comment for Hindi block in EN: ${line.trim()}`);
                continue;
            }
        }
    }
  }

  output.push(line);
}

fs.writeFileSync(i18nPath, output.join('\n'), 'utf8');
console.log('Cleaned up i18n.js');
