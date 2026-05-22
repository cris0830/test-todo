// Supabase 브라우저 클라이언트
// window.supabase는 CDN으로 로드된 @supabase/supabase-js UMD 빌드에서 제공됩니다.

const SUPABASE_URL = 'https://qozrxkfviuochlhpcnvk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9CGHy2lfuXlQAkoR_azH4g_IahNSwWa';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

window.supabaseClient = supabase;
