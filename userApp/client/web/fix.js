const fs = require('fs');
const quizDataPath = "D:\\news\\userApp\\client\\web\\src\\lib\\quiz-data.ts";
let content = fs.readFileSync(quizDataPath, 'utf-8');

const badStart = "    [filtered[i], filtered[j]] = [filtered[j], filtered[i],";
const badStartIdx = content.indexOf(badStart);
const badEndIdx = content.lastIndexOf("  }];");

if (badStartIdx === -1 || badEndIdx === -1) {
  console.log("Could not find breakpoints.");
  process.exit(1);
}

let injected = content.substring(badStartIdx + badStart.length, badEndIdx + 3); 
// `injected` will start with `\n  {\n` and end with `  }`.
// Wait, `badEndIdx + 3` includes `  }`.

// Let's refine `injected`.
// The injected text started right after `[filtered[j], filtered[i],`
// So it starts with `\n  {\n    id: ...`
// And ends right before `];`
let injectedQuestions = content.substring(badStartIdx + badStart.length, badEndIdx + 3);

let cleanedContent = content.substring(0, badStartIdx) + 
                     "    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];" + 
                     content.substring(badEndIdx + 5);

const insertTarget = "\n];\n\nexport const getRandomQuestions";
if (cleanedContent.indexOf(insertTarget) === -1) {
  console.log("Could not find insert target.");
  process.exit(1);
}

cleanedContent = cleanedContent.replace(insertTarget, injectedQuestions + insertTarget);

fs.writeFileSync(quizDataPath, cleanedContent);
console.log("Fixed quiz-data.ts");
