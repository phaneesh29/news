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

  // Hide the right column instead of deleting its JSX to avoid unbalanced tags
  content = content.replace(/lg:col-span-1 flex flex-col/g, 'hidden lg:col-span-1 flex-col');

  // Layout changes
  content = content.replace(/lg:grid-cols-3 gap-8 relative z-10 max-w-\[1500px\] mx-auto/g, 'flex flex-col relative z-10 max-w-5xl mx-auto');
  content = content.replace(/lg:col-span-2 w-full flex flex-col relative/g, 'w-full flex flex-col relative');
  content = content.replace(/lg:col-span-2 flex flex-col relative w-full/g, 'w-full flex flex-col relative');

  // Hide Injector Links
  // We'll just replace the visible link text with a hidden element or just remove it using precise replace.
  // In Dashboard and Blogs:
  content = content.replace(/<span className="text-stone-400">\|<\/span>\s*<Link href="\/news\/add".*?&gt; News Injector<\/Link>/g, '');
  content = content.replace(/<span className="text-stone-400">\|<\/span>\s*<Link href="\/blogs\/add".*?&gt; Blog Injector<\/Link>/g, '');
  
  // In News Add and Blogs Add:
  // Sometimes it's selected like border-b-2
  content = content.replace(/<span className="text-stone-400">\|<\/span>\s*<Link href="\/news\/add" className="text-red-800 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0\.5">&gt; News Injector<\/Link>/g, '');
  content = content.replace(/<span className="text-stone-400">\|<\/span>\s*<Link href="\/blogs\/add" className="text-red-800 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0\.5">&gt; Blog Injector<\/Link>/g, '');

  // UI Crazy Aesthetics Replacement!
  const colorMap = {
    'bg-[#f5f2e9]': 'bg-slate-950',
    'bg-[#fcfaf2]': 'bg-black/40 backdrop-blur-xl',
    'bg-[#e8e4d9]': 'bg-black/60',
    'bg-[#dcd7c9]': 'bg-white/5',
    'text-stone-900': 'text-slate-200',
    'text-stone-950': 'text-white',
    'text-stone-850': 'text-slate-300',
    'text-stone-800': 'text-slate-300',
    'text-stone-700': 'text-slate-400',
    'text-stone-600': 'text-slate-400',
    'text-stone-500': 'text-slate-500',
    'text-stone-400': 'text-slate-600',
    'text-stone-300': 'text-slate-700',
    'border-stone-950': 'border-red-900/50',
    'border-stone-900': 'border-red-500/50',
    'border-stone-850': 'border-slate-800',
    'border-stone-400': 'border-slate-700/50',
    'border-stone-300': 'border-white/10',
    'text-red-800': 'text-red-500 text-glow',
    'text-red-950': 'text-red-400',
    'bg-white': 'bg-black/50',
    'bg-stone-50': 'bg-white/5',
    'bg-stone-100': 'bg-white/5',
    'bg-stone-200': 'bg-white/10',
    'bg-stone-300': 'bg-white/10',
    'bg-stone-950': 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]',
    'bg-red-800': 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]',
    'bg-red-950': 'bg-red-700',
    'border-red-950': 'border-red-500',
    'border-red-850': 'border-red-500',
    'vintage-shadow-lg': 'shadow-[0_0_30px_rgba(220,38,38,0.15)] ring-1 ring-white/10',
    'vintage-shadow-sm': 'shadow-[0_0_15px_rgba(0,0,0,0.5)]',
    'shadow-\\[4px_4px_0px_#111\\]': 'shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-2xl overflow-hidden',
    'shadow-\\[8px_8px_0px_#111\\]': 'shadow-[0_0_50px_rgba(220,38,38,0.2)] ring-1 ring-red-500/30 rounded-2xl',
    'border-4 border-double': 'border border-white/10',
    'border-2 border-stone-950': 'border border-white/10 rounded-xl',
    'border-b-4 border-stone-950': 'border-b border-white/10',
    'border-t-4 border-double border-stone-950': 'border-t border-white/10',
    'font-playfair': 'font-sans tracking-tight',
    'font-serif': 'font-sans',
    'desk-mat': 'cyber-grid',
    'vintage-stamp': 'glass-btn relative overflow-hidden',
    'hover:bg-stone-50': 'hover:bg-white/10 hover:scale-[1.02] transition-transform duration-300',
    'coffee-stain -top-6 -right-6 opacity-25': 'hidden'
  };

  for (const [oldClass, newClass] of Object.entries(colorMap)) {
    const regex = new RegExp(oldClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    content = content.replace(regex, newClass);
  }

  content = content.replace('selection:bg-red-800/10 selection:text-red-950', 'selection:bg-red-500/30 selection:text-red-200');
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
