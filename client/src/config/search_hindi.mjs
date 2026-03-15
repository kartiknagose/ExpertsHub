import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/UrbanPro V2/client/src/config/i18n.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, i) => {
    if (line.includes('वफादारी')) {
        console.log(`${i + 1}: ${line.trim()}`);
    }
});
