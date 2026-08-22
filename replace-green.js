const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace text-[#0BDA51], bg-[#0BDA51], border-[#0BDA51] with the CSS variable equivalent
  content = content.replace(/text-\[#0BDA51\]/g, 'text-[var(--color-success)]');
  content = content.replace(/bg-\[#0BDA51\]/g, 'bg-[var(--color-success)]');
  content = content.replace(/border-\[#0BDA51\]/g, 'border-[var(--color-success)]');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed green in: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src', 'app'), processFile);
walkDir(path.join(__dirname, 'src', 'components'), processFile);
console.log('Done replacing green.');
