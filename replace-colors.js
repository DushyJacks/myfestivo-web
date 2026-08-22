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

  // text-white -> text-[var(--color-text)]
  content = content.replace(/text-white(?!\/)/g, 'text-[var(--color-text)]');
  
  // text-white/90 -> text-[var(--color-text)]
  content = content.replace(/text-white\/90/g, 'text-[var(--color-text)]');
  content = content.replace(/text-white\/80/g, 'text-[var(--color-text)]');
  
  // text-white/70, 60, 50 -> text-[var(--color-text-muted)]
  content = content.replace(/text-white\/70/g, 'text-[var(--color-text-muted)]');
  content = content.replace(/text-white\/60/g, 'text-[var(--color-text-muted)]');
  content = content.replace(/text-white\/50/g, 'text-[var(--color-text-muted)]');

  // text-white/40, 30, 20, 10 -> text-[var(--color-text-faint)]
  content = content.replace(/text-white\/40/g, 'text-[var(--color-text-faint)]');
  content = content.replace(/text-white\/30/g, 'text-[var(--color-text-faint)]');
  content = content.replace(/text-white\/20/g, 'text-[var(--color-text-faint)]');
  content = content.replace(/text-white\/10/g, 'text-[var(--color-text-faint)]');
  content = content.replace(/text-white\/5/g, 'text-[var(--color-text-faint)]');

  // border-white/[0.08], border-white/10, etc -> border-[var(--color-border)]
  content = content.replace(/border-white\/\[0\.0[0-9]+\]/g, 'border-[var(--color-border)]');
  content = content.replace(/border-white\/\[0\.[1-9]+\]/g, 'border-[var(--color-border-muted)]');
  content = content.replace(/border-white\/10/g, 'border-[var(--color-border)]');
  content = content.replace(/border-white\/20/g, 'border-[var(--color-border)]');
  content = content.replace(/border-white\/30/g, 'border-[var(--color-border-focus)]');
  content = content.replace(/border-white\/40/g, 'border-[var(--color-border-focus)]');
  content = content.replace(/border-white\/50/g, 'border-[var(--color-border-focus)]');
  content = content.replace(/border-white(?!\/)/g, 'border-[var(--color-border-focus)]');

  // bg-white/[0.03], bg-white/[0.02], etc -> bg-[var(--color-surface-2)]
  content = content.replace(/bg-white\/\[0\.0[0-3]\]/g, 'bg-[var(--color-surface-2)]');
  content = content.replace(/bg-white\/\[0\.0[4-9]\]/g, 'bg-[var(--color-surface-3)]');
  content = content.replace(/bg-white\/5(?!\d)/g, 'bg-[var(--color-surface-2)]');
  content = content.replace(/bg-white\/10/g, 'bg-[var(--color-surface-3)]');
  content = content.replace(/bg-white\/20/g, 'bg-[var(--color-accent-low)]');

  // bg-black fixes for elements (not backdrops)
  content = content.replace(/bg-black(?!\/)/g, 'bg-[var(--color-surface-2)]');
  content = content.replace(/bg-black\/90/g, 'bg-[var(--color-surface)] shadow-lg');
  content = content.replace(/bg-black\/60 backdrop-blur/g, 'bg-[var(--color-surface)]/60 backdrop-blur');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src', 'app'), processFile);
walkDir(path.join(__dirname, 'src', 'components'), processFile);
console.log('Done replacing colors in all files.');
