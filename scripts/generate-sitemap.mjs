import { writeFileSync } from 'node:fs';
import { BOOKS } from '../src/data/books.js';

const SITE = 'https://dope-bible.vercel.app';
const pages = ['/', '/bible', '/search', '/reading-plans', '/install', '/about', '/privacy', '/terms', '/licenses', '/contact'];
const urls = [...pages];
for (const b of BOOKS) {
  urls.push(`/bible/${b.id}`);
  for (let c = 1; c <= b.chapters; c++) urls.push(`/bible/${b.id}/${c}`);
}
const today = new Date().toISOString().slice(0, 10);
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`;
writeFileSync('public/sitemap.xml', xml);
console.log(`sitemap.xml: ${urls.length} URLs`);