// اختبار: تحقّق من أن gemini-embedding-001 يُرجع 768 بُعداً بالضبط
const fs = require('fs');

const EMBED_MODEL = 'gemini-embedding-001';

async function testEmbedding() {
  // قراءة مفتاح Gemini من .env
  const envContent = fs.readFileSync('.env', 'utf8');
  const geminiMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
  if (!geminiMatch) {
    console.error('❌ لا يوجد GEMINI_API_KEY في .env');
    process.exit(1);
  }
  const apiKey = geminiMatch[1].trim();

  console.log('🔍 اختبار النموذج:', EMBED_MODEL);
  console.log('📝 نصّ الاختبار: "مفهوم الضرب في الرياضيات"');

  const testText = 'مفهوم الضرب في الرياضيات';

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/' + EMBED_MODEL,
          content: { parts: [{ text: testText }] },
          outputDimensionality: 768,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ فشل الطلب:', res.status, errText);
      process.exit(1);
    }

    const data = await res.json();
    const values = data?.embedding?.values;

    if (!Array.isArray(values)) {
      console.error('❌ الردّ لا يحتوي على values صالح');
      console.log('الردّ الكامل:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ نجح توليد embedding');
    console.log('📊 عدد الأبعاد:', values.length);

    if (values.length === 768) {
      console.log('✅ ✅ ✅ تأكيد: 768 بُعداً بالضبط — جاهز للاستخدام!');
      console.log('مثال من المتجه (أول 5 قيم):', values.slice(0, 5));
    } else {
      console.error(`❌ خطأ حرج: العدد ${values.length} وليس 768!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  }
}

testEmbedding();
