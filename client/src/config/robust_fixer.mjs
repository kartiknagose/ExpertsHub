import fs from 'fs';

const content = fs.readFileSync('d:/mini_project/UrbanPro V2/client/src/config/i18n.js', 'utf8');

const langs = ['en', 'hi', 'mr', 'ta', 'te'];
const resources = {};

langs.forEach(lang => {
    resources[lang] = {};
    const startStr = `${lang}: {`;
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) return;
    
    // Find end of block (naive brace counting)
    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx + startStr.length; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') {
            if (braceCount === 0) {
                endIdx = i + 1;
                break;
            }
            braceCount--;
        }
    }
    
    if (endIdx === -1) return;
    const block = content.substring(startIdx, endIdx);
    
    // Extract all pairs
    const pairRegex = /"([^"]+)"\s*:\s*"([^"]*)"/g;
    let match;
    while ((match = pairRegex.exec(block)) !== null) {
        let key = match[1].trim();
        let val = match[2].trim();
        
        // Clean value: remove everything after many spaces
        val = val.split(/ {2,}/)[0];
        
        // Skip keys that look like comments or weird stuff
        if (key.startsWith('//')) continue;
        
        // For EN, skip if value contains Hindi/Devanagari
        if (lang === 'en' && /[\u0900-\u097F]/.test(val)) {
            continue;
        }

        // Keep the first (or best) value. In EN, we prefer val == key
        if (!resources[lang][key] || (lang === 'en' && val === key)) {
            resources[lang][key] = val;
        }
    }
});

// For EN, ensure every key has its own value if it's missing or was skipped
Object.keys(resources['en']).forEach(key => {
    // Already filled or standardized
});

// Print some stats
langs.forEach(l => {
    console.log(`${l} keys: ${Object.keys(resources[l]).length}`);
});

console.log('EN Home:', resources['en']['Home']);
console.log('EN Login:', resources['en']['Login']);
console.log('MR Home:', resources['mr']['Home']);
console.log('MR Login:', resources['mr']['Login']);

// Reconstruct the file
let newContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
`;

langs.forEach(lang => {
    newContent += `  ${lang}: {\n    translation: {\n`;
    const keys = Object.keys(resources[lang]).sort();
    keys.forEach((key, idx) => {
        newContent += `      ${JSON.stringify(key)}: ${JSON.stringify(resources[lang][key])}${idx === keys.length - 1 ? '' : ','}\n`;
    });
    newContent += `    }\n  }${lang === 'te' ? '' : ','}\n`;
});

newContent += `};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
`;

fs.writeFileSync('d:/mini_project/UrbanPro V2/client/src/config/i18n.fixed.js', newContent);
console.log('Wrote i18n.fixed.js');
