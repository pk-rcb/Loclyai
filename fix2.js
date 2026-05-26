const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Find strings like: '${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/some/path'
  // And replace the surrounding single quotes with backticks.
  content = content.replace(/'\$\{import\.meta\.env\.VITE_API_URL \? import\.meta\.env\.VITE_API_URL\.replace\('\/api', ''\) : 'http:\/\/localhost:5000'\}([^']*)'/g, "`\\${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}$1`");

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
    count++;
  }
});
console.log('Total fixed:', count);
