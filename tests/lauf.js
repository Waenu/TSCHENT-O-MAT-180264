// Prüfläufe für den TSCHENT-O-MAT (seit 3.33.0.0).
// Aufruf im Repo-Ordner:  node tests/lauf.js        (Voraussetzung: Node.js und «npm i playwright», einmalig «npx playwright install chromium»)
// Die Läufe starten einen kleinen Server, öffnen die App wie ein Handy (450 px), simulieren GitHub und den Briefkasten und melden OK oder FEHLER.
// Es wird nichts gesendet und nichts gespeichert: api.github.com ist abgefangen.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 8790;
const BASIS = "http://localhost:" + PORT + "/TSCHENT-O-MAT-Test/";   // «TSCHENT-O-MAT-Test» im Pfad schaltet den Testmodus ein
const TYP = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".woff2": "font/woff2", ".css": "text/css" };
const lesen = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64");

const ERG = [];
const ok = (name, bed, extra) => { ERG.push({ name, ok: !!bed, extra }); };

function server() {
  return new Promise((res) => {
    const s = http.createServer((req, ant) => {
      let p = decodeURIComponent(req.url.split("?")[0]).replace(/^\/TSCHENT-O-MAT-Test\//, "/"); if (p === "/") p = "/index.html";
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { ant.writeHead(404); ant.end("nicht da"); return; }
      ant.writeHead(200, { "Content-Type": TYP[path.extname(f)] || "application/octet-stream" }); ant.end(fs.readFileSync(f));
    });
    s.listen(PORT, () => res(s));
  });
}

// opt: {ls:{…}, papi:true, heute:"2026-11-08", schalter:{…}|null, buchungen:{…}, api:(url, methode, body) => {status, body}|null}
async function seite(browser, opt = {}) {
  const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 450, height: 900 } });
  const p = await ctx.newPage(); p.fehler = []; p.api = [];
  p.on("pageerror", (e) => p.fehler.push(e.message));
  await p.route("**/belegt.json*", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ belegt: [] }) }));
  await p.route("**/einladungen.json*", (r) => r.abort());
  await p.route("**/familie.json*", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(opt.familie || { liste: {} }) }));
  await p.route("**/schalter.json*", (r) => (opt.schalter ? r.fulfill({ contentType: "application/json", body: JSON.stringify({ werte: opt.schalter, plan: opt.plan }) }) : r.fulfill({ status: 404, body: "{}" })));
  if (opt.buchungen) await p.route("**/buchungen.json*", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(opt.buchungen) }));
  await p.route("**api.github.com/**", async (r) => {
    const q = r.request(), m = q.method(), body = q.postData();
    p.api.push({ url: q.url(), m, body });
    const a = opt.api ? opt.api(q.url(), m, body) : null;
    if (!a) return r.abort();
    return r.fulfill({ status: a.status || 200, contentType: "application/json", body: typeof a.body === "string" ? a.body : JSON.stringify(a.body || {}) });
  });
  const ls = Object.assign({ i: "1" }, opt.ls || {});
  await p.addInitScript(([l, papi]) => { if (localStorage.getItem("tm2t_i") && localStorage.getItem("tm2t_run")) return; localStorage.setItem("tm2t_run", "1"); Object.keys(l).forEach((k) => localStorage.setItem("tm2t_" + k, l[k])); if (papi) window.__papi = 1; }, [ls, !!opt.papi]);
  await p.goto(BASIS + "?heute=" + (opt.heute || "2026-11-08"), { waitUntil: "load" }); await p.waitForTimeout(2200);
  p.ctx = ctx; return p;
}
const kind = (name) => ({ absender: name, namefix: "1", ["mailSkip:" + name]: "1", mail: JSON.stringify({ name, mail: "t@e.ch" }) });
const papiLs = { token: "test", papitoken: "test" };
const manuelBuch = (extra) => ({ buchungen: [Object.assign({ name: "Manuel", arr: "2027-01-04", dep: "2027-01-07", selbst: false, pers: 5, betrag: 1254, rechnung: "Anreise\tMo\nFreunde\t3\nTotal laut Rechner\tCHF 1254.–", bestaetigt: "2026-11-26T12:52" }, extra || {})], logbuch: [] });
const warte = (p, ms) => p.waitForTimeout(ms);

async function tDateien() {
  const idx = lesen("index.html"), ein = fs.readFileSync(path.join(ROOT, "einstellungen.json")), ver = JSON.parse(lesen("versionen.json"));
  ok("einstellungen.json hat genau 3024 Bytes", ein.length === 3024, ein.length + " Bytes");
  const v = (/let VERSION = "([^"]+)"/.exec(idx) || [])[1], vj = (/"version":\s*"([^"]+)"/.exec(ein.toString()) || [])[1];
  ok("Version in index.html = einstellungen.json = oberster Eintrag in versionen.json", v && v === vj && ver.versionen[0].v === v, [v, vj, ver.versionen[0].v].join(" / "));
  ok("«let VERSION» kommt genau einmal vor", (idx.match(/let VERSION = "/g) || []).length === 1);
  const sk = [...idx.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((x) => x[1]).sort((a, b) => b.length - a.length)[0];
  let syn = true, msg = ""; try { new vm.Script(sk); } catch (e) { syn = false; msg = e.message; }
  ok("Skript hat keinen Syntaxfehler", syn, msg);
  ok("versionen.json: Datum im Format JJJJ-MM-TT", /^\d{4}-\d{2}-\d{2}$/.test(ver.versionen[0].datum), ver.versionen[0].datum);
}

async function tStart(b) {
  const p = await seite(b, { ls: papiLs, papi: true });
  const r = await p.evaluate(() => ({ v: typeof VERSION === "string" ? VERSION : null, token: !!TOKEN }));
  ok("Start als Papi ohne Fehler", p.fehler.length === 0 && r.v && r.token, p.fehler.join("|"));
  await p.ctx.close();
  const k = await seite(b, { ls: kind("Deborah") });
  ok("Start als Kind (Deborah) ohne Fehler", k.fehler.length === 0, k.fehler.join("|"));
  await k.ctx.close();
}

async function tControlPanel(b) {
  const puts = [];
  const api = (url, m, body) => {
    if (/contents\/schalter\.json/.test(url)) { if (m === "GET") return { status: 404 }; puts.push(JSON.parse(body)); return { status: 201 }; }
    if (/contents\/buchungen\.json/.test(url)) { if (m === "GET") return { body: { sha: "x", content: b64({ buchungen: [], logbuch: [] }) } }; puts.push({ log: JSON.parse(Buffer.from(JSON.parse(body).content, "base64").toString()).logbuch }); return { status: 200 }; }
    return null;
  };
  const p = await seite(b, { ls: papiLs, papi: true, schalter: { gast: 80, famPausch: 9999, gastZimmer: 35 }, api });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    o.geladen = { gast: P.gast, fam: P.famPausch, gz: P.gastZimmer, fa: P.famAnteil };
    bestZeigen(); await w(300);
    const sd = [...document.querySelectorAll("#bestKasten details")].find((d) => /Control Panel/.test(d.querySelector("summary").innerText)); o.da = !!sd; if (sd) sd.open = true;
    const inp = (k) => document.getElementById("sch-" + k);
    o.std = !document.querySelector('[data-sch-std="gast"]').hidden;
    document.querySelector('[data-sch-std="gast"]').click(); await w(300); o.gastNachStd = document.getElementById("sch-gast").value;
    inp("hochMinNaechte").value = "99"; inp("hochMinNaechte").dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector("[data-sch-save]").click(); await w(400); o.grenze = (document.querySelector(".sond-msg") || {}).innerText || "";
    inp("hochMinNaechte").value = String(P.hochMinNaechte); inp("hochMinNaechte").dispatchEvent(new Event("input", { bubbles: true }));
    inp("gastZimmer").value = "30"; inp("gastZimmer").dispatchEvent(new Event("input", { bubbles: true })); o.live = document.getElementById("sch-fa").textContent;
    document.querySelector("[data-sch-save]").click(); await w(500); const ok1 = document.querySelector('[data-afr="1"]'); if (ok1) { ok1.click(); await w(1500); }
    o.nach = { gz: P.gastZimmer, fa: P.famAnteil, gast: P.gast };
    return o;
  });
  ok("Control Panel: gültige Werte aus schalter.json gelten, ungültiger (9999) wird ignoriert", r.geladen.gast === 80 && r.geladen.fam === 70, JSON.stringify(r.geladen));
  ok("Control Panel: Familienanteil im Zimmer folgt (35 → 35)", r.geladen.gz === 35 && r.geladen.fa === 35);
  ok("Control Panel: Kasten da, «Standard» setzt zurück", r.da && r.std && r.gastNachStd === "70", JSON.stringify([r.da, r.std, r.gastNachStd]));
  ok("Control Panel: Eingabe ausserhalb der Grenzen wird abgewiesen", /Bitte prüfen/.test(r.grenze), r.grenze);
  ok("Control Panel: Live-Anzeige und Speichern (Zimmer 30 → Familie 40)", /CHF 40/.test(r.live) && r.nach.gz === 30 && r.nach.fa === 40, r.live + " | " + JSON.stringify(r.nach));
  ok("Control Panel: schalter.json und Logbuch werden geschrieben", puts.some((x) => x.message && /Schalter/.test(x.message)) && puts.some((x) => x.log && x.log.length), JSON.stringify(puts).slice(0, 120));
  ok("Control Panel: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tGueltigAb(b) {
  const puts = [];
  const api = (url, m, body) => {
    if (/contents\/schalter\.json/.test(url)) { if (m === "GET") return { body: { sha: "x", content: b64({ werte: {}, plan: [] }) } }; puts.push(JSON.parse(Buffer.from(JSON.parse(body).content, "base64").toString())); return { status: 200 }; }
    if (/contents\/buchungen\.json/.test(url)) { if (m === "GET") return { body: { sha: "x", content: b64({ buchungen: [], logbuch: [] }) } }; return { status: 200 }; }
    return null;
  };
  const p = await seite(b, { ls: papiLs, papi: true, schalter: { gast: 75 }, plan: [{ ab: "2027-02-01", werte: { famPausch: 80, gast: 90 } }, { ab: "2026-01-01", werte: { reinigung: 1 } }, { ab: "2027-01-10", bis: "2027-01-15", werte: { famPausch: 120 } }, { ab: "kaputt", werte: { gast: 1 } }], api });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    o.plan = SCH_PLAN.length; o.heute = { fam: schAkt("famPausch"), gast: schAkt("gast") };
    const wert = async (k) => { ARR = k; DEP = ""; render(); await w(100); return { fam: P.famPausch, gast: P.gast }; };
    o.ski = [await wert("2027-01-12"), await wert("2027-01-15"), await wert("2027-01-16")]; o.dez = await wert("2026-12-12"); o.feb = await wert("2027-02-05"); o.jan = await wert("2027-01-30");
    ARR = ""; render(); bestZeigen(); await w(300);
    const sd = [...document.querySelectorAll("#bestKasten details")].find((d) => /Control Panel/.test(d.querySelector("summary").innerText)); if (sd) sd.open = true;
    o.liste = (document.querySelector(".sch-plan") || { innerText: "" }).innerText.replace(/\s+/g, " ");
    o.feld = !!document.getElementById("sch-ab");
    const inp = document.getElementById("sch-famPausch"); inp.value = "85"; inp.dispatchEvent(new Event("input", { bubbles: true }));
    const ab = document.getElementById("sch-ab"); ab.value = "2027-03-01"; ab.dispatchEvent(new Event("change", { bubbles: true }));
    document.querySelector("[data-sch-save]").click(); await w(500); const ja = document.querySelector('[data-afr="1"]'); o.frage = (document.querySelector(".afr-t, #appFrage") || { innerText: "" }).innerText.replace(/\s+/g, " "); if (ja) { ja.click(); await w(1500); }
    o.nachHeute = { fam: schAkt("famPausch") }; o.nachMaerz = await wert("2027-03-10"); o.nachFeb = await wert("2027-02-10");
    return o;
  });
  ok("Gültig ab: Werte aus schalter.json (plan), ungültige Einträge ohne Wirkung", r.plan === 3, "Einträge: " + r.plan);
  ok("Gültig ab: heute gilt der alte Wert (Panel zeigt heute)", r.heute.fam === 70 && r.heute.gast === 75, JSON.stringify(r.heute));
  ok("Gültig ab: Anreise 12.12.2026 alt, 30.1.2027 alt, 5.2.2027 neu (80 / 90)", r.dez.fam === 70 && r.dez.gast === 75 && r.jan.fam === 70 && r.feb.fam === 80 && r.feb.gast === 90, JSON.stringify([r.dez, r.jan, r.feb]));
  ok("Gültig bis: Skirennen 12. und 15.1.2027 = 120, am 16.1. wieder 70", r.ski[0].fam === 120 && r.ski[1].fam === 120 && r.ski[2].fam === 70, JSON.stringify(r.ski));
  ok("Gültig ab: geplante Änderung steht im Panel, Feld «Gültig ab» da", /1\.2\.2027/.test(r.liste) && r.feld, r.liste);
  const pj = puts[0];
  ok("Gültig ab: Speichern mit Datum schreibt Plan, Basiswerte bleiben", !!pj && pj.werte.gast === 75 && pj.werte.famPausch === undefined && pj.plan.some((x) => x.ab === "2027-03-01" && x.werte.famPausch === 85) && pj.plan.some((x) => x.ab === "2027-02-01"), JSON.stringify(pj));
  ok("Gültig ab: nach dem Speichern heute unverändert, ab 1.3. 85, dazwischen 80", r.nachHeute.fam === 70 && r.nachMaerz.fam === 85 && r.nachFeb.fam === 80, JSON.stringify([r.nachHeute, r.nachMaerz, r.nachFeb]));
  ok("Gültig ab: Rückfrage nennt das Datum", /1\.3\.2027/.test(r.frage), r.frage);
  ok("Gültig ab: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tGueltigBis(b) {
  const puts = [];
  const api = (url, m, body) => {
    if (/contents\/schalter\.json/.test(url)) { if (m === "GET") return { body: { sha: "x", content: b64({ werte: {}, plan: [] }) } }; puts.push(JSON.parse(Buffer.from(JSON.parse(body).content, "base64").toString())); return { status: 200 }; }
    if (/contents\/buchungen\.json/.test(url)) { if (m === "GET") return { body: { sha: "x", content: b64({ buchungen: [], logbuch: [] }) } }; return { status: 200 }; }
    return null;
  };
  const p = await seite(b, { ls: papiLs, papi: true, schalter: {}, plan: [{ ab: "2026-11-01", bis: "2026-12-31", werte: { famPausch: 200 } }], api });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    o.heute = schAkt("famPausch"); bestZeigen(); await w(300);
    const sd = [...document.querySelectorAll("#bestKasten details")].find((d) => /Control Panel/.test(d.querySelector("summary").innerText)); if (sd) sd.open = true;
    const g = document.getElementById("sch-gast"); g.value = "76"; g.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector("[data-sch-save]").click(); await w(500); const ja = document.querySelector('[data-afr="1"]'); if (ja) { ja.click(); await w(1500); }
    o.fehl = (document.querySelector(".sond-msg") || { innerText: "" }).innerText;
    const ab = document.getElementById("sch-bis"); o.feld = !!ab; if (ab) { ab.value = "2027-01-20"; ab.dispatchEvent(new Event("change", { bubbles: true })); }
    const f = document.getElementById("sch-reinigung"); f.value = "250"; f.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector("[data-sch-save]").click(); await w(500); o.msg = (document.querySelector(".sond-msg") || { innerText: "" }).innerText;
    return o;
  });
  const pj = puts[0];
  ok("Gültig bis: befristeter Wert gilt heute (200), Panel zeigt ihn", r.heute === 200 && r.feld, JSON.stringify([r.heute, r.feld]));
  ok("Gültig bis: Sofort-Speichern macht den befristeten Wert nicht dauerhaft", !!pj && pj.werte.gast === 76 && pj.werte.famPausch === undefined && pj.plan.some((x) => x.bis === "2026-12-31" && x.werte.famPausch === 200), JSON.stringify(pj));
  ok("Gültig bis ohne «ab» wird abgewiesen", /Gültig ab/.test(r.msg), r.msg);
  ok("Gültig bis: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tSondAufteilung(b) {
  const p = await seite(b, { ls: papiLs, papi: true });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    sondStart({ id: "a", name: "Papi", arr: "2027-01-07", dep: "2027-01-10", t: 1, pa: true, preis: 600, reinB: 120 }); await w(300);
    S.werArt = EIGEN; S.famSel = []; S.ichMit = true; S.wer = "Nur ich"; S.gaeste = 2; S.kinder = 0; S.reinig = REINIG[0]; S.zimmer = "Nein"; S.spar = "Nein"; S.waesche = S.waesche || "Persönlich bringen"; normalize(); render(); await w(400);
    const rows = [...document.querySelectorAll("#result .auf-tab tr.auf-d")].map((t) => t.innerText.replace(/\s+/g, " "));
    o.live = rows; o.legende = [...document.querySelectorAll("#result .ueb-leg")].map((t) => t.innerText.replace(/\s+/g, " "));
    o.bal = [...document.querySelectorAll("#result .ueb-b")].map((e) => [...e.children].map((c) => c.className + ":" + Math.round(parseFloat(c.style.flex))).join(","));
    const text = "Gesendet am Mo 26.11.2026, 18:27 Uhr. App-Version x.\n#Preisberechnung\n" + SNAP_BER.join("\n"); o.snapN = SNAP_BER.length;
    const h = rechAufHtml(text, { name: "Papi", arr: "2027-01-07", dep: "2027-01-10", betrag: 1920, rechnung: text, bestaetigt: "2026-11-26T12:00" });
    const d = document.createElement("div"); d.innerHTML = h || ""; o.gesp = [...d.querySelectorAll("tr.auf-d")].map((t) => t.innerText.replace(/\s+/g, " "));
    return o;
  });
  const gut = (t) => /Übernachtung 3 Nächte \(à CHF 200\.00, Anteil an CHF 600\.– pro Nacht\) CHF 600\.00/.test(t) && /Reinigung CHF 40\.00/.test(t) && !/Pauschale/.test(t) && !/CHF 0\.0\d/.test(t);
  ok("Sonderbuchung mit Pauschale: Aufteilung live = Übernachtung (3 × Anteil von CHF 600) + Reinigungsanteil, ohne Rundungsreste", r.live.length === 3 && r.live.every(gut), JSON.stringify(r.live[0]));
  ok("Sonderbuchung mit Pauschale: Balken grün (Übernachtung) und violett (Reinigung), Legende «Reinigung»", r.bal.every((t) => t === "su:600,sr:40") && r.legende.every((t) => /Übernachtung/.test(t) && /Reinigung/.test(t)), JSON.stringify([r.bal, r.legende]));
  ok("Sonderbuchung mit Pauschale: gespeicherte Berechnung zeigt dasselbe", r.gesp.length === 3 && r.gesp.every(gut), JSON.stringify(r.gesp[0]));
  ok("Sonderbuchung mit Pauschale: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tSondListe(b) {
  const p = await seite(b, { ls: kind("Manuel"), heute: "2026-11-27" });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    sondStart({ id: "a", name: "Manuel", arr: "2027-01-07", dep: "2027-01-10", t: 1, pa: true, preis: 600, reinB: 120 }); await w(300);
    S.werArt = EIGEN; S.famSel = []; S.ichMit = true; S.gaeste = 2; S.reinig = REINIG[0]; S.zimmer = "Nein"; S.spar = "Nein"; S.waesche = S.waesche || "Persönlich bringen";
    const f = (v, n, g) => ({ vorname: v, name: n, geschlecht: "w", geb: g || "1990-01-01", nat: "Schweiz" });
    localStorage.setItem("tm2t_gmEntwurf", JSON.stringify({ k: gmEntwurfKeyJetzt(), l: [f("Anna", "Meier"), f("Bea", "Zeller")] })); normalize(); render(); await w(400);
    for (let i = 0; i < 4; i++) { const ok1 = document.querySelector(".gm-pt-ok"); if (ok1) { ok1.click(); await w(300); } }
    o.leiste = (document.querySelector("#bar") || { innerText: "" }).innerText.replace(/\s+/g, " ").slice(0, 160);
    o.rows = [...document.querySelectorAll("#result .auf-tab tr.auf-d")].map((t) => t.innerText.replace(/\s+/g, " "));
    return o;
  });
  ok("Sonderbuchung mit Pauschale und Liste: Aufteilung ohne Fehler, ohne «Pauschale»", p.fehler.length === 0 && r.rows.length >= 2 && !r.rows.some((t) => /Pauschale/.test(t)), p.fehler.join("|") + " " + r.leiste + " " + JSON.stringify(r.rows[0] || ""));
  await p.ctx.close();
}

async function tSondNaechte(b, sm) {
  const p = await seite(b, { ls: kind("Manuel"), heute: "2026-11-27", schalter: sm ? { sondMin: 2 } : null });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    sondStart({ id: "a", name: "Manuel", arr: "2027-01-07", dep: "2027-01-10", t: 1, pa: true, preis: 600, reinB: 120 }); await w(300);
    S.werArt = EIGEN; S.famSel = []; S.ichMit = true; S.gaeste = 2; S.reinig = REINIG[0]; S.zimmer = "Nein"; S.spar = "Nein"; S.waesche = S.waesche || "Persönlich bringen";
    const f = (v, n, a, b2) => Object.assign({ vorname: v, name: n, geschlecht: "w", geb: "1990-01-01", nat: "Schweiz" }, a ? { an: a, ab: b2 } : {});
    localStorage.setItem("tm2t_gmEntwurf", JSON.stringify({ k: gmEntwurfKeyJetzt(), l: [f("Anna", "Meier"), f("Bea", "Zeller", "2027-01-08", "2027-01-10")] })); normalize(); render(); await w(400);
    for (let i = 0; i < 4; i++) { const ok1 = document.querySelector(".gm-pt-ok"); if (ok1) { ok1.click(); await w(300); } }
    o.hint = !!document.querySelector(".sond-ganz"); o.pm = P.sondMin;
    o.leiste = (document.querySelector("#bar") || { innerText: "" }).innerText.replace(/\s+/g, " ").slice(0, 120);
    o.rows = [...document.querySelectorAll("#result .auf-tab tr.auf-d")].map((t) => t.innerText.replace(/\s+/g, " "));
    o.sum = [...document.querySelectorAll("#result .auf-tab tr.auf-z")].map((t) => { const m = [...t.innerText.matchAll(/CHF\s([\d’]+\.\d\d)/g)]; return m.length ? parseFloat(m[m.length - 1][1].replace(/’/g, "")) : 0; }).reduce((a, v) => a + v, 0);
    o.zr = [...document.querySelectorAll("#result .auf-tab tr.auf-z")].map((t) => t.innerText.replace(/\s+/g, " ")); o.tot = (document.querySelector("#result .big") || { innerText: "" }).innerText;
    return o;
  });
  if (sm) {
    ok("Pauschale nach Personennächten: Anna 3 Nächte CHF 675, Bea 2 Nächte CHF 450 (1800 / 8 Personennächte = 225, Schalter auf 2)", r.rows.length === 3 && /3 Nächte \(à CHF 225\.00, Anteil an CHF 600\.– pro Nacht\) CHF 675\.00/.test(r.rows[0] + r.rows[1] + r.rows[2]) && r.rows.some((t) => /2 Nächte \(à CHF 225\.00, Anteil an CHF 600\.– pro Nacht\) CHF 450\.00/.test(t)), JSON.stringify(r.rows) + " " + r.leiste);
    ok("Pauschale nach Personennächten: Summe der Zeilen = Total CHF 1’920", Math.abs(r.sum - 1920) < 0.3 && /1.920/.test(r.tot), r.sum + " " + r.tot + " " + JSON.stringify(r.zr));
    ok("Schalter Weltcup auf 2 Nächte: kein Hinweis «ganze Zeit», Wert 2", !r.hint && r.pm === 2, JSON.stringify([r.hint, r.pm]));
  } else {
    ok("Schalter Weltcup (Standard 3): eigene Daten mit 2 Nächten werden nicht übernommen, alle 3 Nächte", r.rows.length === 3 && r.rows.every((t) => /3 × CHF 225\.00|3 × CHF 200\.00|Anteil an CHF 600\.–/.test(t)) && !r.rows.some((t) => /\(2 Nächte\)/.test(t)) && Math.abs(r.sum - 1920) < 0.3, JSON.stringify(r.rows) + " " + r.sum);
    ok("Schalter Weltcup (Standard 3): Hinweis «ganze Zeit» statt Aufenthalts-Feld, Wert 3", r.hint && r.pm === 3, JSON.stringify([r.hint, r.pm]));
  }
  ok("Pauschale nach Personennächten: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tPaar(b) {
  const p = await seite(b, { ls: kind("Manuel"), heute: "2026-11-27", familie: { liste: { Manuel: { p: "Sarah", k: [] } } } });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    kalenderKlick("2026-12-12"); kalenderKlick("2026-12-15"); await w(400);
    const c = [...document.querySelectorAll("#f-art .zchip")].find((x) => /Normal/.test(x.textContent)); if (c) { c.click(); await w(400); }
    S.werArt = EIGEN; S.famSel = ["Sarah"]; S.ichMit = true; S.gaeste = 3; S.reinig = REINIG[0]; S.zimmer = "Nein"; S.spar = "Nein"; S.waesche = S.waesche || "Persönlich bringen";
    const f = (v, n, g) => ({ vorname: v, name: n, geschlecht: "w", geb: g || "1990-01-01", nat: "Schweiz" });
    localStorage.setItem("tm2t_gmEntwurf", JSON.stringify({ k: gmEntwurfKeyJetzt(), l: [f("Alex", "Meier"), f("Julia", "Meier"), f("Alexandra", "Huber")] })); normalize(); render(); await w(400);
    for (let i = 0; i < 4; i++) { const ok1 = document.querySelector(".gm-pt-ok"); if (ok1) { ok1.click(); await w(300); } }
    o.rechner = (document.querySelector("#result .auf-tab tr") || document.querySelector(".auf-tab tr") || { innerText: "" }).innerText.replace(/\s+/g, " "); o.aufD = [...document.querySelectorAll("#result .auf-d")].map((t) => t.innerText.replace(/\s+/g, " ")).join(" || "); o.leg = document.querySelectorAll("#result .ueb-leg").length; o.snapFam = SNAP_BER.filter((t) => /zahlt|zahlen/.test(t)).join(" | ").slice(0, 200);
    const text = "Gesendet am Fr 27.11.2026, 10:00 Uhr. App-Version x.\n#Preisberechnung\n" + SNAP_BER.join("\n"), bu = { name: "Manuel", arr: "2026-12-12", dep: "2026-12-15", betrag: 1000, rechnung: text, bestaetigt: "2026-11-27T10:00" };
    const txt = (h) => { const d = document.createElement("div"); d.innerHTML = h || ""; return [...d.querySelectorAll("tr")].map((t) => t.innerText.replace(/\s+/g, " ")); };
    o.kind = txt(rechAufHtml(text, bu)); TOKEN = "test"; const bk = ABSENDER; ABSENDER = ""; o.papi = txt(rechAufHtml(text, bu)); ABSENDER = bk; o.leiste = (document.querySelector("#bar") || { innerText: "" }).innerText.replace(/\s+/g, " ").slice(0, 120);
    return o;
  });
  const alle = (a) => a.join(" | ");
  ok("Paar in der gespeicherten Berechnung: «2 × 3 Nächte × CHF 70.00» wie bei Einzelnen", /Übernachtung 6 Nächte \(à CHF 70\.00\) CHF 420\.00/.test(alle(r.papi)) && /3 Nächte \(à CHF 70\.00\)/.test(alle(r.papi)) || /3 Nächte für CHF/.test(alle(r.papi)), alle(r.papi));
  ok("Unten: Total Reinigung, Total Kurtaxe, Einnahmen, dann Total", /Total ReinigungCHF [\d’']+\.\d\d \| Total KurtaxeCHF [\d’']+\.\d\d \| Einnahmen ÜbernachtungCHF [\d’']+\.\d\d \| Total/.test(alle(r.papi)), alle(r.papi).slice(-200));
  ok("Buchen: erste Zeile «Ich (Manuel) & Sarah zahlen», gespeichert neutral ohne Namen", /Ich \(Manuel\) & Sarah zahlen/.test(r.rechner) && !/Sarah/.test(r.snapFam), r.rechner + " || " + r.snapFam);
  ok("Buchen: pro Person Nächte × Preis, Legende nur einmal", /Ich \(Manuel\) & Sarah[^|]*Übernachtung 6 Nächte \(3 \+ 3\) für CHF 210\.00/.test(r.aufD) && /Alex[^|]*Übernachtung 3 Nächte \(à CHF 70\.00\) CHF 210\.00/.test(r.aufD) && r.leg === 1, r.leg + " || " + r.aufD.slice(0, 400));
  ok("Familie mit Namen: Papi «Manuel & Sarah zahlen», Kind «Ich (Manuel) & Sarah zahlen»", /Manuel & Sarah zahlen/.test(alle(r.papi)) && /Ich \(Manuel\) & Sarah zahlen/.test(alle(r.kind)), alle(r.papi).slice(0, 80) + " || " + alle(r.kind).slice(0, 80));
  ok("Paar und Familie: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tTrinkgeld(b) {
  for (const [abs, mami, text] of [["Manuel", "Mami", "meine Mami"], ["David", "Marianne", "Marianne Werder"]]) {
    const p = await seite(b, { ls: kind(abs), buchungen: manuelBuch({ name: abs }), heute: "2027-01-08" });
    const r = await p.evaluate(() => {
      const bu = BUCH[0], t = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.innerText.replace(/\s+/g, " "); }, o = {};
      o.start = t(trinkHtml(bu)); trinkSetzen(bKey(bu), "aus"); o.aus = t(trinkHtml(bu)); o.betragAus = trinkBetrag(bu);
      trinkSetzen(bKey(bu), 16); o.mit = t(trinkHtml(bu)); o.betragMit = trinkBetrag(bu);
      const e = { arr: "2027-01-04", dep: "2027-01-07", nights: 3, frist: "2027-01-14" }, pp = { an: ["Anna"], pers: [{ n: "Anna Meier", a: 30, z: [], kk: false }], fuer: [], t: 100, fam: false, mit: [], z: [] };
      o.mitHinweis = inkText(e, pp, true); o.ohneHinweis = inkText(e, pp, false);
      return o;
    });
    ok("Trinkgeld (" + abs + "): Feld sichtbar, «Kein Trinkgeld für " + mami + "», kein Aufrunden", r.start.includes("Kein Trinkgeld für " + mami) && /Trinkgeld/.test(r.start) && !/ufrunden/.test(r.start), r.start);
    ok("Trinkgeld (" + abs + "): ausdrücklich aus zeigt «Kein Trinkgeld für " + mami + "», Betrag 0", r.aus.includes("Kein Trinkgeld für " + mami) && r.betragAus === 0, r.aus);
    ok("Trinkgeld (" + abs + "): Betrag 16 → «Zu überweisen» 1’270.00", /1.270\.00/.test(r.mit) && r.betragMit === 16, r.mit);
    ok("Rechnung an Freunde (" + abs + "): Hinweis mit Mami/Marianne und Adelboden, ohne Schalter kein Hinweis", r.mitHinweis.includes(text) && /nach Adelboden/.test(r.mitHinweis) && !/🍀/.test(r.ohneHinweis));
    await p.ctx.close();
  }
}

async function tRechnungSchalter(b) {
  const p = await seite(b, { ls: kind("Manuel"), buchungen: manuelBuch(), heute: "2027-01-08" });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {}, bu = BUCH[0];
    const e = { arr: "2027-01-04", dep: "2027-01-07", nights: 3, frist: "2027-01-14", tot: 100, kt: 0, ok: {}, p: [{ an: ["Anna"], pers: [{ n: "Anna Meier", a: 30, z: [["Übernachtung", "CHF 100.–"]], kk: false }], fuer: [], t: 100, fam: false, mit: [], z: [] }] };
    inkSetzen(bKey(bu), e); INK_SIG = ""; inkZeigen(); await w(300);
    const cb = () => document.querySelector("[data-ink-tr]"), href = () => decodeURIComponent((document.querySelector('a.btn[href*="wa.me"]') || { href: "" }).href);
    o.da = !!cb() && cb().checked; o.vorher = /🍀/.test(href());
    cb().click(); await w(300); o.aus = { checked: cb().checked, hinweis: /🍀/.test(href()), gespeichert: JSON.stringify(inkLokal()[bKey(bu)].tr) };
    cb().click(); await w(300); o.an = { checked: cb().checked, hinweis: /🍀/.test(href()) };
    return o;
  });
  ok("Rechnung an Freunde: Schalter pro Rechnung da und vorgewählt, Hinweis in der WhatsApp", r.da && r.vorher);
  ok("Rechnung an Freunde: Schalter aus = kein Hinweis, Wahl wird gespeichert, wieder an = Hinweis", !r.aus.checked && !r.aus.hinweis && r.aus.gespeichert === '{"0":false}' && r.an.checked && r.an.hinweis, JSON.stringify(r));
  ok("Rechnung an Freunde: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tAnsichtAls(b) {
  const p = await seite(b, { ls: kind("Manuel"), buchungen: manuelBuch(), heute: "2026-11-27", papi: true });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    TOKEN = "test"; o.vorschau = meinVorschau(); GM_SIG = ""; gmKindZeigen(); await w(300);
    const gm = () => [...document.querySelectorAll("[data-gmk]")], bu = BUCH[0];
    o.felder = gm().reduce((a, x) => a + x.querySelectorAll("input").length, 0); o.lauf = gm().some((x) => x.querySelector(".lauf")); o.kopf = gm().map((x) => x.innerText.replace(/\s+/g, " ").slice(0, 160)).join("|");
    o.ubLauf = /class="lauf"/.test(ubKlapp(bu)); o.reLauf = /class="lauf"/.test(rechDetails(bu.rechnung, bu.bestaetigt, true, bu));
    GM_LISTEN = {}; GM_LISTEN[bKey(bu)] = { gesendet: "2026-11-27T09:15", freunde: [{ vorname: "Anna", name: "Meier" }] }; GM_SIG = ""; gmKindZeigen(); await w(200);
    o.nach = { kopf: gm().map((x) => x.innerText.replace(/\s+/g, " ").slice(0, 120)).join("|"), ubLauf: /class="lauf"/.test(ubKlapp(bu)), name: (rechNameFn(bu) || ((x) => x))("Freund/in 1 zahlt") };
    GM_LISTEN = null; const bu2 = Object.assign({}, bu, { rechnung: bu.rechnung + "\n~\tG\tS. Meier\tT. Huber" });
    o.kuerzel = { ubLauf: /class="lauf"/.test(ubKlapp(bu2)), name: (rechNameFn(bu2) || ((x) => x))("Freund/in 2 zahlt") };
    return o;
  });
  ok("Ansicht als: Formular des Kindes bleibt original, Überschrift «Bitte sende uns nun noch die Liste …», Laufschrift", r.vorschau && r.felder > 5 && r.lauf && /Bitte sende uns nun noch/.test(r.kopf), r.kopf);
  ok("Ansicht als: Laufschrift auch in «Wer ist wann da?» und «Preisberechnung»", r.ubLauf && r.reLauf);
  ok("Ansicht als: Liste gesendet → «gesendet», keine Laufschrift, Name aus dem Briefkasten", /gesendet am/.test(r.nach.kopf) && !r.nach.ubLauf && r.nach.name === "Anna zahlt", JSON.stringify(r.nach));
  ok("Ansicht als: abgekürzter Name aus der Anfrage («T. Huber»), keine Laufschrift", !r.kuerzel.ubLauf && r.kuerzel.name === "T. Huber zahlt", JSON.stringify(r.kuerzel));
  ok("Ansicht als: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

async function tSchnappschuss(b) {
  const p = await seite(b, { ls: kind("Deborah"), heute: "2026-11-08", familie: { liste: { Deborah: { p: "David", k: ["Mael"] } } } });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    kalenderKlick("2026-12-12"); kalenderKlick("2026-12-15"); await w(400);
    const c = [...document.querySelectorAll("#f-art .zchip")].find((x) => /Normal/.test(x.textContent)); if (c) { c.click(); await w(400); }
    S.werArt = EIGEN; S.famSel = []; S.ichMit = true; normalize(); render(); await w(300);
    const f = (v, n, g) => ({ vorname: v, name: n, geschlecht: "w", geb: g || "1990-01-01", nat: "Schweiz" });
    localStorage.setItem("tm2t_gmEntwurf", JSON.stringify({ k: gmEntwurfKeyJetzt(), l: [f("Anna", "Meier"), f("Bea", "Zeller", "2010-05-05")] })); render(); await w(300);
    const L = schnappBer('<tr><td>Freund/in 1 zahlt</td><td>CHF 100.–</td></tr><tr><td>Freund/in 2 zahlt</td><td>CHF 100.–</td></tr>', '<tr><td>Anreise</td><td>Sa 12.12.2026</td></tr>', "", true, [[100, 0, 5, 0, 3], [100, 0, 5, 0, 3]], null);
    o.g = L.filter((z) => /^~\tG/.test(z)).map((z) => z.replace(/\t/g, "|"));
    const text = "Gesendet am Sa 12.12.2026, 10:00 Uhr. App-Version x.\nFreunde\t2\n" + L.join("\n"), bu = { name: "Deborah", arr: "2026-12-12", dep: "2026-12-15", pers: 3, betrag: 630, rechnung: text, bestaetigt: "2026-11-26T12:00" };
    TOKEN = "test"; ABSENDER = "";
    o.fn = (rechNameFn(bu) || ((x) => x))("Freund/in 1 zahlt und Freund/in 2"); const u = ubBuchung(bu); o.ubTyp = typeof u; o.ub = (String(u).match(/A\. Meier|B\. Zeller|Freund\/in \d/g) || []).join(",");
    return o;
  });
  ok("Anfrage speichert die abgekürzten Namen («~|G|A. Meier|B. Zeller»), nie Geburtsdatum", r.g.length === 1 && r.g[0] === "~|G|A. Meier|B. Zeller" && !/19|2010/.test(r.g[0]), JSON.stringify(r.g));
  ok("Anfrage: Namen erscheinen in Aufteilung und «Wer ist wann da?»", r.fn === "A. Meier zahlt und B. Zeller" && r.ub === "A. Meier,B. Zeller", r.fn + " | " + r.ub + " | " + r.ubTyp);
  await p.ctx.close();
}

async function tSonder(b) {
  const p = await seite(b, { ls: papiLs, papi: true });
  const r = await p.evaluate(async () => {
    const w = (ms) => new Promise((z) => setTimeout(z, ms)); const o = {};
    const tot = async (v, ge) => { sondStart(v); await w(300); S.werArt = EIGEN; S.famSel = []; S.ichMit = true; S.wer = "Nur ich"; S.gaeste = ge; S.reinig = REINIG[0]; S.zimmer = "Nein"; S.spar = "Nein"; S.waesche = S.waesche || "Persönlich bringen"; normalize(); render(); await w(300); const rr = calc(Object.assign({}, S, { kinderPflicht: !listeModus() })); return "CHF " + rr.TOT + (rr.ok ? "" : " " + JSON.stringify(Object.assign({}, rr, { d: 0 })).slice(0, 300)); };
    const base = { id: "a", name: "Papi", arr: "2027-01-04", dep: "2027-01-07", t: 1 };
    o.leer = await tot(Object.assign({ pa: false, reinB: null }, base), 0); o.r120 = await tot(Object.assign({ pa: false, reinB: 120 }, base), 0); o.r0 = await tot(Object.assign({ pa: false, reinB: 0 }, base), 0);
    const b1 = Object.assign({}, base, { id: "b", dep: "2027-01-05" }), b5 = Object.assign({}, base, { id: "c", dep: "2027-01-09" }), b3 = Object.assign({}, base, { id: "d", arr: "2027-01-07", dep: "2027-01-10" });
    o.pa1 = await tot(Object.assign({ pa: true, preis: 600, reinB: 120 }, b1), 0); o.pa5 = await tot(Object.assign({ pa: true, preis: 600, reinB: 120 }, b5), 0); o.pa3 = await tot(Object.assign({ pa: true, preis: 600, reinB: 120 }, b3), 0);
    o.altMit = await tot(Object.assign({ pa: true, preis: 600, rein: true }, b3), 0); o.altOhne = await tot(Object.assign({ pa: true, preis: 600, rein: false }, b3), 0);
    return o;
  });
  const z = (t) => (/CHF\s*([\d’'’]+)/.exec(t) || [])[1] && Number(/CHF\s*([\d’'’]+)/.exec(t)[1].replace(/[’'’]/g, ""));
  const e = [["leer", 450], ["r120", 330], ["r0", 210], ["pa1", 720], ["pa5", 3120], ["pa3", 1920], ["altMit", 2040], ["altOhne", 1800]];
  e.forEach(([k, soll]) => ok("Sonderbuchung " + k + " = CHF " + soll, z(r[k]) === soll, r[k]));
  await p.ctx.close();
}

async function tPreise(b) {
  for (const [schalter, famSoll] of [[null, 70], [{ famPausch: 80 }, 80]]) {
    const p = await seite(b, { ls: kind("Deborah"), schalter });
    const r = await p.evaluate(async () => {
      const w = (ms) => new Promise((z) => setTimeout(z, ms));
      kalenderKlick("2026-12-12"); kalenderKlick("2026-12-15"); await w(400);
      const c = [...document.querySelectorAll("#f-art .zchip")].find((x) => /Normal/.test(x.textContent)); if (c) { c.click(); await w(400); }
      S.werArt = EIGEN; S.famSel = []; S.ichMit = true; S.gaeste = 0; normalize(); render(); await w(500);
      const d = derive(S); return { FN: d.FN, nights: d.nights };
    });
    ok("Preis pro Nacht für die Familie " + famSoll + " (Control Panel " + (schalter ? "80" : "Standard") + "), 3 Nächte", r.FN === famSoll && r.nights === 3, JSON.stringify(r));
    await p.ctx.close();
  }
}

async function tNamenAufraeumen(b) {
  const alt = { name: "Rahel", arr: "2025-03-07", dep: "2025-03-10", pers: 3, betrag: 300, rechnung: "Anreise\tFr\nFreunde\t1\n~\tG\tA. Meier\nTotal laut Rechner\tCHF 300.–", bestaetigt: "2025-02-01T10:00" };
  const neu = { name: "Manuel", arr: "2027-01-04", dep: "2027-01-07", pers: 3, betrag: 300, rechnung: "Anreise\tMo\nFreunde\t1\n~\tG\tB. Zeller\nTotal laut Rechner\tCHF 300.–", bestaetigt: "2026-11-26T12:52" };
  const puts = []; const buch = { buchungen: [alt, neu], logbuch: [] };
  const api = (url, m, body) => {
    if (/contents\/buchungen\.json/.test(url)) { if (m === "GET") return { body: { sha: "x", content: b64(buch) } }; puts.push(JSON.parse(Buffer.from(JSON.parse(body).content, "base64").toString())); return { status: 200 }; }
    return null;
  };
  const p = await seite(b, { ls: papiLs, papi: true, buchungen: buch, api, heute: "2026-11-08" });
  const r = await p.evaluate(async () => {
    const o = {}; o.mitTest = (TOKEN = "test", await namenAufraeumen(), "ok");
    return o;
  });
  ok("Aufräumen: mit Test-Token passiert nichts", puts.length === 0, JSON.stringify(puts).slice(0, 80));
  await p.evaluate(async () => { TOKEN = "echt"; try { localStorage.removeItem("tm2_namenAuf"); localStorage.removeItem("tm2t_namenAuf"); } catch (e) {} await namenAufraeumen(); });
  const j = puts[0];
  ok("Aufräumen: Namen von Anfragen älter als 18 Monate werden entfernt, neuere bleiben", !!j && !/~\tG/.test(j.buchungen.find((x) => x.name === "Rahel").rechnung) && /~\tG\tB\. Zeller/.test(j.buchungen.find((x) => x.name === "Manuel").rechnung), JSON.stringify(j && j.buchungen.map((x) => x.rechnung)));
  ok("Aufräumen: Logbuch-Eintrag", !!j && j.logbuch.some((x) => /Namen der Freunde/.test(x.text)), JSON.stringify(j && j.logbuch));
  ok("Aufräumen: Rest der Anfrage bleibt (Betrag und Zeilen)", !!j && /Total laut Rechner/.test(j.buchungen.find((x) => x.name === "Rahel").rechnung));
  const n = puts.length; await p.evaluate(async () => { await namenAufraeumen(); });
  ok("Aufräumen: höchstens einmal pro Tag", puts.length === n);
  ok("Aufräumen: keine Fehler", p.fehler.length === 0, p.fehler.join("|"));
  await p.ctx.close();
}

(async () => {
  const s = await server(); const b = await chromium.launch();
  const lauf = [["Dateien", tDateien], ["Start", tStart], ["Control Panel", tControlPanel], ["Gültig ab", tGueltigAb], ["Gültig bis", tGueltigBis], ["Trinkgeld", tTrinkgeld], ["Rechnung an Freunde", tRechnungSchalter], ["Ansicht als", tAnsichtAls], ["Anfrage und Namen", tSchnappschuss], ["Sonderbuchungen", tSonder], ["SondAuf", tSondAufteilung], ["SondListe", tSondListe], ["SondNaechte", tSondNaechte], ["Paar", tPaar], ["SondNaechte2", (b) => tSondNaechte(b, true)], ["Preise", tPreise], ["Alte Namen aufräumen", tNamenAufraeumen]];
  const nur = process.argv[2];
  for (const [n, f] of lauf) { if (nur && !n.toLowerCase().includes(nur.toLowerCase())) continue; try { await f(b); } catch (e) { ok(n + ": Lauf abgebrochen", false, e.message); } }
  await b.close(); s.close();
  let fehl = 0; ERG.forEach((x) => { if (!x.ok) fehl++; console.log((x.ok ? "OK      " : "FEHLER  ") + x.name + (!x.ok && x.extra ? "\n          → " + String(x.extra).slice(0, 300) : "")); });
  console.log("\n" + (ERG.length - fehl) + " von " + ERG.length + " Prüfungen in Ordnung" + (fehl ? ", " + fehl + " FEHLER" : "."));
  process.exit(fehl ? 1 : 0);
})();
