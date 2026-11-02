/* PS ARCHIVE — static, dependency-free catalog */
(() => {
  "use strict";

  const FILES = [
    ["PS1", "./data/ps1.json"],
    ["PS2", "./data/ps2.json"],
    ["PS3", "./data/ps3.json"],
    ["PSP", "./data/psp.json"],
    ["PS Vita", "./data/vita.json"],
    ["PCE", "./data/pce.json"]
  ];
  const COVERS_FILE = "./data/covers.json";
  const PLATFORM_LABELS = {
    "PS1": "PS1 アーカイブス",
    "PS2": "PS2 アーカイブス",
    "PS3": "PlayStation 3",
    "PSP": "PSP",
    "PS Vita": "PS Vita",
    "PCE": "PCエンジン"
  };
  const fmt = new Intl.NumberFormat("ja-JP");
  const collator = new Intl.Collator("ja-JP", { numeric: true, sensitivity: "base" });
  const PAGE_SIZE = 24;
  let games = [];
  let filtered = [];
  let covers = {};
  let loading = true;
  const state = { q: "", platform: "all", device: "all", price: "all", usedOnly: false, availableOnly: false, sort: "default", view: "grid", page: 1 };
  const $ = id => document.getElementById(id);
  const normalize = value => String(value == null ? "" : value).normalize("NFKC").toLocaleLowerCase("ja-JP").trim();
  const yen = n => Number.isFinite(n) ? fmt.format(n) + "円" : "未登録";
  const index = (o, value) => Object.prototype.hasOwnProperty.call(o, value);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function fill(parent, ...children) {
    children.forEach(child => {
      if (child) parent.appendChild(child);
    });
    return parent;
  }
  function button(className, label, fn) {
    const node = element("button", className, label);
    node.type = "button";
    node.addEventListener("click", fn);
    return node;
  }
  function coverNode(game) {
    const frame = element("div", "cover-frame");
    const place = element("div", "cover-placeholder");
    fill(place, element("span", "cover-small", "PLAYSTATION"), element("span", "cover-glyph", "✧"), element("span", "cover-platform", game.platform), element("span", "cover-small", "GAME ARCHIVE"));
    frame.appendChild(place);
    const key = game.platform + "|" + game.title;
    const url = game.cover || covers[key];
    if (typeof url === "string" && (/^https:\/\/[^\s]+$/.test(url) || /^\.\/assets\/covers\/[\w./%-]+$/.test(url))) {
      const img = element("img");
      img.alt = game.title + " のパッケージ画像";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.src = url;
      img.addEventListener("error", () => img.remove(), { once: true });
      frame.appendChild(img);
    }
    return frame;
  }
  function devicesText(game) {
    if (!Array.isArray(game.devices) || !game.devices.length) return "未確認";
    return game.devices.map(d => d === "PS Vita" ? "PS Vita" : d).join(" / ") + (game.compatibilityNote ? " ※" : "");
  }
  function platformTag(game) {
    return element("span", "platform-tag", PLATFORM_LABELS[game.platform] || game.platform);
  }
  function makeCard(game) {
    const card = element("article", "game-card");
    const top = element("div", "card-top");
    const intro = element("div", "card-intro");
    const badges = element("div", "badge-row");
    badges.appendChild(platformTag(game));
    if (game.devices && game.devices.length) {
      badges.appendChild(element("span", "device-tag", game.devices.map(d => d === "PS Vita" ? "Vita" : d).join(" / ")));
    }
    fill(intro, badges, element("h3", "game-title", game.title), element("div", "card-maker", "配信元： " + (game.publisher || "未確認")));
    fill(top, coverNode(game), intro);
    const bottom = element("div", "card-bottom");
    const prices = element("div", "price-grid");
    const dl = element("div", "price-item");
    const dlNum = element("strong", "price-accent", yen(game.downloadPrice));
    fill(dl, element("small", "", "DL価格"), dlNum);
    const used = element("div", "price-item");
    let usedText = yen(game.usedMin);
    if (Number.isFinite(game.usedMin) && Number.isFinite(game.usedMax) && game.usedMin !== game.usedMax) usedText = fmt.format(game.usedMin) + "〜" + fmt.format(game.usedMax) + "円";
    fill(used, element("small", "", "中古相場"), element("strong", "", usedText));
    fill(prices, dl, used);
    bottom.appendChild(prices);
    if (game.notes) bottom.appendChild(element("p", "card-notes", game.notes));
    const row = element("div", "card-detail");
    fill(row, element("span", "", "開発元：" + (game.developer || "未確認")), button("detail-button", "詳細を見る  ↗", () => openDetail(game)));
    bottom.appendChild(row);
    fill(card, top, bottom);
    return card;
  }
  function detailField(label, value) {
    const box = element("div", "detail-field");
    fill(box, element("small", "", label), element("strong", "", value == null || value === "" ? "未確認" : String(value)));
    return box;
  }
  function openDetail(game) {
    const dialog = $("detailDialog"), content = $("dialogContent");
    content.replaceChildren();
    const hero = element("div", "dialog-hero");
    const body = element("div", "");
    fill(body, platformTag(game), element("h2", "", game.title), element("p", "", game.releaseDate ? "配信開始日： " + game.releaseDate.replace(/-/g, "/") : "配信開始日： 未登録"));
    fill(hero, coverNode(game), body);
    const fields = element("div", "detail-fields");
    fill(fields,
      detailField("開発元", game.developer || "未確認"),
      detailField("配信元（元データのメーカー欄）", game.publisher || "未確認"),
      detailField("DL価格", yen(game.downloadPrice)),
      detailField("中古相場", (Number.isFinite(game.usedMin) ? fmt.format(game.usedMin) + "円" : "未登録") + (Number.isFinite(game.usedMax) && game.usedMax !== game.usedMin ? " 〜 " + fmt.format(game.usedMax) + "円" : "")),
      detailField("プラットフォーム", PLATFORM_LABELS[game.platform] || game.platform),
      detailField("対象機器（目安）", devicesText(game))
    );
    if (game.status) fields.appendChild(detailField("配信状況（元データ記載）", game.status));
    const note = element("section", "detail-notes");
    fill(note, element("h3", "", "備考"), element("p", "", game.notes || "特記事項なし"));
    if (game.compatibilityNote) note.appendChild(element("p", "", "※ " + game.compatibilityNote + "。購入・動作可否は公式情報で確認してください。"));
    fill(content, hero, fields, note);
    if (typeof dialog.showModal === "function") dialog.showModal();
  }
  function priceMatches(game) {
    const n = game.downloadPrice;
    switch (state.price) {
      case "under1000": return Number.isFinite(n) && n < 1000;
      case "1000to3000": return Number.isFinite(n) && n >= 1000 && n < 3000;
      case "3000to6000": return Number.isFinite(n) && n >= 3000 && n < 6000;
      case "6000up": return Number.isFinite(n) && n >= 6000;
      case "unknown": return !Number.isFinite(n);
      default: return true;
    }
  }
  function compareNumeric(a, b, k, descending) {
    const av = a[k], bv = b[k];
    const aa = Number.isFinite(av), bb = Number.isFinite(bv);
    if (!aa && !bb) return a.order - b.order;
    if (!aa) return 1;
    if (!bb) return -1;
    return (descending ? bv - av : av - bv) || a.order - b.order;
  }
  function sortGames(items) {
    switch (state.sort) {
      case "title": return items.sort((a,b) => collator.compare(a.title,b.title) || a.order-b.order);
      case "usedDesc": return items.sort((a,b) => compareNumeric(a,b,"usedMin",true));
      case "usedAsc": return items.sort((a,b) => compareNumeric(a,b,"usedMin",false));
      case "dlAsc": return items.sort((a,b) => compareNumeric(a,b,"downloadPrice",false));
      case "dlDesc": return items.sort((a,b) => compareNumeric(a,b,"downloadPrice",true));
      case "newest": return items.sort((a,b) => (b.releaseDate || "").localeCompare(a.releaseDate || "") || a.order-b.order);
      case "oldest": return items.sort((a,b) => {
        if(!a.releaseDate && !b.releaseDate) return a.order-b.order;
        if(!a.releaseDate) return 1;
        if(!b.releaseDate) return -1;
        return a.releaseDate.localeCompare(b.releaseDate) || a.order-b.order;
      });
      default: return items.sort((a,b) => a.order - b.order);
    }
  }
  function syncURL() {
    const url = new URL(window.location.href);
    ["q", "platform", "device", "price", "sort", "page"].forEach(k => url.searchParams.delete(k));
    if (state.q) url.searchParams.set("q", state.q);
    if (state.platform !== "all") url.searchParams.set("platform", state.platform);
    if (state.device !== "all") url.searchParams.set("device", state.device);
    if (state.price !== "all") url.searchParams.set("price", state.price);
    if (state.sort !== "default") url.searchParams.set("sort", state.sort);
    if (state.page !== 1) url.searchParams.set("page", state.page);
    if (state.usedOnly) url.searchParams.set("used", "1"); else url.searchParams.delete("used");
    if (state.availableOnly) url.searchParams.set("available", "1"); else url.searchParams.delete("available");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  function readURL() {
    const q = new URLSearchParams(window.location.search);
    state.q = q.get("q") || "";
    state.platform = FILES.some(f => f[0] === q.get("platform")) ? q.get("platform") : "all";
    state.device = ["PS3","PS Vita"].includes(q.get("device")) ? q.get("device") : "all";
    state.price = ["under1000","1000to3000","3000to6000","6000up","unknown"].includes(q.get("price")) ? q.get("price") : "all";
    state.sort = ["title","usedDesc","usedAsc","dlAsc","dlDesc","newest","oldest"].includes(q.get("sort")) ? q.get("sort") : "default";
    state.page = Math.max(1, Math.min(500, Number.parseInt(q.get("page") || "1",10) || 1));
    state.usedOnly = q.get("used") === "1"; state.availableOnly = q.get("available") === "1";
  }
  function updateControls() {
    $("searchInput").value = state.q;
    $("sortBy").value = state.sort;
    $("priceFilter").value = state.price;
    $("usedOnly").checked = state.usedOnly;
    $("availableOnly").checked = state.availableOnly;
    document.querySelectorAll("[data-device]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.device === state.device)));
    document.querySelectorAll("[data-platform]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.platform === state.platform)));
    $("gameGrid").classList.toggle("list-layout", state.view === "list");
    $("gridView").classList.toggle("view-selected", state.view === "grid");
    $("listView").classList.toggle("view-selected", state.view === "list");
    $("gridView").setAttribute("aria-pressed", String(state.view === "grid"));
    $("listView").setAttribute("aria-pressed", String(state.view === "list"));
  }
  function platformButtons() {
    const outer = $("platformFilters");
    outer.replaceChildren();
    const options = [["all", "すべて", games.length], ...FILES.map(f => [f[0], PLATFORM_LABELS[f[0]], games.filter(g => g.platform === f[0]).length])];
    options.forEach(row => {
      const entry = button("platform-option", "", () => {state.platform=row[0]; state.page=1;render();});
      entry.dataset.platform = row[0];
      fill(entry, element("span", "", row[1]), element("b", "", fmt.format(row[2])));
      outer.appendChild(entry);
    });
  }
  function filterChips() {
    const chips = $("activeFilters");
    chips.replaceChildren();
    if (state.q) chips.appendChild(element("span","active-chip","検索：「" + state.q + "」"));
    if (state.platform !== "all") chips.appendChild(element("span","active-chip",PLATFORM_LABELS[state.platform]));
    if (state.device !== "all") chips.appendChild(element("span","active-chip","対象：" + state.device));
    if (state.price !== "all") chips.appendChild(element("span","active-chip","価格指定あり"));
    if (state.usedOnly) chips.appendChild(element("span","active-chip","中古相場あり"));
    if (state.availableOnly) chips.appendChild(element("span","active-chip","PS1配信中"));
  }
  function pageChange(n) {
    state.page=n; render();
    $("catalog").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function drawPagination(totalPages) {
    const nav = $("pagination");
    nav.replaceChildren();
    if (totalPages <= 1) return;
    const prev=button("page-button","← 前へ",()=>pageChange(state.page-1));
    prev.disabled=state.page<=1;
    const next=button("page-button","次へ →",()=>pageChange(state.page+1));
    next.disabled=state.page>=totalPages;
    fill(nav,prev,element("span","",""+fmt.format(state.page)+" / "+fmt.format(totalPages)+" ページ"),next);
  }
  function render() {
    if (loading) return;
    const queryTokens = normalize(state.q).split(/\s+/).filter(Boolean);
    filtered = sortGames(games.filter(g => (
      (state.platform === "all" || g.platform === state.platform) &&
      (state.device === "all" || (g.devices || []).includes(state.device)) &&
      (!state.usedOnly || Number.isFinite(g.usedMin)) &&
      (!state.availableOnly || (g.platform === "PS1" && g.status === "販売中")) &&
      priceMatches(g) &&
      queryTokens.every(w => g.search.includes(w))
    )));
    const pages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
    state.page=Math.min(Math.max(1,state.page),pages);
    syncURL();updateControls();filterChips();
    $("resultCount").textContent=fmt.format(filtered.length)+" 件";
    const grid=$("gameGrid");
    const subset=filtered.slice((state.page-1)*PAGE_SIZE,state.page*PAGE_SIZE);
    const fragment=document.createDocumentFragment();
    if (subset.length) subset.forEach(game=>fragment.appendChild(makeCard(game)));
    else {
      const empty=element("div","empty");
      fill(empty,element("strong","","該当するゲームがありません"),element("p","","検索条件を変更するか、フィルターをリセットしてみてください。"),button("","条件をリセット",reset));
      fragment.appendChild(empty);
    }
    grid.replaceChildren(fragment);
    $("status").textContent="";
    drawPagination(Math.ceil(filtered.length/PAGE_SIZE));
  }
  function reset() {
    Object.assign(state,{q:"",platform:"all",device:"all",price:"all",usedOnly:false,availableOnly:false,sort:"default",page:1});
    render();
  }
  function bind() {
    let debounce;
    $("searchInput").addEventListener("input",ev => {
      clearTimeout(debounce);
      debounce=setTimeout(()=>{state.q=ev.target.value;state.page=1;render();},130);
    });
    document.querySelectorAll(".quick-search").forEach(n=>n.addEventListener("click",()=>{state.q=n.dataset.query;state.page=1;render();$("searchInput").focus();}));
    document.querySelectorAll("[data-device]").forEach(n=>n.addEventListener("click",()=>{state.device=n.dataset.device;state.page=1;render();}));
    $("sortBy").addEventListener("change",ev=>{state.sort=ev.target.value;state.page=1;render();});
    $("priceFilter").addEventListener("change",ev=>{state.price=ev.target.value;state.page=1;render();});
    $("usedOnly").addEventListener("change",ev=>{state.usedOnly=ev.target.checked;state.page=1;render();});
    $("availableOnly").addEventListener("change",ev=>{state.availableOnly=ev.target.checked;state.page=1;render();});
    $("resetFilters").addEventListener("click",reset);
    $("gridView").addEventListener("click",()=>{state.view="grid";render();});
    $("listView").addEventListener("click",()=>{state.view="list";render();});
    $("closeDialog").addEventListener("click",()=>$("detailDialog").close());
    $("detailDialog").addEventListener("click",e=>{if(e.target===$("detailDialog"))e.target.close();});
    document.addEventListener("keydown",e=>{const active=document.activeElement;const typing=active && ["INPUT","TEXTAREA","SELECT"].includes(active.tagName);if(e.key==="/"&&!typing&&!$("detailDialog").open){e.preventDefault();$("searchInput").focus();}});
    window.addEventListener("popstate",()=>{readURL();render();});
  }
  async function start() {
    readURL();bind();
    try {
      const loaded=await Promise.all(FILES.map(async ([platform,path])=>{
        const response=await fetch(path,{cache:"no-cache"});
        if(!response.ok)throw new Error(platform + " (HTTP " + response.status + ")");
        const json=await response.json();
        if(json.platform!==platform || !Array.isArray(json.games) || json.count!==json.games.length) throw new Error(platform+" のデータ形式が不正です");
        return json.games;
      }));
      games=loaded.flat().map((game,order)=>({...game,order,search:normalize([game.title,game.publisher,game.developer,game.notes,PLATFORM_LABELS[game.platform]].join(" "))}));
      try {const res=await fetch(COVERS_FILE);if(res.ok)covers=await res.json();}catch(error){console.warn("Cover index not found",error);}
      $("totalStat").textContent=fmt.format(games.length);
      loading=false;platformButtons();render();
    } catch(error) {
      console.error("Catalog data failed",error);
      $("status").textContent="カタログを読み込めませんでした。ページを再読み込みしてください。（" + error.message + "）";
    }
  }
  start();
})();
