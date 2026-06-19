const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/page.tsx',
  'src/app/blogs/page.tsx',
  'src/app/news/add/page.tsx',
  'src/app/blogs/add/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Hide the right column sidebars
  content = content.replace(/<div className="lg:col-span-1 flex flex-col/g, '<div className="hidden lg:col-span-1 flex-col');

  // Change grid layout to center main content
  content = content.replace(/lg:grid-cols-3 gap-8 relative z-10 max-w-\[1500px\] mx-auto/g, 'flex flex-col relative z-10 max-w-5xl mx-auto');
  content = content.replace(/lg:col-span-2 w-full flex flex-col relative/g, 'w-full flex flex-col relative');
  content = content.replace(/lg:col-span-2 flex flex-col relative w-full/g, 'w-full flex flex-col relative');

  // Hide Injector Links
  content = content.replace(/\{canAdd && \(\s*<>\s*<span className="text-stone-400">\|<\/span>\s*<Link href="\/news\/add".*?&gt; News Injector<\/Link>\s*<\/>\s*\)\}/gs, '');
  content = content.replace(/<span className="text-stone-400">\|<\/span>\s*<Link href="\/news\/add".*?&gt; News Injector<\/Link>/gs, '');
  
  content = content.replace(/\{canAdd && \(\s*<>\s*<span className="text-stone-400">\|<\/span>\s*<Link href="\/blogs\/add".*?&gt; Blog Injector<\/Link>\s*<\/>\s*\)\}/gs, '');
  content = content.replace(/<span className="text-stone-400">\|<\/span>\s*<Link href="\/blogs\/add".*?&gt; Blog Injector<\/Link>/gs, '');
  
  // Crazy Newspaper Font Enhancements
  // Replace the masthead font with UnifrakturMaguntia class
  content = content.replace(/font-playfair text-3xl sm:text-4xl font-black/g, 'font-blackletter text-4xl sm:text-5xl font-normal drop-shadow-sm');
  // Make headlines more premium
  content = content.replace(/font-playfair text-xl font-black/g, 'font-playfair text-2xl font-black italic tracking-tight');
  
  // Desaturate the loud reds per user request
  content = content.replace(/text-red-800/g, 'text-stone-900 border-b border-stone-900');
  content = content.replace(/text-red-950/g, 'text-stone-950');

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});

// Update globals.css with new font
const cssPath = path.join(__dirname, 'src/app/globals.css');
if (fs.existsSync(cssPath)) {
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  if (!cssContent.includes('UnifrakturMaguntia')) {
    cssContent = `@import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');\n` + cssContent;
    cssContent = cssContent.replace(/--font-playfair: var\(--font-playfair\);/, `--font-playfair: var(--font-playfair);\n  --font-blackletter: 'UnifrakturMaguntia', cursive;`);
    cssContent = cssContent.replace(/\.font-playfair \{/g, `.font-playfair {\n  font-family: var(--font-playfair), serif;\n}\n.font-blackletter {\n  font-family: var(--font-blackletter), serif;\n}`);
    fs.writeFileSync(cssPath, cssContent);
    console.log('Updated globals.css with UnifrakturMaguntia');
  }
}
