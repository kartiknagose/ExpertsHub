const fs = require('fs');
const targetFile = 'd:/mini_project/ExpertsHub V2/client/src/config/i18n.js';
let content = fs.readFileSync(targetFile, 'utf8');

const enKeys = `      "Total Jobs": "Total Jobs",
      "Active Jobs": "Active Jobs"`;

const hiKeys = `      "Total Jobs": "कुल कार्य",
      "Active Jobs": "सक्रिय कार्य"`;

let newContent = content.replace('      // Additional Worker Keys', enKeys + ',\n      // Additional Worker Keys');
newContent = newContent.replace('      // Additional Worker Keys', hiKeys + ',\n      // Additional Worker Keys');

fs.writeFileSync(targetFile, newContent);
console.log('Successfully updated i18n.js with WorkerBookingsPage keys');
