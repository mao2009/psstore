import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const script = readFileSync("share.js", "utf8");
const html = readFileSync("index.html", "utf8");
const app = readFileSync("app.js", "utf8");
const css = readFileSync("styles.css", "utf8");
const workflow = readFileSync(".github/workflows/pages.yml", "utf8");

const fakeDocument = {
  readyState: "loading",
  addEventListener() {},
  querySelectorAll() { return []; },
};
const fakeWindow = {
  location: { href: "https://mao2009.github.io/psstore/" },
  addEventListener() {},
};
const fakeNavigator = {};
runInNewContext(script, {
  window: fakeWindow,
  document: fakeDocument,
  navigator: fakeNavigator,
  URL,
  URLSearchParams,
  encodeURIComponent,
});
const share = fakeWindow.PSArchiveShare;
assert.ok(share, "share API missing");

const publicHome = "https://mao2009.github.io/psstore/";
assert.equal(share.publicUrl("http://localhost:8000/"), publicHome);
const source = "http://localhost:8000/index.html?platform=PS1&q=%E7%9C%9F%E3%83%BB%E5%A5%B3%E7%A5%9E%E8%BB%A2%E7%94%9F&sort=usedAsc&utm_source=test#about";
const search = new URL(share.publicUrl(source));
assert.equal(search.origin, "https://mao2009.github.io");
assert.equal(search.pathname, "/psstore/");
assert.equal(search.searchParams.get("platform"), "PS1");
assert.equal(search.searchParams.get("q"), "真・女神転生");
assert.equal(search.searchParams.get("sort"), "usedAsc");
assert.ok(!search.searchParams.has("utm_source"), "tracker query parameter leaked");
assert.equal(search.hash, "", "fragment should not be shared");

const title = "PS ARCHIVE｜旧PlayStation Storeゲームカタログ";
const destinations = share.targets(search.href, title);
const bsky = new URL(destinations.bluesky);
assert.equal(bsky.origin, "https://bsky.app");
assert.equal(bsky.pathname, "/intent/compose");
assert.equal(bsky.searchParams.get("text"), title + "\n" + search.href);
const x = new URL(destinations.x);
assert.equal(x.origin, "https://twitter.com");
assert.equal(x.pathname, "/intent/tweet");
assert.equal(x.searchParams.get("text"), title);
assert.equal(x.searchParams.get("url"), search.href);
const line = new URL(destinations.line);
assert.equal(line.origin, "https://social-plugins.line.me");
assert.equal(line.pathname, "/lineit/share");
assert.equal(line.searchParams.get("url"), search.href);
const fb = new URL(destinations.facebook);
assert.equal(fb.origin, "https://www.facebook.com");
assert.equal(fb.pathname, "/sharer/sharer.php");
assert.equal(fb.searchParams.get("u"), search.href);

const game = new URL(share.gameUrl({title:"女神異聞録ペルソナ", platform:"PS1"}));
assert.equal(game.origin, "https://mao2009.github.io");
assert.equal(game.searchParams.get("q"), "女神異聞録ペルソナ");
assert.equal(game.searchParams.get("platform"), "PS1");
assert.equal(game.searchParams.size, 2, "detail sharing should not retain unrelated filters");

for (const network of ["bluesky", "x", "line", "facebook"]) {
  const match = html.match(new RegExp('<a class="share-link[^"]*" data-share-network="' + network + '" href="([^"]+)"'));
  assert.ok(match, "missing SSR sharing anchor for " + network);
  const url = new URL(match[1].replaceAll("&amp;", "&"));
  assert.equal(url.protocol, "https:");
  assert.ok(html.includes('share-link-' + network), network + " style is missing");
}
assert.match(html, /data-copy-share disabled/, "copy should be disabled when JS is unavailable");
assert.match(html, /data-native-share hidden/, "native share should be hidden if unsupported");
assert.match(html, /<span class="share-status" role="status" aria-live="polite">/);
assert.ok(html.indexOf("share.js?v=") < html.indexOf("app.js?v="), "share.js must load before app.js");
assert.ok(app.includes("window.PSArchiveShare.update()"), "filter changes must refresh sharing URLs");
assert.ok(app.includes("window.PSArchiveShare.gamePanel(game)"), "game details need share controls");
assert.ok(css.includes(".share-link[hidden]{display:none}"), "hidden mobile share control must stay hidden");
assert.ok(workflow.includes("node scripts/check-share.mjs"));
assert.ok(workflow.includes("cp index.html app.js share.js styles.css"));
console.log("✓ Bluesky/X/LINE/Facebook URLs, filters, per-game links, mobile fallback, publish contract");
