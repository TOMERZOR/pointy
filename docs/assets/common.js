// Shared by every page: language switch, toast, scroll reveals.
(() => {
  // Our pages hold sign-in forms, so refuse to be framed by another site (GitHub Pages can't send frame-ancestors).
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch { document.documentElement.hidden = true; }
  }

  // An email link that Supabase sent to the wrong page (e.g. the home page, when a redirect URL isn't
  // allow-listed) still carries the sign-in in the URL. Hand it to the page that can finish it.
  const linkHash = new URLSearchParams(location.hash.slice(1));
  const linkCode = new URLSearchParams(location.search).get("code");
  const onAuthPage = /\/(account|reset)\.html$/.test(location.pathname);
  if (!onAuthPage && (linkHash.has("access_token") || linkHash.has("error_code") || linkCode)) {
    const target = linkHash.get("type") === "recovery" ? "reset.html" : "account.html";
    location.replace(new URL(target, location.href).pathname + location.search + location.hash);
    return;
  }

  const root = document.documentElement;
  const listeners = [];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    remove(k) { try { localStorage.removeItem(k); } catch {} }
  };

  // Campaign tags (?utm_source=meta&...) on any page are kept for 30 days and sent with the sign-up,
  // so we know which channel brought each account. The app opens the sign-up page in a new tab, so
  // sessionStorage wouldn't survive the download. Nothing leaves the browser before sign-up.
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  const UTM_DAYS = 30;
  const landed = new URLSearchParams(location.search);
  if (UTM_KEYS.some(k => landed.get(k))) {
    const tags = { at: Date.now() };
    UTM_KEYS.forEach(k => { const v = (landed.get(k) || "").trim().slice(0, 100); if (v) tags[k] = v; });
    store.set("pointy-utm", JSON.stringify(tags));
  }
  function utm() {
    try {
      const tags = JSON.parse(store.get("pointy-utm") || "null");
      if (tags && Date.now() - tags.at < UTM_DAYS * 864e5) {
        return Object.fromEntries(UTM_KEYS.filter(k => typeof tags[k] === "string").map(k => [k, tags[k]]));
      }
    } catch {}
    store.remove("pointy-utm");
    return {};
  }

  // Language: ?lang=en wins (for English ads), then the saved choice, then Hebrew.
  const param = new URLSearchParams(location.search).get("lang");
  let lang = param || store.get("pointy-lang") || "he";
  if (!/^(he|en)$/.test(lang)) lang = "he";

  function applyLang(l) {
    lang = l;
    root.dataset.lang = l;
    root.lang = l;
    root.dir = l === "he" ? "rtl" : "ltr";
    const title = root.dataset["title" + (l === "he" ? "He" : "En")];
    if (title) document.title = title;
    listeners.forEach(fn => fn(l));
  }

  // Signed in? supabase-js keeps the session in localStorage, so every page can show the account avatar
  // without loading the sign-in library. The avatar is a convenience; the account page re-checks properly.
  const chip = document.getElementById("authChip");
  const signedInEmail = (() => {
    try {
      const key = Object.keys(localStorage).find(k => /^sb-.+-auth-token$/.test(k));
      return key ? JSON.parse(localStorage.getItem(key))?.user?.email || null : null;
    } catch { return null; }
  })();
  if (chip && signedInEmail) {
    chip.href = "account.html";
    chip.classList.add("avatar-chip");
    chip.setAttribute("aria-label", "My account");
    chip.title = signedInEmail;
    chip.replaceChildren(Object.assign(document.createElement("span"), {
      className: "avatar", textContent: signedInEmail[0].toUpperCase(), ariaHidden: "true"
    }));
  }

  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  window.Pointy = {
    get lang() { return lang; },
    onLang(fn) { listeners.push(fn); fn(lang); },
    t(strings) { return strings[lang] ?? strings.he; },
    toast,
    utm,
    clearUtm() { store.remove("pointy-utm"); }
  };

  applyLang(lang);
  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.addEventListener("click", () => {
    const next = lang === "he" ? "en" : "he";
    store.set("pointy-lang", next);
    applyLang(next);
  });

  // Reveal sections once as they enter the viewport.
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("in"));
  }
})();
