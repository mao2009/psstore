import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const svg = readFileSync("assets/ogp.svg", "utf8");
const workflow = readFileSync(".github/workflows/pages.yml", "utf8");
const meta = new Map();
for (const [, name, content] of html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)">/g)) {
  assert.ok(!meta.has(name), "Duplicate meta tag: " + name);
  meta.set(name, content);
}

const site = "https://mao2009.github.io/psstore/";
const image = site + "ogp.png";
assert.match(html, /<link rel="canonical" href="https:\/\/mao2009\.github\.io\/psstore\/"/);
assert.equal(meta.get("og:type"), "website");
assert.equal(meta.get("og:locale"), "ja_JP");
assert.equal(meta.get("og:url"), site);
assert.equal(meta.get("og:site_name"), "PS ARCHIVE");
assert.equal(meta.get("og:image"), image);
assert.equal(meta.get("og:image:secure_url"), image);
assert.equal(meta.get("og:image:type"), "image/png");
assert.equal(meta.get("og:image:width"), "1200");
assert.equal(meta.get("og:image:height"), "630");
assert.equal(meta.get("twitter:card"), "summary_large_image");
assert.equal(meta.get("twitter:image"), image);
for (const key of ["og:title", "og:description", "og:image:alt", "twitter:title", "twitter:description", "twitter:image:alt"]) {
  assert.ok(meta.get(key)?.trim(), "Missing " + key);
}
assert.match(svg, /<svg[^>]+width="1200"[^>]+height="630"/);
assert.match(svg, /あの頃のゲームを、/);
assert.match(svg, /3,948/);
assert.ok(!/<(?:image|script|foreignObject)\b/i.test(svg), "OGP SVG must be self-contained");
assert.ok(!/(?:href|xlink:href)=["\u0027]https?:/i.test(svg), "OGP SVG must not load remote assets");
assert.ok(workflow.includes("scripts/render-ogp.py assets/ogp.svg ogp.png"));
assert.ok(workflow.includes("cp ogp.png public/ogp.png"));
console.log("✓ OGP metadata and 1200×630 social card publish contract");
