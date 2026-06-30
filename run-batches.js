const jobId = '3a6aa0ed-c327-43dd-b4ed-c2bc608e21ff';
const AUTH = 'Bearer sb_publishable_YZzzqNIjBGtAbD1IZAiY-w_gO93vuH5';
const URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co/functions/v1/ingest-batch';

async function callBatch(batchNum) {
  console.log(`\n[${batchNum}/14] استدعاء الدفعة...`);

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH,
    },
    body: JSON.stringify({ jobId }),
  });

  const data = await res.json();

  if (res.status !== 200) {
    console.error('خطأ HTTP', res.status, ':', data);
    return null;
  }

  console.log('الحالة:', data.status);
  console.log('آخر صفحة:', data.last_page_done || '?');
  console.log('الدروس التراكمي:', data.lessons_created !== undefined ? data.lessons_created : '?');
  console.log('المقاطع التراكمي:', data.chunks_created !== undefined ? data.chunks_created : '?');

  return data;
}

async function runAll() {
  for (let i = 1; i <= 14; i++) {
    const result = await callBatch(i);

    if (!result) {
      console.error('\n❌ فشلت الدفعة', i);
      break;
    }

    if (result.status === 'done') {
      console.log(`\n✅ اكتملت المعالجة عند الدفعة ${i}`);
      break;
    }

    // التحقق الحرج: بعد الدفعة 2 (صفحات 11-20، تحوي صفحة 15)
    if (i === 2 && (result.lessons_created === 0 || result.lessons_created === undefined)) {
      console.error(`\n⚠️ تحذير: الدفعة 2 (صفحات 11-20) انتهت ولكن lessons_created = ${result.lessons_created}`);
      console.error('توقف للفحص - راجع سجلات الدالة (logs) للأخطاء');
      break;
    }

    // تأخير قصير بين الدفعات
    await new Promise(r => setTimeout(r, 2000));
  }
}

runAll().catch(err => console.error('خطأ:', err.message));
