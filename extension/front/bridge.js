// Bridge: lets Vimium C's own vomnibar.js run inside this extension.
//
// Release builds of vomnibar.js don't know they're hosted by another extension,
// so they call chrome.runtime.connect() on *this* extension. This shim reroutes
// that connection to Vimium C, tagged with Vimium C's build ID (which Vimium C
// requires for connections from other extensions).

// Your Vimium C extension ID. Chrome Web Store: hfjbmagddngcpeloejdejnfgbamkjaeg
// Edge Add-ons uses a different ID; copy yours from edge://extensions.
var VIMIUM_C_ID = "hfjbmagddngcpeloejdejnfgbamkjaeg";

(function () {
  "use strict";
  var rt = chrome.runtime, realConnect = rt.connect.bind(rt), buildTag = null;

  // Vimium C answers its "inject" request (handler 99) with "@<build id>".
  function getBuildTag() {
    return buildTag || (buildTag = new Promise(function (resolve) {
      try {
        rt.sendMessage(VIMIUM_C_ID, { handler: 99 }, function (res) {
          void rt.lastError;
          resolve(res && typeof res.h === "string" ? res.h : null);
        });
      } catch (e) { resolve(null); }
    }));
  }
  getBuildTag();

  function makeEvent() {
    var ls = [];
    return {
      addListener: function (f) { ls.push(f); },
      removeListener: function (f) { var i = ls.indexOf(f); if (i >= 0) ls.splice(i, 1); },
      hasListener: function (f) { return ls.indexOf(f) >= 0; },
      _fire: function () { var a = arguments; ls.slice().forEach(function (f) { f.apply(null, a); }); }
    };
  }

  rt.connect = function (a, b) {
    // Already addressed to another extension (e.g. debug builds that know VCID_): pass through.
    if (typeof a === "string" && a !== rt.id) return realConnect(a, b);
    var info = (typeof a === "string" ? b : a) || {}, name = info.name || "";
    if (name.indexOf("vimium-c.") === 0) return realConnect(VIMIUM_C_ID, info);

    var onMessage = makeEvent(), onDisconnect = makeEvent(), queue = [], real = null, closed = false;
    var port = {
      name: name, onMessage: onMessage, onDisconnect: onDisconnect,
      postMessage: function (m) {
        if (closed) throw new Error("Attempting to use a disconnected port object");
        if (real) real.postMessage(m); else queue.push(m);
      },
      disconnect: function () { closed = true; if (real) real.disconnect(); }
    };
    getBuildTag().then(function (tag) {
      if (closed) return;
      if (!tag) {
        console.warn("Dense: Vimium C didn't answer. Check VIMIUM_C_ID in bridge.js and that " +
          "Vimium C's Preferred Vomnibar page points at this page.");
        closed = true; onDisconnect._fire(port); return;
      }
      real = realConnect(VIMIUM_C_ID, { name: "vimium-c." + name + tag });
      real.onMessage.addListener(function (m) { onMessage._fire(m, port); });
      real.onDisconnect.addListener(function () { closed = true; onDisconnect._fire(port); });
      queue.forEach(function (m) { real.postMessage(m); });
      queue = [];
    });
    return port;
  };
})();
