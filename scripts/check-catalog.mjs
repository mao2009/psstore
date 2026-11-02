import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const files = {
  ps1: ["PS1", 798], ps2: ["PS2",108], ps3: ["PS3",913],
  psp: ["PSP",869], vita: ["PS Vita",1215], pce: ["PCE",45]
};
let total = 0;
const titles = new Set();
const ids = new Set();
for (const [file,[platform,expected]] of Object.entries(files)) {
  const data = JSON.parse(readFileSync("data/" + file + ".json", "utf8"));
  assert.equal(data.platform, platform, file + " platform");
  assert.equal(data.count, expected, file + " declared count");
  assert.equal(data.games.length, expected, file + " games count");
  for (const game of data.games) {
    assert.equal(game.platform, platform);
    assert.equal(typeof game.title,"string");
    assert.ok(game.title.trim(),"missing title");
    assert.equal(typeof game.id,"string");
    assert.ok(!ids.has(game.id), "duplicate id " + game.id);
    ids.add(game.id);
    titles.add(game.platform + "|" + game.title);
    assert.ok(Array.isArray(game.devices),"devices missing");
    assert.ok(game.devices.every(x=>["PS3","PS Vita"].includes(x)),"invalid device");
    for(const k of ["downloadPrice","usedMin","usedMax"]){
      assert.ok(game[k]===null || (Number.isFinite(game[k]) && game[k]>=0), "invalid price "+file+" "+k);
    }
    if(game.releaseDate!==null)assert.match(game.releaseDate, /^\d{4}-\d{2}-\d{2}$/);
  }
  total+=expected;
  console.log("✓ "+file+": "+expected+" titles");
}
assert.equal(total,3948);
const covers=JSON.parse(readFileSync("data/covers.json","utf8"));
for(const [key,url] of Object.entries(covers)){
  assert.ok(titles.has(key),"cover target not found: "+key);
  assert.match(url,/^https:\/\//, "cover URL must use https");
}
console.log("✓ total "+total+" titles; "+Object.keys(covers).length+" cover mappings");
