import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/UrbanPro V2/client/src/config/i18n.js', 'utf8');

// Extract the resources object
const resourcesMatch = content.match(/const resources = (\{[\s\S]*?\});\s+i18n/);
if (resourcesMatch) {
    const resourcesStr = resourcesMatch[1];
    // Evaluate it safely by prefixing with 'const resources = ' and removing it
    // Or just parse it if it's pure JS object literal.
    // Since it's JS (not JSON), we can use eval or a better approach.
    // I'll just check the keys and some values manually.
    
    const enBlock = resourcesStr.match(/en: \{[\s\S]*?translation: \{([\s\S]*?)\}\s*\},/);
    if (enBlock) {
        const enInner = enBlock[1];
        if (enInner.includes('वापसी पर स्वागत है')) {
            console.log("FOUND HINDI IN EN BLOCK VIA EVALUATION");
        } else {
            console.log("NO HINDI IN EN BLOCK VIA EVALUATION");
        }
        
        // Check for specific keys
        const keysToCheck = ["Browse Services", "Welcome back,", "Loyalty Points"];
        keysToCheck.forEach(key => {
            const keyRegex = new RegExp(`"${key}": "(.*?)"`);
            const valMatch = enInner.match(keyRegex);
            if (valMatch) {
                console.log(`EN ${key}: ${valMatch[1]}`);
            } else {
                console.log(`EN ${key}: NOT FOUND`);
            }
        });
    }
} else {
    console.log("Could not find resources object");
}
