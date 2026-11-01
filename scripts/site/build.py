#!/usr/bin/env python3
"""Builds docs/<page>.html from pages/<page>.html with the shared head, nav and footer.

Each page file starts with one JSON line: {"he": "<title>", "en": "<title>", "scripts": [...], "main_class": "..."}.
{{KEY}} placeholders come from config.json; an empty value renders as a highlighted TODO and
`--check` exits non-zero, so a page with missing legal details can't be published by accident.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "../../docs"))
config = json.load(open(os.path.join(HERE, "config.json")))
missing = set()

SHELL = """<!doctype html>
<html lang="he" dir="rtl" data-lang="he" data-title-he="{title_he}" data-title-en="{title_en}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self' https://lrfohfcwsgjxeqdbqwbg.supabase.co; form-action 'self'; base-uri 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
{robots}<title>{title_he}</title>
<meta name="theme-color" content="#0e0e10" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
<link rel="icon" href="icon.png">
<link rel="stylesheet" href="vendor/phosphor/style.css">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a class="skip" href="#main"><span lang="he">דילוג לתוכן</span><span lang="en">Skip to content</span></a>
<header class="nav">
  <div class="nav-inner">
    <a class="brand" href="./" aria-label="Pointy">
      <img src="icon.png" alt="" width="34" height="34">
      Pointy
    </a>
    <div class="nav-actions">
      <button class="chip" id="langBtn" type="button" aria-label="Switch language">
        <i class="ph ph-translate" aria-hidden="true"></i>
        <span lang="he">English</span><span lang="en">עברית</span>
      </button>
      <a class="chip" id="authChip" href="login.html">
        <i class="ph ph-user-circle" aria-hidden="true"></i><span lang="he">כניסה</span><span lang="en">Sign in</span>
      </a>
    </div>
  </div>
</header>

<main id="main" class="page {main_class}">
  <div class="wrap">
{body}
  </div>
</main>

<footer>
  <div class="wrap">
    <nav class="foot-links" aria-label="Legal">
      <a href="privacy.html"><span lang="he">פרטיות</span><span lang="en">Privacy</span></a>
      <a href="terms.html"><span lang="he">תנאי שימוש</span><span lang="en">Terms</span></a>
      <a href="cookies.html"><span lang="he">עוגיות</span><span lang="en">Cookies</span></a>
      <a href="accessibility.html"><span lang="he">הצהרת נגישות</span><span lang="en">Accessibility</span></a>
    </nav>
    <span>© 2026 Pointy</span>
    <p class="foot-note"><span lang="he">Pointy אינו קשור ל־Apple, ל־Anthropic או ל־Adobe. השמות שלהם הם סימנים מסחריים של בעליהם.</span><span lang="en">Pointy is not affiliated with Apple, Anthropic or Adobe. Their names are trademarks of their owners.</span></p>
  </div>
</footer>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="assets/common.js"></script>
{scripts}
</body>
</html>
"""

def fill(text):
    def value(key, markup):
        v = config.get(key, "")
        if not v:
            missing.add(key)
            return f'<mark class="todo">TODO: {key}</mark>' if markup else f"TODO-{key}"
        return v
    # Inside attribute values (href="mailto:{{EMAIL}}") a missing value must stay plain text.
    text = re.sub(r'(="[^"]*?)\{\{([A-Z_]+)\}\}', lambda m: m.group(1) + value(m.group(2), False), text)
    return re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: value(m.group(1), True), text)

def build(name):
    raw = open(os.path.join(HERE, "pages", name)).read()
    meta_line, body = raw.split("\n", 1)
    meta = json.loads(meta_line)
    html = SHELL.format(
        title_he=meta["he"], title_en=meta["en"], main_class=meta.get("main_class", ""),
        robots='<meta name="robots" content="noindex">\n' if meta.get("noindex") else "",
        body=fill(body.rstrip()),
        scripts="\n".join(f'<script src="{s}"></script>' for s in meta.get("scripts", [])))
    open(os.path.join(DOCS, name), "w").write(html)
    print("built", name)

if __name__ == "__main__":
    for name in sorted(os.listdir(os.path.join(HERE, "pages"))):
        if name.endswith(".html"):
            build(name)
    if missing:
        print("missing config values:", ", ".join(sorted(missing)))
        if "--check" in sys.argv:
            sys.exit(1)
