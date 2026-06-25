const fs = require('fs');
let content = fs.readFileSync('D:\\news\\userApp\\client\\web\\src\\lib\\quiz-data.ts', 'utf-8');

const badPrefix = 'explanation: "The regular expression lacks a trailing anchor `export type Difficulty';
const badStartIdx = content.indexOf(badPrefix);

const closingText = '. It checks if the Origin *starts with* `https://example.com` or `https://www.example.com`. Therefore, an origin like `https://example.com.attacker.com` (which the attacker controls) perfectly matches the regex and bypasses the CORS validation."';
const badEndIdx = content.indexOf(closingText, badStartIdx);

if (badStartIdx === -1 || badEndIdx === -1) {
  console.log("Could not find the duplicated boundaries.");
  process.exit(1);
}

const correctString = 'explanation: "The regular expression lacks a trailing anchor ($)' + closingText;

let fixedContent = content.substring(0, badStartIdx) + correctString + content.substring(badEndIdx + closingText.length);

fs.writeFileSync('D:\\news\\userApp\\client\\web\\src\\lib\\quiz-data.ts', fixedContent);
console.log("Fixed the duplication!");
