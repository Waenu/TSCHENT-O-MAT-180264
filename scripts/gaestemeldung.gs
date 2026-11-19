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
 *   { a: "senden",   buchung: "Name|JJJJ-MM-TT|JJJJ-MM-TT", freunde: [ {name, vorname, geb, geschlecht, nat, an?, ab?}, ... ] }
 *   { a: "liste",    k: SCHLUESSEL }                      -> alle Listen
 *   { a: "loeschen", k: SCHLUESSEL, buchung: "…" }        -> Liste dieser Buchung entfernen
 *   { a: "mail",     name: "Jerome", mail: "…" }            -> Mailadresse eines Kindes oder Partners speichern
 *   { a: "melden",   name: "Miriam", an: true|false, test: true|false } -> Mail-Benachrichtigungen ein/aus (seit 3.17.0.0)
 *   (a: "liste" liefert zusätzlich die gespeicherten Mailadressen)
 *
 * Benachrichtigungen (seit 3.17.0.0): einmal die Funktion «einrichten» ausführen, dann läuft «taeglich» jeden Tag um 8 Uhr.
 * Sie liest die Buchungen der laufenden App und der Testversion und schickt den Kindern, die eingeschaltet haben, eine Mail:
 * Anreise-Wäsche (7 Tage vor der Anreise), Reinigungs-Checkliste (am Anreisetag), Liste der Freunde fehlt (2 Tage vor der Anreise),
 * Zahlung fällig (am Abreisetag), Zahlung überfällig (nach der Frist, danach jede Woche bis bezahlt).
 * Testversion: Mails gehen nur an MAIL (die Eltern), Betreff mit «🧪 TEST».
 */
const REPO_BUCHUNGEN = "https://raw.githubusercontent.com/Waenu/TSCHENT-O-MAT-180264/main/buchungen.json";
const REPO_TEST = "https://raw.githubusercontent.com/Waenu/TSCHENT-O-MAT-Test/main/buchungen.json";   // Testversion: Buchungsnummer beginnt mit «TEST:»
const MAX_FREUNDE = 5;
const BLATT = "Gaestemeldung";
const BLATT_MAIL = "Mailadressen";
const NAMEN = ["Jerome", "Deborah", "Miriam", "Manuel", "David", "Rahel", "Andreas", "Sarah"];

function doPost(e) {
  let a = {};
  try { a = JSON.parse(e.postData.contents); } catch (err) { return antwort({ ok: false, fehler: "Ungültige Anfrage." }); }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (a.a === "senden") return antwort(senden(a));
    if (a.a === "liste") return antwort(schluesselOk(a.k) ? { ok: true, listen: alleListen(), mails: alleMails() } : { ok: false, fehler: "Schlüssel falsch." });
    if (a.a === "mail") return antwort(mailSpeichern(a));
    if (a.a === "melden") return antwort(meldenSpeichern(a));
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
  const test = key.indexOf("TEST:") === 0; if (test) key = key.slice(5);   // Listen aus der Testversion gegen deren Buchungen prüfen
  const r = UrlFetchApp.fetch((test ? REPO_TEST : REPO_BUCHUNGEN) + "?t=" + Date.now(), { muteHttpExceptions: true });
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
    geschlecht: f.geschlecht === "w" || f.geschlecht === "m" ? f.geschlecht : "", nat: txt(f.nat, 40) || "Schweiz",
    an: /^\d{4}-\d{2}-\d{2}$/.test(f.an) && f.an >= teile[1] && f.an < teile[2] ? f.an : "", ab: /^\d{4}-\d{2}-\d{2}$/.test(f.ab) && f.ab <= teile[2] && f.ab > teile[1] ? f.ab : "" }));   // eigene An- und Abreise (App 3.19.0.0); leer = wie die Familie
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
      fr.map((f, n) => { const an = f.an || teile[1], ab = f.ab || teile[2], nn = Math.round((new Date(ab) - new Date(an)) / 86400000);
        return (n + 1) + ". " + f.name + " " + f.vorname + "\n   Geburtsdatum: " + d(f.geb) + "\n   Geschlecht: " + (f.geschlecht === "w" ? "weiblich" : "männlich") + "\n   Nationalität: " + f.nat +
          "\n   Aufenthalt: " + d(an) + " bis " + d(ab) + "\n   Nächte: " + nn; }).join("\n\n") +   // gegliedert, mit Nächten (seit App 3.19.0.3)
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

function mailBlatt() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName(BLATT_MAIL);
  if (!b) { b = ss.insertSheet(BLATT_MAIL); b.appendRow(["Name", "Mail", "Gespeichert"]); b.setFrozenRows(1); }
  if (b.getLastColumn() < 5) b.getRange(1, 4, 1, 2).setValues([["Meldungen", "Meldungen Test"]]);
  return b;
}
function mailSpeichern(a) {
  const name = txt(a.name, 30), mail = txt(a.mail, 120).toLowerCase();
  if (NAMEN.indexOf(name) < 0) return { ok: false, fehler: "Name unbekannt." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return { ok: false, fehler: "Mailadresse ungültig." };
  const jetzt = Utilities.formatDate(new Date(), "Europe/Zurich", "yyyy-MM-dd'T'HH:mm");
  const b = mailBlatt(), werte = b.getDataRange().getValues(), i = werte.findIndex((r, n) => n > 0 && r[0] === name);
  if (i > 0) b.getRange(i + 1, 1, 1, 3).setValues([[name, mail, jetzt]]); else b.appendRow([name, mail, jetzt]);
  return { ok: true };
}
function meldenSpeichern(a) {   // Schalter «Mail, wenn etwas zu tun ist» (seit 3.17.0.0)
  const name = txt(a.name, 30), test = a.test === true, an = a.an === true ? "Ja" : "Nein";
  if (NAMEN.indexOf(name) < 0) return { ok: false, fehler: "Name unbekannt." };
  const b = mailBlatt(), werte = b.getDataRange().getValues(), i = werte.findIndex((r, n) => n > 0 && r[0] === name);
  if (i < 0) { if (!test) return { ok: false, fehler: "Bitte zuerst die Mailadresse speichern." }; b.appendRow([name, "", "", "", ""]); return meldenSpeichern(a); }
  b.getRange(i + 1, test ? 5 : 4).setValue(an);
  return { ok: true, an: an };
}

// ---- Tägliche Benachrichtigungen (seit 3.17.0.0) ----
const APP_LIVE = "https://waenu.github.io/TSCHENT-O-MAT-180264/";
const APP_TEST = "https://waenu.github.io/TSCHENT-O-MAT-Test/";
const BLATT_GESENDET = "Meldungen gesendet";
const ER = { Jerome: "m", Manuel: "m", David: "m", Andreas: "m", Deborah: "w", Miriam: "w", Rahel: "w", Sarah: "w" };
function einrichten() {   // einmal von Hand ausführen: legt den Zeitplan «täglich um 8 Uhr» an (alte Zeitpläne für «taeglich» werden ersetzt)
  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === "taeglich").forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("taeglich").timeBased().atHour(8).everyDays(1).inTimezone("Europe/Zurich").create();
  return "Zeitplan eingerichtet: täglich um 8 Uhr.";
}
function gesendetBlatt() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName(BLATT_GESENDET);
  if (!b) { b = ss.insertSheet(BLATT_GESENDET); b.appendRow(["Meldung", "Gesendet am"]); b.setFrozenRows(1); }
  return b;
}
function taeglich() {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try { [false, true].forEach((test) => { try { meldungenSenden(test); } catch (err) { Logger.log((test ? "Test: " : "") + err); } }); }
  finally { lock.releaseLock(); }
}
function tag(k, n) { const d = new Date(k + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function dmy(k) { return k.slice(8, 10) + "." + k.slice(5, 7) + "." + k.slice(0, 4); }
function meldungenSenden(test) {
  const r = UrlFetchApp.fetch((test ? REPO_TEST : REPO_BUCHUNGEN) + "?t=" + Date.now(), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Buchungen nicht lesbar (" + r.getResponseCode() + ")");
  const j = JSON.parse(r.getContentText()), heute = Utilities.formatDate(new Date(), "Europe/Zurich", "yyyy-MM-dd");
  let zahlTage = 7;
  try { const e = UrlFetchApp.fetch((test ? APP_TEST : APP_LIVE) + "einstellungen.json?t=" + Date.now(), { muteHttpExceptions: true }); if (e.getResponseCode() === 200) { const ej = JSON.parse(e.getContentText()); if (typeof ej.zahlTage === "number") zahlTage = ej.zahlTage; } } catch (err) {}
  const mails = {}; mailBlatt().getDataRange().getValues().slice(1).forEach((z) => { if (z[0] && (test ? z[4] === "Ja" : z[3] === "Ja" && z[1])) mails[String(z[0])] = test ? eig("MAIL") : String(z[1]); });
  if (!Object.keys(mails).length) return;
  const listen = {}; alleListen().forEach((l) => { listen[l.buchung] = true; });
  const gb = gesendetBlatt(), log = {}; gb.getDataRange().getValues().slice(1).forEach((z) => { if (z[0]) log[String(z[0])] = z[1] instanceof Date ? Utilities.formatDate(z[1], "Europe/Zurich", "yyyy-MM-dd") : String(z[1]).slice(0, 10); });
  (j.buchungen || []).forEach((b) => {
    const name = String(b.name || "").trim(), an = mails[name];
    if (!an || !b.arr || !b.dep || b.status === "storniert" || b.status === "abgelehnt" || b.storniert) return;
    const key = (test ? "TEST:" : "") + [name, b.arr, b.dep].join("|"), zeit = "deinen Aufenthalt vom " + dmy(b.arr) + " bis " + dmy(b.dep);
    const m = []; const neu = (art) => !log[key + "#" + art];
    const fr = /^Freunde\t(\d+)/m.exec(String(b.rechnung || "")), freunde = fr ? Number(fr[1]) : 0;
    if (((b.sb && b.rolle !== "start") || b.lg) && heute >= tag(b.arr, -7) && heute < b.arr && neu("w"))
      m.push(["w", "Anreise-Wäsche ab heute bereit", "In deinem TSCHENT-O-MAT ist jetzt die Liste «Anreise-Wäsche» für " + zeit + " aktiv. Bitte pack die Wäsche ein und hake sie in der Liste ab."]);
    if (heute >= b.arr && heute <= b.dep && neu("c"))
      m.push(["c", "Reinigungs-Checkliste ist aktiv", "In deinem TSCHENT-O-MAT ist jetzt die «Reinigungs-Checkliste» für " + zeit + " aktiv. Bitte hake vor der Abreise alles ab."]);
    if (freunde > 0 && !listen[key] && heute >= tag(b.arr, -2) && heute <= b.dep && neu("l"))
      m.push(["l", "Liste der Freunde fehlt noch", "Für " + zeit + " fehlt noch die Liste deiner Freunde für die Kurtaxe. Bitte sende sie im TSCHENT-O-MAT unter «👤 Meine Verwaltung»."]);
    const offen = b.betrag > 0 && !b.bezahlt && !b.prov, frist = tag(b.dep, zahlTage);
    if (offen && heute >= b.dep && heute <= frist && neu("z"))
      m.push(["z", "Zahlung fällig bis " + dmy(frist), "Für " + zeit + " ist die Zahlung fällig. Bitte überweise den Betrag bis am " + dmy(frist) + ". Den genauen Betrag siehst du im TSCHENT-O-MAT unter «👤 Meine Verwaltung»."]);
    if (offen && heute > frist && (!log[key + "#u"] || heute >= tag(log[key + "#u"], 7)))
      m.push(["u", "Zahlung überfällig", "Für " + zeit + " ist die Zahlung seit dem " + dmy(frist) + " überfällig. Bitte überweise den Betrag so bald wie möglich. Den genauen Betrag siehst du im TSCHENT-O-MAT unter «👤 Meine Verwaltung»."]);
    m.forEach(([art, betr, text]) => {
      const anrede = (ER[name] === "m" ? "Lieber " : "Liebe ") + name + ",";
      const body = (test ? "🧪 TEST (Testversion, eigentlich an " + name + ")\n\n" : "") + anrede + "\n\n" + text + "\n\n" + (test ? APP_TEST : APP_LIVE) + "\n\nDiese Mail kommt automatisch, weil du die Benachrichtigungen im TSCHENT-O-MAT unter «👤 Meine Verwaltung» › Profil eingeschaltet hast. Dort kannst du sie auch wieder ausschalten.";
      MailApp.sendEmail({ to: an, subject: (test ? "🧪 TEST " : "") + "TSCHENT-O-MAT: " + betr + " (" + dmy(b.arr) + "–" + dmy(b.dep) + ")", body: body, name: "TSCHENT-O-MAT" });
      const k = key + "#" + art, d = gb.getDataRange().getValues(), i = d.findIndex((z, n) => n > 0 && z[0] === k);
      if (i > 0) gb.getRange(i + 1, 2).setValue(heute); else gb.appendRow([k, heute]);
      log[k] = heute;
    });
  });
}
function alleMails() {
  return mailBlatt().getDataRange().getValues().slice(1).filter((r) => r[0]).map((r) => ({ name: String(r[0]), mail: String(r[1]), datum: r[2] instanceof Date ? Utilities.formatDate(r[2], "Europe/Zurich", "yyyy-MM-dd'T'HH:mm") : String(r[2]) }));
}
