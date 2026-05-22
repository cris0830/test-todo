// Supabase 브라우저 클라이언트
// window.supabase는 CDN으로 로드된 @supabase/supabase-js UMD 빌드에서 제공됩니다.

const SUPABASE_URL = 'https://qozrxkfviuochlhpcnvk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9CGHy2lfuXlQAkoR_azH4g_IahNSwWa';

try {
  const _supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  window.supabaseClient = _supabaseInstance;
  console.log('[client.js] supabaseClient 초기화 성공:', typeof window.supabaseClient);
} catch (e) {
  console.error('[client.js] supabaseClient 초기화 실패:', e.message, e);
}
