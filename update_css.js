const fs = require('fs');

const path = 'src/app/site.css';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  '#B76E79': '#d4af37', // rose-gold -> gold
  '#D4A0A7': '#e6c565', // rose-gold-light -> gold-light
  '#8E4F58': '#b59223', // rose-gold-dark -> gold-dark
  '#EEC8CC': '#f7e092', // rose-gold-xlight
  '#F9C6D0': '#111111', // soft-pink -> dark grey
  '#FFE8ED': '#222222', // soft-pink-light -> darker grey
  '#FDF5F0': '#0a0a0a', // cream -> dark background
  '#FAF8F8': '#050505', // off-white -> darkest background
  '#F2D2D8': '#1a1a1a', // blush
  'linear-gradient(135deg, #B76E79 0%, #C9878F 40%, #D4A0A7 70%, #F9C6D0 100%)': 'linear-gradient(135deg, #d4af37 0%, #e6c565 40%, #f7e092 70%, #fff6d9 100%)',
  'linear-gradient(155deg, #0F0F0F 0%, #1A1A1A 30%, #2A1820 65%, #4A2830 100%)': 'linear-gradient(155deg, #050505 0%, #0a0a0a 30%, #111111 65%, #050505 100%)',
  'linear-gradient(135deg, #1A1A1A 0%, #2C1E22 100%)': 'linear-gradient(135deg, #050505 0%, #0a0a0a 100%)',
  '#1A1A1A': '#050505',
  '#2C2C2C': '#0a0a0a',
  '#333333': '#111111',
  '#4A4A4A': '#222222'
};

for (const [find, replace] of Object.entries(replacements)) {
  content = content.split(find).join(replace);
}

fs.writeFileSync(path, content, 'utf8');
console.log('site.css colors updated');
