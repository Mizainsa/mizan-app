// supabase/functions/youtube-search/index.ts
// تستقبل { query }، تبحث في YouTube Data API، وتُرجع { videoId }.
// بيئة: Supabase Edge Functions (Deno). جاهز للـDeploy.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || !String(query).trim()) {
      return json({ error: 'query مطلوب' }, 400);
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      return json({ error: 'مفتاح يوتيوب غير مضبوط في الخادم' }, 500);
    }

    // بحث يوتيوب: فيديو واحد، آمن للأطفال، عربي، تعليمي.
    const params = new URLSearchParams({
      part: 'snippet',
      q: String(query) + ' شرح تعليمي للأطفال',
      type: 'video',
      maxResults: '1',
      safeSearch: 'strict',          // فلترة المحتوى غير المناسب
      relevanceLanguage: 'ar',        // تفضيل العربية
      videoEmbeddable: 'true',        // قابل للتضمين فقط (مهمّ للمشغّل)
      key: apiKey,
    });

    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      return json({ error: 'فشل بحث يوتيوب: ' + errText }, 502);
    }

    const ytData = await ytRes.json();
    const videoId = ytData?.items?.[0]?.id?.videoId || null;

    if (!videoId) {
      return json({ videoId: null, message: 'لم يُعثر على فيديو مناسب' });
    }

    return json({ videoId });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
