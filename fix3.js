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
  
  // Find instances of \${ and replace with ${
  content = content.replace(/\`\\\$\{/g, '\`${');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
    count++;
  }
});
console.log('Total fixed:', count);
