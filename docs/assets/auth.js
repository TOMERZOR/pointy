// Account pages: sign up, sign in, password reset and account management on Supabase Auth.
// Every rule that matters (one account per email, age and terms consent, users only seeing their own row)
// is enforced in the database (supabase/schema.sql); the checks here are only for a friendly UI.
(() => {
  const cfg = window.POINTY_CONFIG || {};
  const page = document.body.dataset.page || document.querySelector("[data-page]")?.dataset.page;

  const S = {
    he: {
      notReady: "החשבונות עוד לא מחוברים. נסו שוב בקרוב.",
      badEmail: "נראה שהאימייל לא תקין.",
      shortPw: "הסיסמה צריכה להכיל לפחות 10 תווים.",
      pwIsEmail: "הסיסמה לא יכולה להיות זהה לאימייל.",
      needAge: "יש לאשר שאתם בני 18 ומעלה.",
      needTerms: "יש לאשר את תנאי השימוש ומדיניות הפרטיות.",
      weak: "הסיסמה חלשה מדי. נסו סיסמה ארוכה יותר, עם מילים או תווים מגוונים.",
      tooMany: "יותר מדי ניסיונות. חכו כמה דקות ונסו שוב.",
      cantCreate: "לא הצלחנו ליצור חשבון עם האימייל הזה. אם כבר יש לכם חשבון, היכנסו או אפסו סיסמה.",
      generic: "משהו השתבש. נסו שוב בעוד רגע.",
      mailDown: "לא הצלחנו לשלוח את מייל האימות. זו תקלה אצלנו, נסו שוב בעוד כמה דקות.",
      badLogin: "האימייל או הסיסמה לא נכונים.",
      notConfirmed: "צריך לאמת את האימייל לפני הכניסה. חפשו את המייל מ־Pointy (גם בספאם).",
      resent: "שלחנו שוב. בדקו את תיבת הדואר.",
      resetSent: "אם יש חשבון עם האימייל הזה, שלחנו אליו קישור לאיפוס סיסמה.",
      pwUpdated: "הסיסמה עודכנה.",
      linkExpired: "הקישור פג תוקף או כבר נוצל. בקשו קישור חדש.",
      saved: "נשמר.",
      confirmDelete: "למחוק את החשבון לצמיתות? אי אפשר לבטל את זה.",
      deleted: "החשבון נמחק.",
      wait: s => `אפשר לשלוח שוב בעוד ${s} שניות`,
      resend: "שליחה חוזרת",
      plan: { early_access: "Free", free: "Free", pro: "Pro", max: "Max" },
      ofLeft: (used, limit) => `נשארו ${Math.max(0, limit - used)} מתוך ${limit}`,
      licensed: "פעילה", notLicensed: "לא נרכשה",
      renews: "מתחדש ב־", endsOn: "בוטל, פעיל עד ",
      freeLine: "10 שאלות בחודש, בלי כרטיס אשראי",
      price: { pro: "₪49 לחודש", max: "₪149 לחודש" },
      priceYear: { pro: "₪490 לשנה", max: "₪1,490 לשנה" },
      paySoon: "התשלומים נפתחים בקרוב. נעדכן אתכם במייל.",
      yearSoon: "החיוב השנתי עוד לא פתוח. בינתיים אפשר לבחור חיוב חודשי.",
      payFailed: "לא הצלחנו לפתוח את דף התשלום. נסו שוב.",
      paySuccess: "התשלום התקבל, תודה! זה יכול לקחת דקה עד שהמסלול יתעדכן.",
      payCancelled: "התשלום לא הושלם. לא חויבתם.",
      confirmCancel: "לבטל את המנוי? החיובים הבאים ייעצרו, והגישה תימשך עד סוף התקופה ששולמה.",
      cancelled: "המנוי בוטל. הגישה נמשכת עד סוף התקופה ששולמה.",
      alreadyOwned: "כבר יש לכם את זה.",
    },
    en: {
      notReady: "Accounts aren't connected yet. Please try again soon.",
      badEmail: "That email doesn't look right.",
      shortPw: "Use at least 10 characters.",
      pwIsEmail: "Your password can't be your email.",
      needAge: "Please confirm you are 18 or older.",
      needTerms: "Please accept the Terms of Use and Privacy Policy.",
      weak: "That password is too weak. Try a longer one with varied words or characters.",
      tooMany: "Too many attempts. Wait a few minutes and try again.",
      cantCreate: "We couldn't create an account with this email. If you already have one, sign in or reset your password.",
      generic: "Something went wrong. Please try again in a moment.",
      mailDown: "We couldn't send the verification email. That's on our side; please try again in a few minutes.",
      badLogin: "The email or password is incorrect.",
      notConfirmed: "Please verify your email before signing in. Look for the email from Pointy (check spam too).",
      resent: "Sent again. Check your inbox.",
      resetSent: "If there's an account with that email, we've sent it a password reset link.",
      pwUpdated: "Your password has been updated.",
      linkExpired: "That link has expired or was already used. Request a new one.",
      saved: "Saved.",
      confirmDelete: "Delete your account permanently? This can't be undone.",
      deleted: "Your account was deleted.",
      wait: s => `You can resend in ${s}s`,
      resend: "Resend email",
      plan: { early_access: "Free", free: "Free", pro: "Pro", max: "Max" },
      ofLeft: (used, limit) => `${Math.max(0, limit - used)} of ${limit} left`,
      licensed: "Active", notLicensed: "Not purchased",
      renews: "renews on ", endsOn: "Cancelled, active until ",
      freeLine: "10 questions a month, no credit card",
      price: { pro: "₪49/month", max: "₪149/month" },
      priceYear: { pro: "₪490/year", max: "₪1,490/year" },
      paySoon: "Payments open soon. We'll email you.",
      yearSoon: "Yearly billing isn't open yet. You can choose monthly for now.",
      payFailed: "Couldn't open the payment page. Please try again.",
      paySuccess: "Payment received, thank you! Your plan may take a minute to update.",
      payCancelled: "The payment wasn't completed. You weren't charged.",
      confirmCancel: "Cancel your subscription? Future charges stop, and you keep access until the end of the paid period.",
      cancelled: "Subscription cancelled. You keep access until the end of the paid period.",
      alreadyOwned: "You already have this.",
    }
  };
  const t = key => Pointy.t(S)[key];

  const $ = id => document.getElementById(id);
  const here = file => new URL(file, location.href).href.split("#")[0].split("?")[0];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(el, kind, text) {
    if (!el) return;
    el.className = "form-msg" + (kind ? " " + kind : "");
    el.textContent = text || "";
  }
  function invalid(input, on) {
    if (on) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }
  function busy(button, on) { if (button) button.disabled = on; }

  // Maps Supabase errors to messages that never reveal whether an email is registered.
  function explain(error) {
    const code = error?.code || "";
    const status = error?.status || 0;
    if (status === 429 || code === "over_request_rate_limit" || code === "over_email_send_rate_limit") return t("tooMany");
    if (code === "weak_password") return t("weak");
    if (code === "email_not_confirmed") return t("notConfirmed");
    if (code === "invalid_credentials") return t("badLogin");
    if (code === "otp_expired" || code === "flow_state_expired") return t("linkExpired");
    return t("generic");
  }

  // Password show/hide toggles.
  document.querySelectorAll("[data-toggle-pw]").forEach(btn => btn.addEventListener("click", () => {
    const input = $(btn.dataset.togglePw);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-pressed", String(show));
    btn.firstElementChild.className = "ph " + (show ? "ph-eye-slash" : "ph-eye");
  }));

  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    document.querySelectorAll("form button[type=submit], [data-needs-auth]").forEach(b => { b.disabled = true; });
    document.querySelectorAll(".form-msg").forEach(el => say(el, "error", t("notReady")));
    Pointy.onLang(() => document.querySelectorAll(".form-msg").forEach(el => say(el, "error", t("notReady"))));
    return;
  }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  // Errors from email links arrive in the URL fragment, e.g. #error_code=otp_expired.
  const hash = new URLSearchParams(location.hash.slice(1));
  const linkError = hash.get("error_code");
  if (linkError) history.replaceState(null, "", location.pathname + location.search);

  // Our email templates link straight to these pages with a one-time token_hash. The token is spent only
  // when this script runs, so mail scanners that merely fetch the link can't use it up first.
  const query = new URLSearchParams(location.search);
  const tokenHash = query.get("token_hash"), otpType = query.get("type");
  const verified = tokenHash && /^(email|signup|recovery|email_change)$/.test(otpType || "")
    ? sb.auth.verifyOtp({ token_hash: tokenHash, type: otpType }).then(({ error }) => {
        history.replaceState(null, "", location.pathname);
        if (error) console.warn("link verification failed:", error.code, error.message);
        return !error;
      })
    : Promise.resolve(null);

  // Resend the sign-up confirmation, with a cooldown so it can't be spammed.
  function resendButton(button, msgEl, getEmail) {
    if (!button) return;
    let timer;
    button.addEventListener("click", async () => {
      const email = getEmail();
      if (!EMAIL_RE.test(email)) return say(msgEl, "error", t("badEmail"));
      busy(button, true);
      const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: here("account.html") } });
      say(msgEl, error ? "error" : "ok", error ? explain(error) : t("resent"));
      let left = 60;
      const label = button.querySelector(".label");
      clearInterval(timer);
      timer = setInterval(() => {
        left -= 1;
        if (label) label.textContent = left > 0 ? t("wait")(left) : t("resend");
        if (left <= 0) { clearInterval(timer); busy(button, false); }
      }, 1000);
    });
  }

  // ---------- Sign up ----------
  if (page === "signup") {
    const form = $("signupForm"), email = $("email"), pw = $("password"), age = $("age"), terms = $("terms"),
          marketing = $("marketing"), msg = $("msg"), submit = $("submit");
    [email, pw].forEach(i => i.addEventListener("input", () => { invalid(i, false); say(msg); }));
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const address = email.value.trim().toLowerCase();
      if (!EMAIL_RE.test(address)) { invalid(email, true); email.focus(); return say(msg, "error", t("badEmail")); }
      if (pw.value.length < 10) { invalid(pw, true); pw.focus(); return say(msg, "error", t("shortPw")); }
      if (pw.value.trim().toLowerCase() === address) { invalid(pw, true); pw.focus(); return say(msg, "error", t("pwIsEmail")); }
      if (!age.checked) { age.focus(); return say(msg, "error", t("needAge")); }
      if (!terms.checked) { terms.focus(); return say(msg, "error", t("needTerms")); }
      busy(submit, true);
      const { error } = await sb.auth.signUp({
        email: address,
        password: pw.value,
        options: {
          emailRedirectTo: here("account.html"),
          data: { age_confirmed: true, terms_version: cfg.termsVersion, marketing_opt_in: marketing.checked, locale: Pointy.lang }
        }
      });
      busy(submit, false);
      if (error) {
        console.warn("sign-up failed:", error.status, error.code, error.message);
        if (/sending .*email/i.test(error.message || "")) return say(msg, "error", t("mailDown"));
        // A database rejection (duplicate or missing consent) and "already registered" get the same neutral answer.
        const known = ["weak_password", "over_request_rate_limit", "over_email_send_rate_limit"].includes(error.code) || error.status === 429;
        return say(msg, "error", known ? explain(error) : t("cantCreate"));
      }
      // Supabase answers the same way for new and existing addresses, so this never confirms who has an account.
      $("sentTo").textContent = address;
      form.hidden = true;
      $("checkInbox").hidden = false;
      $("checkInbox").focus();
    });
    resendButton($("resend"), $("resendMsg"), () => $("sentTo").textContent);
  }

  // ---------- Sign in + forgot password ----------
  if (page === "login") {
    sb.auth.getSession().then(({ data }) => { if (data.session) location.replace(here("account.html")); });
    const form = $("loginForm"), email = $("email"), pw = $("password"), msg = $("msg"), submit = $("submit");
    if (linkError) say(msg, "error", t("linkExpired"));
    [email, pw].forEach(i => i.addEventListener("input", () => { invalid(i, false); say(msg); $("resend").hidden = true; }));
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const address = email.value.trim().toLowerCase();
      if (!EMAIL_RE.test(address)) { invalid(email, true); email.focus(); return say(msg, "error", t("badEmail")); }
      if (!pw.value) { invalid(pw, true); pw.focus(); return say(msg, "error", t("badLogin")); }
      busy(submit, true);
      const { error } = await sb.auth.signInWithPassword({ email: address, password: pw.value });
      busy(submit, false);
      if (error) {
        say(msg, "error", explain(error));
        $("resend").hidden = error.code !== "email_not_confirmed";
        return;
      }
      location.replace(here("account.html"));
    });
    resendButton($("resend"), msg, () => email.value.trim().toLowerCase());

    const forgot = $("forgotForm"), fEmail = $("forgotEmail"), fMsg = $("forgotMsg"), fSubmit = $("forgotSubmit");
    $("showForgot").addEventListener("click", () => {
      forgot.hidden = false; form.hidden = true; fEmail.value = email.value; fEmail.focus();
    });
    $("backToLogin").addEventListener("click", () => { forgot.hidden = true; form.hidden = false; email.focus(); });
    if (location.hash === "#forgot") { forgot.hidden = false; form.hidden = true; }
    forgot.addEventListener("submit", async e => {
      e.preventDefault();
      const address = fEmail.value.trim().toLowerCase();
      if (!EMAIL_RE.test(address)) { invalid(fEmail, true); return say(fMsg, "error", t("badEmail")); }
      busy(fSubmit, true);
      const { error } = await sb.auth.resetPasswordForEmail(address, { redirectTo: here("reset.html") });
      busy(fSubmit, false);
      // Same answer whether or not the address has an account.
      if (error && (error.status === 429 || error.code === "over_email_send_rate_limit")) return say(fMsg, "error", t("tooMany"));
      say(fMsg, "ok", t("resetSent"));
    });
  }

  // ---------- Choose a new password (from the reset email) ----------
  if (page === "reset") {
    const form = $("resetForm"), pw = $("password"), msg = $("msg"), submit = $("submit");
    if (linkError) { say(msg, "error", t("linkExpired")); busy(submit, true); }
    verified.then(ok => { if (ok === false) { say(msg, "error", t("linkExpired")); busy(submit, true); } });
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (pw.value.length < 10) { invalid(pw, true); return say(msg, "error", t("shortPw")); }
      const { data } = await sb.auth.getSession();
      if (!data.session) return say(msg, "error", t("linkExpired"));
      busy(submit, true);
      const { error } = await sb.auth.updateUser({ password: pw.value });
      busy(submit, false);
      if (error) return say(msg, "error", explain(error));
      say(msg, "ok", t("pwUpdated"));
      setTimeout(() => location.replace(here("account.html")), 1200);
    });
  }

  // ---------- Account ----------
  if (page === "account") {
    const msg = $("msg");
    (async () => {
      const linkOk = await verified;
      if (linkError || linkOk === false) {
        // The link may have been used already; if the email is verified, signing in still works.
        const { data } = await sb.auth.getSession();
        if (!data.session) { $("signedOut").hidden = false; return say($("outMsg"), "error", t("linkExpired")); }
      }
      const { data } = await sb.auth.getSession();
      const user = data.session?.user;
      if (!user) { $("signedOut").hidden = false; return; }
      $("signedIn").hidden = false;
      $("acctEmail").textContent = $("acctEmail2").textContent = user.email;
      $("acctInitial").textContent = (user.email || "?")[0].toUpperCase();
      const { data: profile, error } = await sb.from("profiles")
        .select("plan, marketing_opt_in, created_at").eq("id", user.id).single();
      if (error || !profile) return say(msg, "error", t("generic"));

      const payment = new URLSearchParams(location.search).get("payment");
      if (payment === "success") say($("payMsg"), "ok", t("paySuccess"));
      if (payment === "failed") say($("payMsg"), "error", t("payCancelled"));

      // Plan and quota come from the server. Before the quota tables existed, fall back to the free plan.
      const { data: q } = await sb.rpc("my_quota");
      const quota = q || { plan: "free", used_day: 0, limit_day: 3, used_month: 0, limit_month: 10, byok_licensed: false };
      const paid = quota.plan === "pro" || quota.plan === "max";
      const date = d => new Date(d).toLocaleDateString(Pointy.lang === "he" ? "he-IL" : "en-US", { year: "numeric", month: "long", day: "numeric" });
      const fill = (bar, used, limit) => {
        const share = limit > 0 ? Math.min(1, used / limit) : 1;
        bar.style.setProperty("--fill", String(share));
        bar.classList.toggle("full", share >= 1);
      };
      const render = () => {
        const name = t("plan")[quota.plan] || quota.plan;
        $("acctPlan").textContent = $("acctPlanBadge").textContent = name;
        $("acctPlanBadge").dataset.plan = quota.plan;
        $("acctPlanLine").textContent = !paid ? t("freeLine")
          : quota.cancelled ? t("endsOn") + date(quota.paid_until)
          : `${t(quota.period === "year" ? "priceYear" : "price")[quota.plan]} · ${t("renews")}${date(quota.paid_until)}`;
        $("acctToday").textContent = t("ofLeft")(quota.used_day, quota.limit_day);
        $("acctMonth").textContent = t("ofLeft")(quota.used_month, quota.limit_month);
        $("acctDev").textContent = quota.byok_licensed ? t("licensed") : t("notLicensed");
        $("acctSince").textContent = date(profile.created_at);
      };
      fill($("barToday"), quota.used_day, quota.limit_day);
      fill($("barMonth"), quota.used_month, quota.limit_month);
      $("payFailed").hidden = !(paid && quota.payment_failed);
      $("devActive").hidden = !quota.byok_licensed;
      $("devInactive").hidden = !!quota.byok_licensed;
      render();
      Pointy.onLang(render);

      // Buying: the server sets the price and returns a PayPlus payment page.
      const buy = $("buy");
      buy.querySelectorAll("[data-plan]").forEach(btn => {
        btn.hidden = (btn.dataset.plan === "developer" && quota.byok_licensed)
          || (btn.dataset.plan !== "developer" && paid && !quota.cancelled);
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          const period = btn.dataset.plan === "developer" ? "month" : $("upgrade").dataset.period === "year" ? "year" : "month";
          const { data: s } = await sb.auth.getSession();
          const res = await fetch(`${cfg.supabaseUrl}/functions/v1/payplus-checkout`, {
            method: "POST",
            headers: { "content-type": "application/json", apikey: cfg.supabaseAnonKey, authorization: `Bearer ${s.session?.access_token}` },
            body: JSON.stringify({ plan: btn.dataset.plan, period })
          }).catch(() => null);
          const body = res ? await res.json().catch(() => ({})) : {};
          // Only ever leave the site for PayPlus's own payment pages.
          const payUrl = (() => { try { return new URL(body.url); } catch { return null; } })();
          // A server that doesn't know yearly billing yet would open a monthly page; never send a yearly buyer there.
          const periodOk = period === "month" || body.period === "year";
          if (res?.ok && periodOk && payUrl?.protocol === "https:" && /(^|\.)payplus\.co\.il$/.test(payUrl.hostname)) return location.assign(payUrl.href);
          btn.disabled = false;
          const type = body?.error?.type;
          say($("payMsg"), "error", type === "payments_closed" || !res ? t("paySoon")
            : res.ok && !periodOk ? t("yearSoon")
            : type === "already_licensed" || type === "already_subscribed" ? t("alreadyOwned")
            : t("payFailed") + (body?.error?.payplus ? ` (PayPlus: ${body.error.payplus})` : ""));
          $("payMsg").scrollIntoView({ block: "center" });
        });
      });
      const anyToBuy = [...buy.querySelectorAll("[data-plan]")].some(b => !b.hidden);
      $("upgrade").hidden = !anyToBuy;
      $("upgradeLink").hidden = !anyToBuy || (paid && !quota.cancelled);

      const cancel = $("cancelSub");
      cancel.hidden = !(paid && !quota.cancelled);
      cancel.addEventListener("click", async () => {
        if (!window.confirm(t("confirmCancel"))) return;
        busy(cancel, true);
        const { data: s } = await sb.auth.getSession();
        const res = await fetch(`${cfg.supabaseUrl}/functions/v1/payplus-cancel`, {
          method: "POST",
          headers: { "content-type": "application/json", apikey: cfg.supabaseAnonKey, authorization: `Bearer ${s.session?.access_token}` },
          body: "{}"
        }).catch(() => null);
        busy(cancel, false);
        if (!res?.ok) return say($("payMsg"), "error", t("generic"));
        cancel.hidden = true;
        quota.cancelled = true;
        render();
        say($("payMsg"), "ok", t("cancelled"));
      });

      const marketing = $("marketing");
      marketing.checked = !!profile.marketing_opt_in;
      marketing.addEventListener("change", async () => {
        marketing.disabled = true;
        const { error } = await sb.from("profiles").update({ marketing_opt_in: marketing.checked }).eq("id", user.id);
        marketing.disabled = false;
        if (error) { marketing.checked = !marketing.checked; return say(msg, "error", t("generic")); }
        say(msg, "ok", t("saved"));
      });
    })();

    $("signOut").addEventListener("click", async () => {
      await sb.auth.signOut();
      location.replace(here("./"));
    });
    $("deleteAccount").addEventListener("click", async () => {
      if (!window.confirm(t("confirmDelete"))) return;
      busy($("deleteAccount"), true);
      const { error } = await sb.rpc("delete_my_account");
      if (error) { busy($("deleteAccount"), false); return say(msg, "error", t("generic")); }
      await sb.auth.signOut();
      Pointy.toast(t("deleted"));
      setTimeout(() => location.replace(here("./")), 1200);
    });
  }
})();
