import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/ExpertsHub V2/client/src/config/i18n.js', 'utf8');
const lines = content.split('\n');

const searchKeys = ["Browse Services", "Loyalty Points", "Welcome back,"];
let results = "";

lines.forEach((line, i) => {
    searchKeys.forEach(key => {
        if (line.includes(`"${key}":`)) {
            results += `${i + 1}: ${line.trim()}\n`;
        }
    });
});

fs.writeFileSync('d:/mini_project/ExpertsHub V2/client/src/config/search_results.txt', results);
