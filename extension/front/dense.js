/* Dense add-on: runs beside Vimium C's vomnibar.js and only reads the DOM it renders. */
(function () {
  "use strict";
  var R = window.__denseRoot || document;            // the preview page passes a shadow root
  var list = R.getElementById("list"), status = R.getElementById("status");
  var host = R === document ? document.body : R.querySelector(".vbody");
  var SHORT = { tab: "tab", bookm: "bm", history: "hist", search: "srch", domain: "dom", math: "calc" };

  function age(ms) {
    if (!ms) return "";
    var s = (Date.now() - ms) / 1000;
    if (s < 60) return "now";
    var m = s / 60; if (m < 60) return Math.round(m) + "m";
    var h = m / 60; if (h < 24) return Math.round(h) + "h";
    var d = h / 24; if (d < 7) return Math.round(d) + "d";
    if (d < 30) return Math.round(d / 7) + "w";
    if (d < 365) return Math.round(d / 30) + "mo";
    return Math.round(d / 365) + "y";
  }

  function decorate() {
    var rows = list.querySelectorAll(".item");
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.getAttribute("data-done")) continue;
      r.setAttribute("data-done", "1");
      var a = r.querySelector(".age"), v = +r.getAttribute("data-visit");
      if (a && v) a.textContent = age(v);
    }
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function updateStatus() {
    var rows = list.querySelectorAll(".item");
    status.textContent = "";
    if (!rows.length) return;
    var sel = list.querySelector(".item.s"), idx = -1, counts = {}, order = [];
    for (var i = 0; i < rows.length; i++) {
      var t = rows[i].getAttribute("data-type");
      if (!(t in counts)) { counts[t] = 0; order.push(t); }
      counts[t]++;
      if (rows[i] === sel) idx = i;
    }
    var mode = (host && host.dataset && host.dataset.mode) || "omni";
    status.appendChild(el("span", "mode", mode === "bookm" ? "bookmarks" : mode));
    status.appendChild(el("span", "pos", (idx + 1 || "-") + "/" + rows.length));
    var cnt = el("span", "cnt");
    order.forEach(function (t, k) {
      var i = el("i", null, counts[t] + " " + (SHORT[t] || t));
      i.style.setProperty("--vc-c", "var(--t-" + ({ bookm: "bm", history: "hist", domain: "dom" }[t] || t) + ")");
      cnt.appendChild(i);
      if (k < order.length - 1) cnt.appendChild(document.createTextNode(" · "));
    });
    status.appendChild(cnt);
    var row = sel || rows[0], link = row.querySelector(".bottom");
    var text = link ? link.textContent.trim() : "";
    var m = text.match(/^([a-z][\w+.-]*:\/\/)?([^\/?#\s]*)(.*)$/i);
    var url = el("span", "url");
    if (m && m[2] && m[2].indexOf(".") > 0) { url.appendChild(el("b", null, m[2])); url.appendChild(document.createTextNode(m[3])); }
    else url.textContent = text;
    status.appendChild(url);
  }

  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) if (muts[i].type === "childList") { decorate(); break; }
    updateStatus();
  }).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  /* ---------- demo mode: only when opened directly, never inside Vimium C ---------- */
  if (R === document && window.top !== window) return;
  function startDemo() {
    var H = 3600e3, now = Date.now();
    var DATA = [
      { e: "tab", title: "gdh1995/vimium-c: A keyboard shortcut browser extension", t: "https://github.com/gdh1995/vimium-c", label: "tab", visit: now - 0.1 * H },
      { e: "tab", title: "Issues · gdh1995/vimium-c", t: "https://github.com/gdh1995/vimium-c/issues?q=vomnibar", label: "tab", visit: now - 0.6 * H },
      { e: "bookm", title: "Vim Cheat Sheet", t: "https://vim.rtorr.com/", visit: now - 30 * H },
      { e: "history", title: "Learn Vimscript the Hard Way", t: "https://learnvimscriptthehardway.stevelosh.com/chapters/01.html", visit: now - 26 * H },
      { e: "history", title: "vim-airline: lean & mean status/tabline for vim", t: "https://github.com/vim-airline/vim-airline", visit: now - 5 * H },
      { e: "domain", title: "vim.org", t: "https://www.vim.org/", visit: now - 400 * H },
      { e: "history", title: "Neovim docs: options", t: "https://neovim.io/doc/user/options.html", visit: now - 9 * 24 * H },
      { e: "bookm", title: "r/vim - top this week", t: "https://www.reddit.com/r/vim/top/?t=week", visit: now - 72 * H },
      { e: "history", title: "Vimium C Options", t: "chrome-extension://hfjbmagddngcpeloejdejnfgbamkjaeg/pages/options.html#advanced", visit: now - 0.02 * H },
      { e: "history", title: "Practical Vim, 2nd edition", t: "https://pragprog.com/titles/dnvim2/practical-vim-second-edition/", visit: now - 200 * 24 * H }
    ];
    var input = R.getElementById("input"), bar = R.getElementById("bar");
    var tpl = R.getElementById("template").innerHTML.trim().replace(/\s{2,}/g, " ").replace(/> /g, ">");
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var mark = function (s, q) {
      s = esc(s); if (!q) return s;
      var re = new RegExp("(" + q.split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "gi");
      return s.replace(re, "<match>$1</match>");
    };
    var sel = 0;
    function render() {
      var q = input.value.trim(), terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var res = DATA.filter(function (d) { return terms.every(function (t) { return (d.title + " " + d.t).toLowerCase().indexOf(t) >= 0; }); });
      if (q) res.unshift({ e: "search", title: q, t: "https://www.google.com/search?q=" + encodeURIComponent(q), label: "search" });
      res = res.slice(0, 10); sel = 0;
      bar.classList.toggle("empty", !res.length); list.classList.toggle("empty", !res.length);
      var tq = terms.join(" ");
      list.innerHTML = res.map(function (d, i) {
        var vals = { e: d.e, visit: d.visit || "", index: i + 1, level: "", favIcon: "", typeIcon: d.e,
          title: mark(d.title, tq), label: d.label ? ' <span class="label">' + d.label + "</span>" : "",
          textSplit: mark(d.t, tq), time: "" };
        var html = tpl.replace(/\{\{(\w+)\}\}/g, function (_, k) { return vals[k] != null ? vals[k] : ""; });
        return html.replace('class="item"', 'class="item' + (i === sel ? " s" : "") + (i === res.length - 1 ? " b" : "") + '"');
      }).join("");
    }
    function move(d) {
      var rows = list.querySelectorAll(".item"); if (!rows.length) return;
      sel = (sel + d + rows.length) % rows.length;
      for (var i = 0; i < rows.length; i++) rows[i].classList.toggle("s", i === sel);
    }
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) { e.preventDefault(); move(-1); }
      else if (e.key === "Escape") { input.value = ""; render(); }
    });
    if (host.dataset) host.dataset.mode = "omni";
    input.value = "vim";
    render();
    if (R === document) {
      // mimic what Vimium C does with the optional style sheets
      var hc = document.getElementById("high-contrast"); hc.media = hc.getAttribute("data-media");
      document.getElementById("filtered").sheet.disabled = true;
      var dark = matchMedia("(prefers-color-scheme: dark)").matches;
      document.getElementById("dark").sheet.disabled = !dark;
      document.body.classList.toggle("has-dark", dark);
    }
    if (R === document) { document.body.style.display = ""; document.documentElement.style.overflow = "auto"; document.body.style.maxWidth = "880px"; document.body.style.margin = "40px auto"; }
    if (R === document) input.focus();
  }
  if (R === document) setTimeout(function () { if (!window.Vomnibar_ && document.body.style.display === "none") startDemo(); }, 400);
  else startDemo();
})();
