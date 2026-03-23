import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/ExpertsHub V2/client/src/config/i18n.js', 'utf8');
const lines = content.split('\n');
const hindiRegex = /[\u0900-\u097F]/;

lines.forEach((line, i) => {
    if (hindiRegex.test(line)) {
        console.log(`${i + 1}: ${line.trim()}`);
    }
});
