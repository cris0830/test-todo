// Supabase Auth 헬퍼 함수
// window.supabaseAuth로 노출

const supabaseAuth = {
  async signUp(email, password) {
    const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    const { error } = await window.supabaseClient.auth.signOut();
    return { error };
  },

  async signInWithGoogle() {
    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { data, error };
  },
};

window.supabaseAuth = supabaseAuth;
