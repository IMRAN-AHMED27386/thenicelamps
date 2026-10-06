const fs = require('fs');

const path = 'src/app/store.css';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  '#e88': '#d4af37', // red/pink to gold
  '#f5a3a3': '#e6c565',
  '#F5C518': '#d4af37',
  '#FFD700': '#e6c565',
  '#81C784': '#e6c565',
  '#241419': '#050505',
  '#180e11': '#0a0a0a',
  'linear-gradient(160deg, #241419, #180e11)': 'linear-gradient(160deg, #050505, #0a0a0a)'
};

for (const [find, replace] of Object.entries(replacements)) {
  content = content.split(find).join(replace);
}

fs.writeFileSync(path, content, 'utf8');
console.log('store.css colors updated');
