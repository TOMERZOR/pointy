// /download/ is the short link used in ads: forward to the download page, keeping ?utm_…, ?lang= and #.
location.replace(new URL("../download.html", location.href).pathname + location.search + location.hash);
