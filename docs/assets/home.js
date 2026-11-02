// Landing page only: send-to-Mac on phones, demo sound toggle.
(() => {
  const T = {
    he: { send: "שליחה למק שלי", copied: "הלינק הועתק. פתחו אותו במק.", shareText: "Pointy: סמן כתום שמראה על מה ללחוץ במק" },
    en: { send: "Send to my Mac", copied: "Link copied. Open it on your Mac.", shareText: "Pointy: an orange pointer that shows you where to click on your Mac" }
  };

  // Phones and tablets can't run Pointy, so the main button sends the link to a Mac instead.
  const isMac = /Macintosh/.test(navigator.userAgent) && (navigator.maxTouchPoints || 0) < 2;
  if (!isMac) {
    Pointy.onLang(() => document.querySelectorAll(".js-get-label").forEach(el => { el.textContent = Pointy.t(T).send; }));
    document.querySelectorAll(".js-get-icon").forEach(i => { i.className = "ph ph-paper-plane-tilt js-get-icon"; });
    document.querySelectorAll(".js-get").forEach(a => a.addEventListener("click", async e => {
      e.preventDefault();
      const url = location.origin + location.pathname;
      if (navigator.share) {
        try { await navigator.share({ title: "Pointy", text: Pointy.t(T).shareText, url }); return; }
        catch (err) { if (err && err.name === "AbortError") return; }
      }
      try { await navigator.clipboard.writeText(url); Pointy.toast(Pointy.t(T).copied); }
      catch { Pointy.toast(url); }
    }));
  }

  // Install guide: Mac / Windows tabs. Opens on the visitor's own system; a link to #install-windows or
  // #install-mac (the download page has both) picks that one.
  const tabs = [...document.querySelectorAll(".os-tabs [role=tab]")];
  function pickOS(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  if (tabs.length) {
    const fromHash = tabs.find(t => "#" + t.getAttribute("aria-controls") === location.hash);
    const isWindows = /Windows/.test(navigator.userAgent);
    pickOS(fromHash || tabs[isWindows ? 1 : 0]);
    if (fromHash) document.getElementById("install").scrollIntoView();
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => pickOS(t));
      t.addEventListener("keydown", e => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        pickOS(tabs[(i + 1) % tabs.length], true);
      });
    });
  }

  // Demo video: pause/play (moving content must be pausable) and no autoplay with "Reduce motion".
  const video = document.getElementById("demo");
  const soundBtn = document.getElementById("soundBtn");
  const playBtn = document.getElementById("playBtn");
  function syncPlay() {
    if (!playBtn) return;
    playBtn.firstElementChild.className = "ph " + (video.paused ? "ph-play" : "ph-pause");
    playBtn.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
  }
  if (video) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.removeAttribute("autoplay"); video.pause(); }
    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPlay);
    syncPlay();
  }
  if (video && playBtn) playBtn.addEventListener("click", () => {
    if (video.paused) video.play().catch(() => {}); else video.pause();
  });
  if (video && soundBtn) soundBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted) { video.currentTime = 0; video.play().catch(() => {}); }
    soundBtn.firstElementChild.className = "ph " + (video.muted ? "ph-speaker-slash" : "ph-speaker-high");
    soundBtn.setAttribute("aria-label", video.muted ? "Sound on" : "Sound off");
  });
})();
