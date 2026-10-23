/* Owi Compass site: the few settings that change live here, in one place. */
window.OWI = {
  email: "owuinung@gmail.com",                 // public contact + grievance address
  repo: "owuinung-spec/owuinung-spec.github.io", // GitHub repo that holds the APK releases
  apkName: ""                                  // not used: any file name works, e.g. Owi-Compass-1.1.0.apk
};

(function () {
  var C = window.OWI;

  // Contact email (kept out of the page source to cut spam harvesting)
  document.querySelectorAll("[data-email]").forEach(function (el) {
    var subject = el.getAttribute("data-subject");
    var href = "mailto:" + C.email + (subject ? "?subject=" + encodeURIComponent(subject) : "");
    var a = document.createElement("a");
    a.href = href;
    a.textContent = el.getAttribute("data-label") || C.email;
    el.replaceWith(a);
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Latest release: used by the home page button and the download page
  var latestUrl = "https://github.com/" + C.repo + "/releases/latest";
  var directUrl = latestUrl; // fallback; replaced below by the real file link of the latest release
  document.querySelectorAll("[data-apk-link]").forEach(function (a) { a.href = directUrl; });

  var needInfo = document.querySelector("[data-release]") || document.querySelector("[data-version]");
  if (!needInfo) return;

  function fmtSize(b) { return b ? (b / 1048576).toFixed(1) + " MB" : "—"; }
  function fmtDate(s) {
    try { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return "—"; }
  }
  function set(sel, text) { document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; }); }

  fetch("https://api.github.com/repos/" + C.repo + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (rel) {
      var asset = (rel.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
      var version = (rel.tag_name || rel.name || "").replace(/^v/i, "");
      set("[data-version]", version ? "Version " + version : "Latest version");
      set("[data-v]", version || "—");
      set("[data-date]", fmtDate(rel.published_at));
      set("[data-size]", asset ? fmtSize(asset.size) : "—");
      if (asset) document.querySelectorAll("[data-apk-link]").forEach(function (a) { a.href = asset.browser_download_url; });
      var notes = document.querySelector("[data-notes]");
      if (notes) {
        var wrap = document.querySelector("[data-notes-section]");
        if (rel.body && rel.body.trim()) { notes.textContent = rel.body.trim(); if (wrap) wrap.hidden = false; }
      }
      set("[data-status]", "");
    })
    .catch(function () {
      set("[data-version]", "Latest version");
      set("[data-status]", "We could not read the version details just now. The button above still downloads the latest file.");
    });
})();
