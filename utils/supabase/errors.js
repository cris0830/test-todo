// 한국어 Supabase 오류 메시지 매핑
// window.supabaseErrors로 노출

const ERROR_MAP = [
  { match: "Invalid login credentials",               msg: "이메일 또는 비밀번호가 올바르지 않습니다." },
  { match: "Email not confirmed",                     msg: "이메일 인증이 필요합니다. 받은편지함을 확인해 주세요." },
  { match: "User already registered",                 msg: "이미 가입된 이메일입니다." },
  { match: "already registered",                      msg: "이미 가입된 이메일입니다." },
  { match: "Password should be at least 6",          msg: "비밀번호는 6자 이상이어야 합니다." },
  { match: "Unable to validate email address",       msg: "올바른 이메일 형식이 아닙니다." },
  { match: "invalid format",                          msg: "올바른 이메일 형식이 아닙니다." },
  { match: "signup is disabled",                      msg: "현재 회원가입이 비활성화되어 있습니다." },
  { match: "Signups not allowed",                     msg: "현재 회원가입이 비활성화되어 있습니다." },
  { match: "Email rate limit exceeded",               msg: "너무 많은 요청입니다. 잠시 후 다시 시도해 주세요." },
  { match: "over_email_send_rate_limit",              msg: "이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요." },
  { match: "For security purposes",                   msg: "보안을 위해 잠시 후 다시 시도해 주세요." },
  { match: "Failed to fetch",                         msg: "네트워크 오류가 발생했습니다. 연결을 확인해 주세요." },
  { match: "NetworkError",                            msg: "네트워크 오류가 발생했습니다. 연결을 확인해 주세요." },
];

const supabaseErrors = {
  getKoreanError(error) {
    if (!error) return "알 수 없는 오류가 발생했습니다.";
    const msg = (error.message || String(error)).trim();
    for (const { match, msg: korean } of ERROR_MAP) {
      if (msg.includes(match)) return korean;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "네트워크 오류가 발생했습니다. 연결을 확인해 주세요.";
    }
    return "오류가 발생했습니다. 다시 시도해 주세요.";
  }
};

window.supabaseErrors = supabaseErrors;
