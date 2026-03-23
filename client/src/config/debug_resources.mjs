import fs from 'fs';
import i18n from 'i18next';

// We can't easily import the ES module i18n.js if it uses browser-only stuff like LanguageDetector
// So let's just parse it as a string to extract the resources object or use a regex to see if it's sane.

const content = fs.readFileSync('d:/mini_project/ExpertsHub V2/client/src/config/i18n.js', 'utf8');

const resourcesMatch = content.match(/const resources = (\{[\s\S]*?\});/);

if (resourcesMatch) {
  const resourcesStr = resourcesMatch[1];
  console.log('Resources string length:', resourcesStr.length);
  
  // Let's check for any weird assignments after the initial object
  const afterResources = content.substring(content.indexOf(resourcesStr) + resourcesStr.length);
  if (afterResources.includes('resources.en =')) {
    console.log('WARNING: resources.en is reassigned later in the file!');
  }
  
  // Check the first 1000 chars of resourcesStr to see 'en' block
  console.log('Start of resources object:', resourcesStr.substring(0, 500));
} else {
  console.log('Failed to match resources object');
}
