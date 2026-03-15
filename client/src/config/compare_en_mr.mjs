import fs from 'fs';

const content = fs.readFileSync('d:/mini_project/UrbanPro V2/client/src/config/i18n.js', 'utf8');

const match = content.match(/const resources = (\{[\s\S]*?\});/);
if (match) {
    const resourcesStr = match[1];
    
    // I'll use a safer way to extract the blocks than eval for now
    function extractBlock(lang) {
        const startIdx = resourcesStr.indexOf(`${lang}: {`);
        if (startIdx === -1) return null;
        
        let braceCount = 0;
        let endIdx = -1;
        for (let i = startIdx + lang.length + 2; i < resourcesStr.length; i++) {
            if (resourcesStr[i] === '{') braceCount++;
            if (resourcesStr[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
        }
        return resourcesStr.substring(startIdx, endIdx);
    }

    const enBlock = extractBlock('en');
    const mrBlock = extractBlock('mr');

    console.log('EN block sample:', enBlock?.substring(0, 200));
    console.log('MR block sample:', mrBlock?.substring(0, 200));

    // Check if "Home" key is correct in both
    const enHome = enBlock?.match(/"Home": "(.*?)"/);
    const mrHome = mrBlock?.match(/"Home": "(.*?)"/);

    console.log('EN Home:', enHome ? enHome[1] : 'NOT FOUND');
    console.log('MR Home:', mrHome ? mrHome[1] : 'NOT FOUND');
}
