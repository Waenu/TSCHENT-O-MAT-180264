# TSCHENT-O-MAT: Projektübergabe für Claude Code

Dieses Dokument fasst Projekt, Regeln und Arbeitsweise zusammen. Es ersetzt den bisherigen Chatverlauf.

## Projekt
- Preisrechner, Buchungskalender und Verwaltung für Familienaufenthalte im Chalet Tschenten (Adelboden). Der Besitzer heisst Wänu (Silvan), pensionierter Servicetechniker, wohnt in Densbüren AG.
- Dieses Repo (Vorschau): `Waenu/TSCHENT-O-MAT-180264`, öffentlich. Seite: https://waenu.github.io/TSCHENT-O-MAT-180264/
- Live-Version 1.10.5 liegt im Repo `Waenu/Tschentomat`. Sie wird NICHT verändert. Der Wechsel auf «Version 3» ist allein Wänus Entscheid.
- Dort läuft auch die Belegung: Workflow `.github/workflows/belegung.yml` (stündlich, Minute 17) holt per `.github/scripts/belegung.py` den Airbnb-iCal (Secret `AIRBNB_ICAL`) und schreibt `belegt.json`. Die App liest `/Tschentomat/belegt.json`.

## Dateien
- `index.html`: die ganze App, eine Datei mit Vanilla JS und CSS (ca. 5700 Zeilen). Kein Build-Schritt.
- `einstellungen.json`: Einstellungen und Version. Die Dateigrösse muss exakt 3024 Bytes bleiben (still prüfen, nicht in Meldungen erwähnen).
- `versionen.json`: Versionsverlauf, neueste zuerst, Schlüssel `versionen`, Einträge `{"v","datum","titel","arten":[...],"punkte":[...]}`.
- `sw.js` Service Worker, `buchungen.json`, `gaeste.json` Daten.
- Öffentliches Repo: keine Passwörter, Zugangscodes, IBAN oder Zahlungsdaten, keine Personendaten ins Repo.

## Versionsnummern (vier Stellen)
1. Stelle bleibt 2.
2. Stelle: neue Funktion (zählt ohne Obergrenze hoch, also 2.99, 2.100, 2.101).
3. Stelle: funktionelle Änderung oder Regeländerung.
4. Stelle: Layout, Text oder Fehlerkorrektur.
Stand beim Schreiben: 2.116.0.0.

## Versionsänderung (Ablauf)
1. In `index.html` genau eine Stelle `let VERSION = "…"` ändern (vorher prüfen, dass sie genau einmal vorkommt).
2. In `einstellungen.json` `"version": "…"` auf Bytes-Ebene ersetzen, Dateigrösse 3024 prüfen.
3. In `versionen.json` oben einen Eintrag einfügen (UTF-8, `ensure_ascii=False`, Einrückung 2, Zeilenumbruch am Ende). `arten` z. B. «Layout», «Fehler», «Text».
4. Syntax prüfen: das längste `<script>` aus `index.html` extrahieren und mit `new Function(...)` parsen.

## Push
Nur nach ausdrücklichem «ja» oder «push» von Wänu. Danach:
```
git add index.html einstellungen.json versionen.json
git commit -m "x.y.z.w: Titel"
git pull --rebase origin main
git push origin HEAD:main
```
Anschliessend prüfen, dass `origin/main:einstellungen.json` die neue Version trägt. Commit-Text endet mit der von der Sitzung vorgegebenen Co-Authored-By-Zeile.

## Testen
- Lokaler Server: `python -m http.server 8771` im Repo-Ordner (unter Windows `py -m http.server 8771`).
- Playwright mit blockiertem Service Worker; Routen `**/belegt.json*` mit Testdaten füllen, `**/einladungen.json*` und `**api.github.com/**` abbrechen.
- Kind-Ansicht: localStorage `tm2_absender='Miriam'` und `tm2_namefix='1'`. Papi-Ansicht: `tm2_token='test'` plus `tm2_absender='Wänu'`.
- Datum fixieren mit `?heute=2026-11-08`. Monat setzen mit `calY=…;calM=…;kalenderKlick('');renderKalender();`.
- Der Kalender liegt in eingeklappten `details`: für Screenshots alle Vorfahren öffnen und feste Overlays ausblenden.
- Dunkler Modus ist wichtig: die Kinder starten die App im dunklen Modus.

## Arbeitsregeln (Wänus Vorgaben)
- Ansprache «Wänu», Antwort auf Hochdeutsch mit Schweizer Rechtschreibung, niemals «ß» (immer «ss»).
- Direkt und ehrlich. Bei Widerspruch zählt die aktuelle Nachricht. Unsicheres offen sagen.
- Annahmen mit Buchstaben kennzeichnen: (a), (b), (c). Offene Punkte nummerieren (1, 2, 3), Rückfragen 1a, 1b, orange markiert (🟠).
- Bei Projekten: zuerst seine Vorschläge Punkt für Punkt auflisten, ehrliche Empfehlung mit Begründung nennen, auf Bestätigung warten.
- Immer vor einem Push fragen. Nie etwas löschen, ohne zu fragen.
- Antwort zuerst, dann Begründung. Bei einfachen Fragen kurz.
- Immer sagen, was getestet wurde und was nicht.
- CHF, Schweizer Normen und Recht. Windows 11.
- Keine Hinweise, etwas auf dem Galaxy S10 zu testen.
- Texte in der App: positiv und einladend. Kinder nennen die Eltern «Papi» und «Mami». Mehr Wortregeln stehen in den Texten der App selbst.

## Offene Themen (Stand 10.11.2026)
1. Mailadresse beim ersten Öffnen (zweimal eingeben, ohne Kopieren) für den Versand der Gästekarten, Ablage in der Verwaltung.
2. Gästemeldung der Freunde (App gebaut in 2.116.0.0, Script `scripts/gaestemeldung.gs`; offen: Wänu richtet den Briefkasten ein, danach `GM_URL` in index.html setzen und echt testen): Der Buchende füllt pro Freund aus (Name, Vorname, Geburtsdatum, Geschlecht nur weiblich/männlich, Nationalität mit Vorgabe Schweiz), maximal 5. Daten gehen an einen eigenen Briefkasten (Google-Apps-Script im Konto des Besitzers mit privater Tabelle), keine Personendaten im Repo. Mail an Wänu, Liste in der Verwaltung unter dem Buchenden, jedes Feld mit Kopiersymbol, Knopf «Alles entfernen» (löscht auch in der Tabelle). Nur Meldungen mit gültiger Buchungsnummer.
3. Haftung/Handlauf: Häkchen bei Buchungen mit Freunden. Wortlaut prüft Wänu selbst.
4. Stornierung 30 Tage für externe Gäste in Februar und Hochsaison. Regel nach den 30 Tagen noch offen.
5. Hilfeknopf: nur beim ersten Öffnen zeigen, Knopf «Verstanden», immer sichtbar, in Gelb.
6. Punkt nach dem Symbol (🧹, 🔗) in einigen Texten.
7. Erklärclip zum Buchungsablauf (nur Text, 60 bis 90 Sekunden): eine Buchung durchspielen und die Legende zeigen, damit man schnell sieht, dass es verschiedene Saisons mit verschiedenen Möglichkeiten gibt (Jerome hat das nicht verstanden). Kommt später.
8. Hinweis zur Airbnb-Verzögerung bei der Sperrung.
9. Termin kürzen bei Konflikt.
10. Fehler bei «Einnahmen»: «Cannot read properties of undefined (reading 'split')».
11. Backup der GitHub-Repos auf OneDrive.
12. Reinigungsliste.
13. Wofür die Beherbergungsabgabe von CHF 1.00 verwendet wird, klärt Wänu noch ab (dann im Kapitel «Kurtaxe und Gästekarte» ergänzen).

Erledigt: Verwaltung neu, Schritte A bis C (2.114.0.0 bis 2.115.1.0). Kurtaxe für Freunde (2.113.0.0 und 2.113.0.1). Beträge fix im Code (P.kurtaxe, kurtaxeBeherb, kurtaxeKind), nicht aus der aktuellen Verordnung.
