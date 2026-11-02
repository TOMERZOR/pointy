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
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

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
    toast
  };

  applyLang(lang);

  // Monthly / yearly switches ([data-billing] holds one .billing group). Monthly is the default and the only
  // view without JavaScript; the choice is remembered so the account page opens on what was picked on the home page.
  document.querySelectorAll("[data-billing]").forEach(box => {
    const group = box.querySelector(".billing");
    if (!group) return;
    const set = period => {
      box.dataset.period = period;
      group.querySelectorAll("[data-set-period]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setPeriod === period)));
    };
    set(store.get("pointy-billing") === "year" ? "year" : "month");
    group.hidden = false;
    group.addEventListener("click", e => {
      const b = e.target.closest("[data-set-period]");
      if (!b) return;
      set(b.dataset.setPeriod);
      store.set("pointy-billing", b.dataset.setPeriod);
    });
  });
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
