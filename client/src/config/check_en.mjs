import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/ExpertsHub V2/client/src/config/i18n.js', 'utf8');

const enBlockMatch = content.match(/en: \{[\s\S]*?translation: \{([\s\S]*?)\}\s*\},/);
if (enBlockMatch) {
    const enInner = enBlockMatch[1];
    const hindiRegex = /[\u0900-\u097F]/;
    const lines = enInner.split('\n');
    let hasHindi = false;
    lines.forEach((line, i) => {
        if (hindiRegex.test(line)) {
            console.log(`Hindi found at line ${i}: ${line.trim()}`);
            hasHindi = true;
        }
    });
    if (!hasHindi) console.log("No Hindi found in en block.");
} else {
    console.log("Could not find en block");
}
