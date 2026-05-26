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

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;

  // api.js replacement
  if (content.includes("'http://localhost:5000/api'")) {
    content = content.replace(/'http:\/\/localhost:5000\/api'/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000/api')");
    modified = true;
  }

  // Template string base replacement
  if (content.includes("http://localhost:5000")) {
    content = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
