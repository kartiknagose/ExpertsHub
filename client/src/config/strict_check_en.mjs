import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/UrbanPro V2/client/src/config/i18n.js', 'utf8');
const lines = content.split('\n');
const hindiRegex = /[\u0900-\u097F]/;

let inEnTranslation = false;
lines.forEach((line, i) => {
    const lineNum = i + 1;
    if (line.includes('en: {')) inEnTranslation = true;
    if (line.includes('hi: {')) inEnTranslation = false;
    
    if (inEnTranslation && hindiRegex.test(line)) {
        console.log(`${lineNum}: ${line.trim()}`);
    }
});
