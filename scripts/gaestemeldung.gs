/**
 * TSCHENT-O-MAT: Briefkasten für die Gästemeldung der Freunde (Kurtaxe Adelboden)
 *
 * Läuft als Google Apps Script in einer privaten Google-Tabelle im Konto der Eltern.
 * Hier im öffentlichen Repo stehen keine Personendaten und kein Schlüssel:
 * Mailadresse und Schlüssel werden beim Einrichten in den Script-Eigenschaften eingetragen.
 *
 * Script-Eigenschaften (Projekteinstellungen > Script-Eigenschaften):
 *   MAIL        Adresse, an die jede neue Liste geschickt wird
 *   SCHLUESSEL  frei gewählter Schlüssel; nur wer ihn kennt, kann die Listen lesen und löschen
 *
 * Aufrufe (immer POST, Inhalt JSON als Text):
 *   { a: "senden",   buchung: "Name|JJJJ-MM-TT|JJJJ-MM-TT", freunde: [ {name, vorname, geb, geschlecht, nat}, ... ] }
 *   { a: "liste",    k: SCHLUESSEL }                      -> alle Listen
 *   { a: "loeschen", k: SCHLUESSEL, buchung: "…" }        -> Liste dieser Buchung entfernen
 */
const REPO_BUCHUNGEN = "https://raw.githubusercontent.com/Waenu/TSCHENT-O-MAT-180264/main/buchungen.json";
const MAX_FREUNDE = 5;
const BLATT = "Gaestemeldung";

function doPost(e) {
  let a = {};
  try { a = JSON.parse(e.postData.contents); } catch (err) { return antwort({ ok: false, fehler: "Ungültige Anfrage." }); }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (a.a === "senden") return antwort(senden(a));
    if (a.a === "liste") return antwort(schluesselOk(a.k) ? { ok: true, listen: alleListen() } : { ok: false, fehler: "Schlüssel falsch." });
    if (a.a === "loeschen") return antwort(schluesselOk(a.k) ? loeschen(String(a.buchung || "")) : { ok: false, fehler: "Schlüssel falsch." });
    return antwort({ ok: false, fehler: "Unbekannter Aufruf." });
  } catch (err) {
    return antwort({ ok: false, fehler: "Fehler im Briefkasten: " + err });
  } finally {
    lock.releaseLock();
  }
}
function doGet() { return antwort({ ok: true, info: "TSCHENT-O-MAT Briefkasten läuft." }); }

function antwort(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function eig(n) { return PropertiesService.getScriptProperties().getProperty(n) || ""; }
function schluesselOk(k) { const s = eig("SCHLUESSEL"); return s.length >= 8 && String(k || "") === s; }
function blatt() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName(BLATT);
  if (!b) { b = ss.insertSheet(BLATT); b.appendRow(["Buchung", "Name", "Anreise", "Abreise", "Gesendet", "Freunde (JSON)"]); b.setFrozenRows(1); }
  return b;
}
function txt(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n); }

// Spamschutz: nur für eine bestätigte, noch nicht vergangene Buchung mit Freunden (Buchungsnummer = Name|Anreise|Abreise)
function buchungPruefen(key) {
  const r = UrlFetchApp.fetch(REPO_BUCHUNGEN + "?t=" + Date.now(), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Buchungen nicht lesbar (" + r.getResponseCode() + ")");
  const j = JSON.parse(r.getContentText()), heute = Utilities.formatDate(new Date(), "Europe/Zurich", "yyyy-MM-dd");
  const b = (j.buchungen || []).find((x) => x && [String(x.name).trim(), x.arr, x.dep].join("|") === key && x.status !== "storniert" && x.status !== "abgelehnt");
  if (!b || b.dep < heute) return 0;
  const m = /^Freunde\t(\d+)/m.exec(String(b.rechnung || ""));
  return m ? Math.min(Number(m[1]), MAX_FREUNDE) : 0;
}

function senden(a) {
  const key = txt(a.buchung, 80), teile = key.split("|");
  if (teile.length !== 3 || !/^\d{4}-\d{2}-\d{2}$/.test(teile[1]) || !/^\d{4}-\d{2}-\d{2}$/.test(teile[2])) return { ok: false, fehler: "Buchungsnummer ungültig." };
  const max = buchungPruefen(key);
  if (!max) return { ok: false, fehler: "Zu dieser Buchung gibt es keine Freunde zu melden." };
  const fr = (Array.isArray(a.freunde) ? a.freunde : []).slice(0, max).map((f) => ({
    name: txt(f.name, 60), vorname: txt(f.vorname, 60), geb: /^\d{4}-\d{2}-\d{2}$/.test(f.geb) ? f.geb : "",
    geschlecht: f.geschlecht === "w" || f.geschlecht === "m" ? f.geschlecht : "", nat: txt(f.nat, 40) || "Schweiz" }));
  if (!fr.length || fr.some((f) => !f.name || !f.vorname || !f.geb || !f.geschlecht)) return { ok: false, fehler: "Bitte alle Felder ausfüllen." };
  const jetzt = Utilities.formatDate(new Date(), "Europe/Zurich", "yyyy-MM-dd'T'HH:mm");
  const b = blatt(), werte = b.getDataRange().getValues();
  const zeile = [key, teile[0], teile[1], teile[2], jetzt, JSON.stringify(fr)];
  let i = werte.findIndex((r, n) => n > 0 && r[0] === key);
  if (i > 0) b.getRange(i + 1, 1, 1, zeile.length).setValues([zeile]); else b.appendRow(zeile);
  const mail = eig("MAIL");
  if (mail) {
    const d = (k) => k.slice(8, 10) + "." + k.slice(5, 7) + "." + k.slice(0, 4);
    const text = "Gästemeldung von " + teile[0] + " für den Aufenthalt vom " + d(teile[1]) + " bis " + d(teile[2]) + (i > 0 ? " (geänderte Liste)" : "") + ":\n\n" +
      fr.map((f, n) => (n + 1) + ". " + f.name + " " + f.vorname + ", geboren " + d(f.geb) + ", " + (f.geschlecht === "w" ? "weiblich" : "männlich") + ", " + f.nat).join("\n") +
      "\n\nDie Liste steht auch im TSCHENT-O-MAT in der Verwaltung bei " + teile[0] + ".";
    MailApp.sendEmail(mail, "TSCHENT-O-MAT: Gästemeldung " + teile[0] + ", " + d(teile[1]), text);
  }
  return { ok: true, gesendet: jetzt, anzahl: fr.length };
}

function alleListen() {
  const werte = blatt().getDataRange().getValues();
  return werte.slice(1).filter((r) => r[0]).map((r) => {
    let fr = []; try { fr = JSON.parse(r[5]); } catch (err) {}
    const g = r[4] instanceof Date ? Utilities.formatDate(r[4], "Europe/Zurich", "yyyy-MM-dd'T'HH:mm") : String(r[4]);
    return { buchung: String(r[0]), gesendet: g, freunde: fr };
  });
}

function loeschen(key) {
  const b = blatt(), werte = b.getDataRange().getValues();
  for (let i = werte.length - 1; i > 0; i--) if (werte[i][0] === key) b.deleteRow(i + 1);
  return { ok: true };
}
