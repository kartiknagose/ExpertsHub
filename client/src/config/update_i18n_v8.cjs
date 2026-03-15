const fs = require('fs');
const targetFile = 'd:/mini_project/UrbanPro V2/client/src/config/i18n.js';
let content = fs.readFileSync(targetFile, 'utf8');

const enKeys = `      "ALL": "All",
      "CONFIRMED": "Confirmed"`;

const hiKeys = `      "ALL": "सभी",
      "CONFIRMED": "पुष्टि की गई"`;

let newContent = content.replace('      // Additional Worker Keys', enKeys + ',\n      // Additional Worker Keys');
newContent = newContent.replace('      // Additional Worker Keys', hiKeys + ',\n      // Additional Worker Keys');

fs.writeFileSync(targetFile, newContent);
console.log('Successfully updated i18n.js with ALL and CONFIRMED keys');
