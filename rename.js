const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const initial = content;
  
  content = content.replace(/AidaVibes/g, 'TheNiceLamps');
  content = content.replace(/aidavibes/g, 'thenicelamps');
  content = content.replace(/AIDA VIBES/g, 'THENICELAMPS');
  
  if (content !== initial) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
