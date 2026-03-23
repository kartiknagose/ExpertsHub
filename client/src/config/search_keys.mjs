import fs from 'fs';
const content = fs.readFileSync('d:/mini_project/ExpertsHub V2/client/src/config/i18n.js', 'utf8');
const lines = content.split('\n');

const searchKeys = ["Browse Services", "Loyalty Points", "Welcome back,"];

lines.forEach((line, i) => {
    searchKeys.forEach(key => {
        if (line.includes(`"${key}":`)) {
            console.log(`${i + 1}: ${line.trim()}`);
        }
    });
});
