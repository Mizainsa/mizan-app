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

function defs(bgTop, bgBottom) {
  return `<defs>
<linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bgTop}"/><stop offset="100%" stop-color="${bgBottom}"/></linearGradient>
<linearGradient id="goldw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="55%" stop-color="#E3C766"/><stop offset="100%" stop-color="#C9A227"/></linearGradient>
<clipPath id="rc"><rect x="0" y="0" width="1024" height="1024" rx="180"/></clipPath>
<clipPath id="tl"><polygon points="0,0 1024,0 0,1024"/></clipPath>
<clipPath id="br"><polygon points="1024,0 1024,1024 0,1024"/></clipPath>
</defs>`;
}

const bgs = [
  ['#0A3D26', '#0F5132'],
  ['#0F5132', '#125E3A'],
  ['#08311E', '#0A3D26'],
  ['#0A3D26', '#125E3A'],
  ['#0B4429', '#0F5132'],
];

function card(i, title, descLines) {
  const bg = bgs[i % bgs.length];
  const sz = 150 + (i % 4) * 30;
  const accent = `<polygon points="1080,${1080 - sz} 1080,1080 ${1080 - sz},1080" fill="#C9A227" opacity="0.15"/>`;
  const titleSize = title.length > 10 ? 80 : 92;
  const desc = descLines
    .map((ln, idx) => `<text x="540" y="${636 + idx * 66}" text-anchor="middle" fill="#E8F2EC" font-family="Cairo" font-weight="500" font-size="42" word-spacing="8">${ln}</text>`)
    .join('\n');
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">${defs(bg[0], bg[1])}
<rect x="0" y="0" width="1080" height="1080" fill="url(#bgg)"/>
${accent}
${icon(400, 150, 280)}
<text x="540" y="545" text-anchor="middle" fill="url(#goldw)" font-family="Cairo" font-weight="900" font-size="${titleSize}" word-spacing="10">${title}</text>
${desc}
<rect x="470" y="${descLines.length > 1 ? 786 : 720}" width="140" height="5" rx="2.5" fill="#C9A227"/>
<text x="540" y="${descLines.length > 1 ? 895 : 835}" text-anchor="middle" fill="url(#goldw)" font-family="Cairo" font-weight="900" font-size="60" word-spacing="10">ميزان</text>
</svg>`;
}

const hero = `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">${defs('#0A3D26', '#0F5132')}
<rect x="0" y="0" width="1080" height="1080" fill="url(#bgg)"/>
<polygon points="1080,860 1080,1080 860,1080" fill="#C9A227" opacity="0.15"/>
${icon(380, 170, 320)}
<text x="540" y="660" text-anchor="middle" fill="url(#goldw)" font-family="Cairo" font-weight="900" font-size="150" word-spacing="10">ميزان</text>
<text x="540" y="745" text-anchor="middle" fill="#E8F2EC" font-family="Cairo" font-weight="500" font-size="50" word-spacing="8">مساعدك الذكي المتخصّص</text>
<rect x="440" y="790" width="200" height="6" rx="3" fill="#C9A227"/>
<text x="540" y="865" text-anchor="middle" fill="#CFE3D8" font-family="Cairo" font-weight="500" font-size="38" word-spacing="8">إرشاد وتوعية بين يديك</text>
</svg>`;

const cards = [
  ['الأسرة والأحوال', ['الزواج والطلاق والحضانة', 'والنفقة — خطوة بخطوة']],
  ['العمل والأفراد', ['العقود والشكاوى العمالية', 'والتأمينات — نوضّح حقوقك']],
  ['المال والتعاملات', ['البنوك والمطالبات والتنفيذ', 'والتعثّر — إرشاد موثوق']],
  ['المساعد العدلي', ['ناجز والتوثيق والاعتراض', 'والمهل — تنقّل بثقة']],
  ['مخالفات رقمية', ['الاحتيال والابتزاز وانتحال', 'الهوية — ماذا تفعل بعد البلاغ']],
  ['الطوارئ والحوادث', ['الحوادث المرورية والمخالفات', 'والتأمين — تصرّف صحيح']],
  ['تطويرك', ['المسارات المهنية والشهادات', 'وريادة الأعمال — طوّر مستقبلك']],
  ['ميزان العام', ['نقطة انطلاقك — اسأل عن أي', 'إجراء، ونوجّهك للمختصّ']],
  ['٣٣ مختصّاً', ['في كل مجال مساعد متخصّص', 'يفهم سؤالك ويرشدك']],
  ['إرشاد فوري', ['إجابات فورية خطوة بخطوة', 'في أي وقت تحتاجها']],
  ['يفهمك بالعربية', ['تحدّث بلغتك، واحصل على', 'إرشاد واضح ومباشر']],
  ['مصادر رسمية', ['معلومات محدّثة من الجهات', 'السعودية الرسمية']],
  ['خصوصيتك أولاً', ['لا نطلب وثائقك — إرشاد', 'من نصّك فقط، بياناتك محفوظة']],
  ['جرّبه مجاناً', ['ابدأ الآن مجاناً — مساعدك', 'الذكي في جيبك']],
];

(async () => {
  if (!fs.existsSync('assets/ads')) fs.mkdirSync('assets/ads', { recursive: true });
  let n = 1;
  for (const [title, lines] of cards) {
    const svg = card(n - 1, title, lines);
    const name = 'assets/ads/ad-' + String(n).padStart(2, '0') + '.png';
    await sharp(Buffer.from(svg)).png().toFile(name);
    n++;
  }
  await sharp(Buffer.from(hero)).png().toFile('assets/ads/ad-15.png');
  console.log('تم: 15 صورة إعلانية في مجلد assets/ads (ad-01 حتى ad-15)');
})().catch((e) => {
  console.error('خطأ:', e.message);
  process.exit(1);
});
