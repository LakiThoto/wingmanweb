#!/usr/bin/env node
/**
 * GitHub Pages lives at https://<user>.github.io/<repo>/ — patch absolute paths in dist.
 */
import { copyFileSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.GH_PAGES_BASE || '/wingmanweb/';
const dist = 'dist';

function patchFile(filePath) {
  if (!/\.(js|html|css|json)$/i.test(filePath)) return;
  let s = readFileSync(filePath, 'utf8');
  const orig = s;
  // Root-absolute app paths only (not https:// or //)
  s = s.replace(/"\/(assets|mock|audio|icons)\//g, `"${base}$1/`);
  s = s.replace(/'\/(assets|mock|audio|icons)\//g, `'${base}$1/`);
  if (s !== orig) writeFileSync(filePath, s);
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else patchFile(p);
  }
}

walk(dist);
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
console.log(`gh-pages postbuild: base=${base}, wrote 404.html`);
