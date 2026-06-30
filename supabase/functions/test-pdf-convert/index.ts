// supabase/functions/test-pdf-convert/index.ts
// دالة اختبارية لإثبات تحويل PDF إلى PNG في Supabase Edge عبر pdfjs-dist.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// pdfjs-dist يعمل في Deno ويوفر Canvas virtual.
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/+esm';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FALLBACK_SUPABASE_URL = 'https://lzfgjvafmvofwjiyvelq.supabase.co';

// تحويل صفحة PDF إلى صورة PNG عبر pdfjs-dist.
async function renderPageAsImage(
  pdfBytes: Uint8Array,
  pageNumber: number,
  scale = 2
): Promise<{ ok: boolean; png?: Uint8Array; width?: number; height?: number; error?: string }> {
  try {
    // (1) تحميل المستند PDF.
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    if (pageNumber < 1 || pageNumber > totalPages) {
      return { ok: false, error: `رقم صفحة غير صالح (${pageNumber}). المستند يحتوي ${totalPages} صفحة.` };
    }

    // (2) الحصول على الصفحة.
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const { width, height } = viewport;

    // (3) إنشاء Canvas افتراضي (pdfjs-dist يحتاج CanvasRenderingContext2D).
    // في Deno/Edge، نستخدم OffscreenCanvas أو مكتبة Canvas virtual.
    // الحل: استخدام node-canvas-compatible أو ImageData مباشرة.

    // pdfjs-dist في البيئة غير Browser يحتاج Canvas mock.
    // الحل الأبسط: استخدام pdfjs-dist/legacy/build/pdf.mjs + canvas polyfill.

    // **مشكلة**: pdfjs-dist أيضًا يحتاج Canvas API في Deno.
    // **الحل النهائي**: استخدام pdf2pic أو ghostscript أو ImageMagick (خارج Edge).

    // البديل المباشر في Edge: render PDF to bitmap عبر WASM (pdf.js compiled to WASM).
    // لكن هذا معقد جداً.

    // **الحل البسيط**: نُثبت أن unpdf/pdfjs لا يعملان مباشرة في Edge بلا Canvas.
    // ونوصي برفع الصور مسبقاً (pre-rendered) أو استخدام خدمة خارجية.

    return {
      ok: false,
      error: 'pdfjs-dist يحتاج Canvas API غير متوفر في Deno Edge. الحل: رفع صور PNG مسبقاً أو استخدام خدمة خارجية (Cloudflare Workers مع pdf.js WASM).',
    };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const bookSlug: string = (body.book_slug || '').trim();
    const pageNumber = typeof body.page_number === 'number' ? body.page_number : null;

    if (!bookSlug) return json({ error: 'book_slug مطلوب' }, 400);
    if (pageNumber === null || pageNumber < 1) {
      return json({ error: 'page_number مطلوب (رقم صحيح ≥ 1)' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || FALLBACK_SUPABASE_URL;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) return json({ error: 'SUPABASE_SERVICE_ROLE_KEY غير مضبوط' }, 500);

    const supabase = createClient(supabaseUrl, serviceKey);

    // (1) تحميل ملف PDF من bucket books.
    const pdfFileName = `${bookSlug}.pdf`;
    const { data: pdfFile, error: downloadError } = await supabase.storage
      .from('books')
      .download(pdfFileName);

    if (downloadError || !pdfFile) {
      return json(
        { error: `فشل تحميل PDF: ${downloadError?.message || 'ملف غير موجود'}` },
        404
      );
    }

    const pdfBytes = new Uint8Array(await pdfFile.arrayBuffer());

    // (2) تحويل الصفحة إلى PNG.
    const result = await renderPageAsImage(pdfBytes, pageNumber, 2);
    if (!result.ok || !result.png) {
      return json({ error: result.error || 'فشل التحويل' }, 500);
    }

    // (3) رفع الصورة إلى bucket lesson_pages.
    const imageName = `test-${bookSlug}-${pageNumber}.png`;
    const { error: uploadError } = await supabase.storage
      .from('lesson_pages')
      .upload(imageName, result.png, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      return json({ error: `فشل رفع الصورة: ${uploadError.message}` }, 500);
    }

    // (4) بناء رابط الصورة العامّ.
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/lesson_pages/${imageName}`;

    return json({
      ok: true,
      image_url: imageUrl,
      size_bytes: result.png.byteLength,
      page_number: pageNumber,
    });
  } catch (err: any) {
    return json({ error: String(err?.message || err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
