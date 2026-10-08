const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, 'src/app/admin/page.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf8');

tsx = tsx.replace(
  'Order: {c.order ?? 0}',
  'Order: {(c as any).order ?? 0}'
);

fs.writeFileSync(tsxPath, tsx);
console.log("Fixed type error!");
