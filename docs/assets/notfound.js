// GitHub Pages serves 404.html for any missing path. Links to an older release (a cached page, a shared link)
// land here, so send them to the current download instead of a dead end.
(() => {
  const path = location.pathname;
  if (/^\/download\/Pointy-[\d.]+\.dmg$/i.test(path)) location.replace("/download/Pointy.dmg");
  else if (/^\/download\/PointySetup-[\d.]+\.exe$/i.test(path)) location.replace("/download/PointySetup.exe");
})();
