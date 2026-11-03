/* Social sharing — links work without external scripts or tracking SDKs. */
(() => {
  "use strict";

  const SITE_URL = "https://mao2009.github.io/psstore/";
  const SITE_TITLE = "PS ARCHIVE｜旧PlayStation Storeゲームカタログ";
  const SEARCH_KEYS = ["q", "platform", "device", "price", "sort", "page"];
  const NETWORKS = [
    ["bluesky", "Bluesky", "🦋"],
    ["x", "X", "𝕏"],
    ["line", "LINE", "LINE"],
    ["facebook", "Facebook", "f"]
  ];

  // Always share the public GitHub Pages URL, even from localhost.
  // Strip unknown query parameters to avoid sharing tracking parameters.
  function publicUrl(locationUrl = window.location.href) {
    const source = new URL(locationUrl, SITE_URL);
    const target = new URL(SITE_URL);
    for (const key of SEARCH_KEYS) {
      const value = source.searchParams.get(key);
      if (value) target.searchParams.set(key, value);
    }
    return target.href;
  }

  function gameUrl(game) {
    const target = new URL(SITE_URL);
    target.searchParams.set("q", game.title);
    target.searchParams.set("platform", game.platform);
    return target.href;
  }

  function targets(url, title = SITE_TITLE) {
    const message = title + "\n" + url;
    return {
      bluesky: "https://bsky.app/intent/compose?text=" + encodeURIComponent(message),
      x: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url),
      line: "https://social-plugins.line.me/lineit/share?url=" + encodeURIComponent(url),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url)
    };
  }

  function setLinks(section, url, title) {
    section.dataset.shareUrl = url;
    section.dataset.shareTitle = title;
    const destinations = targets(url, title);
    section.querySelectorAll("[data-share-network]").forEach(link => {
      const destination = destinations[link.dataset.shareNetwork];
      if (destination) link.href = destination;
    });
    const native = section.querySelector("[data-native-share]");
    if (native) native.hidden = typeof navigator.share !== "function";
    const copy = section.querySelector("[data-copy-share]");
    if (copy) copy.disabled = false;
  }

  function update() {
    document.querySelectorAll('[data-share-scope="page"]').forEach(section => {
      setLinks(section, publicUrl(), SITE_TITLE);
    });
  }

  function makeElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // A title-filtered catalog link, not a separate per-game OGP page.
  function gamePanel(game) {
    const section = makeElement("section", "share-panel share-panel-detail");
    section.setAttribute("aria-label", game.title + "の検索結果を共有");
    section.appendChild(makeElement("strong", "share-label", "この作品の検索結果を共有"));
    const links = makeElement("div", "share-links");
    for (const [network, label, glyph] of NETWORKS) {
      const link = makeElement("a", "share-link share-link-" + network);
      link.dataset.shareNetwork = network;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", label + "でこの作品の検索結果を共有（新しいタブ）");
      const icon = makeElement("span", "share-glyph", glyph);
      icon.setAttribute("aria-hidden", "true");
      link.append(icon, document.createTextNode(label));
      links.appendChild(link);
    }
    const copy = makeElement("button", "share-link share-link-copy", "🔗 URLをコピー");
    copy.type = "button";
    copy.dataset.copyShare = "";
    const native = makeElement("button", "share-link share-link-native", "共有メニュー");
    native.type = "button";
    native.dataset.nativeShare = "";
    native.hidden = true;
    links.append(copy, native);
    const status = makeElement("span", "share-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    section.append(links, status);
    setLinks(section, gameUrl(game), game.title + " | PS ARCHIVE");
    return section;
  }

  async function copyUrl(section) {
    const status = section.querySelector(".share-status");
    const url = section.dataset.shareUrl;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(url);
      status.textContent = "URLをコピーしました";
    } catch {
      // Not all embedded/mobile browsers grant clipboard permission.
      window.prompt("共有するURLをコピーしてください", url);
      status.textContent = "URLを選択してコピーしてください";
    }
  }

  async function nativeShare(section) {
    if (typeof navigator.share !== "function") return;
    try {
      await navigator.share({title: section.dataset.shareTitle, url: section.dataset.shareUrl});
    } catch (error) {
      if (error?.name !== "AbortError") {
        const status = section.querySelector(".share-status");
        if (status) status.textContent = "共有できませんでした。SNSボタンかURLコピーをお試しください";
      }
    }
  }

  function bind() {
    update();
    document.addEventListener("click", event => {
      const copy = event.target.closest("[data-copy-share]");
      const native = event.target.closest("[data-native-share]");
      const button = copy || native;
      if (!button) return;
      const section = button.closest(".share-panel");
      if (!section) return;
      if (copy) void copyUrl(section);
      else void nativeShare(section);
    });
    window.addEventListener("popstate", update);
  }

  window.PSArchiveShare = Object.freeze({publicUrl, gameUrl, targets, update, gamePanel});
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, {once: true});
  else bind();
})();
