const sharp = require('sharp');
const fs = require('fs');

const scaleEls = `
<circle cx="512" cy="300" r="34" stroke-width="22"/>
<line x1="512" y1="334" x2="512" y2="720" stroke-width="30"/>
<line x1="420" y1="728" x2="604" y2="728" stroke-width="34"/>
<line x1="320" y1="420" x2="704" y2="420" stroke-width="30"/>
<circle cx="512" cy="420" r="22" stroke-width="17"/>
<line x1="320" y1="420" x2="280" y2="620" stroke-width="20"/>
<line x1="320" y1="420" x2="360" y2="620" stroke-width="20"/>
<line x1="704" y1="420" x2="664" y2="620" stroke-width="20"/>
<line x1="704" y1="420" x2="744" y2="620" stroke-width="20"/>
<path d="M268 620 Q320 712 372 620" stroke-width="30"/>
<path d="M652 620 Q704 712 756 620" stroke-width="30"/>`;

function icon(x0, y0, s) {
  const k = s / 1024;
  return `<g transform="translate(${x0},${y0}) scale(${k})">
<g clip-path="url(#rc)">
<rect x="0" y="0" width="1024" height="1024" fill="#0F5132"/>
<polygon points="1024,0 1024,1024 0,1024" fill="#C9A227"/>
<g clip-path="url(#tl)" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">${scaleEls}</g>
<g clip-path="url(#br)" fill="none" stroke="#0F5132" stroke-linecap="round" stroke-linejoin="round">${scaleEls}</g>
</g>
</g>`;
}

const defs = `<defs>
<linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0A3D26"/><stop offset="100%" stop-color="#0F5132"/></linearGradient>
<linearGradient id="goldw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="55%" stop-color="#E3C766"/><stop offset="100%" stop-color="#C9A227"/></linearGradient>
<clipPath id="rc"><rect x="0" y="0" width="1024" height="1024" rx="180"/></clipPath>
<clipPath id="tl"><polygon points="0,0 1024,0 0,1024"/></clipPath>
<clipPath id="br"><polygon points="1024,0 1024,1024 0,1024"/></clipPath>
</defs>`;

const fg = `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">${defs}
<rect x="0" y="0" width="1024" height="500" fill="url(#bgg)"/>
<polygon points="1024,420 1024,500 880,500" fill="#C9A227" opacity="0.16"/>
${icon(600, 80, 340)}
<text x="300" y="232" text-anchor="middle" fill="url(#goldw)" font-family="Cairo" font-weight="900" font-size="132" word-spacing="10">ميزان</text>
<text x="300" y="322" text-anchor="middle" fill="#E8F2EC" font-family="Cairo" font-weight="500" font-size="42" word-spacing="8">مساعدك الذكي المتخصّص</text>
<rect x="210" y="354" width="180" height="6" rx="3" fill="#C9A227"/>
</svg>`;

const hz = `<svg width="1200" height="628" viewBox="0 0 1200 628" xmlns="http://www.w3.org/2000/svg">${defs}
<rect x="0" y="0" width="1200" height="628" fill="url(#bgg)"/>
<polygon points="1200,530 1200,628 1050,628" fill="#C9A227" opacity="0.16"/>
${icon(720, 114, 400)}
<text x="380" y="292" text-anchor="middle" fill="url(#goldw)" font-family="Cairo" font-weight="900" font-size="155" word-spacing="10">ميزان</text>
<text x="380" y="392" text-anchor="middle" fill="#E8F2EC" font-family="Cairo" font-weight="500" font-size="46" word-spacing="8">مساعدك الذكي المتخصّص</text>
<rect x="280" y="426" width="200" height="6" rx="3" fill="#C9A227"/>
</svg>`;

(async () => {
  if (!fs.existsSync('assets')) fs.mkdirSync('assets');
  await sharp(Buffer.from(fg)).png().toFile('assets/feature-1024x500.png');
  await sharp(Buffer.from(hz)).png().toFile('assets/banner-1200x628.png');
  console.log('تم: feature-1024x500.png و banner-1200x628.png في مجلد assets');
})().catch((e) => {
  console.error('خطأ:', e.message);
  process.exit(1);
});
