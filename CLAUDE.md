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
Stand beim Schreiben: 2.118.1.0.

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

## Offene Themen (Stand 10.11.2026, abends, Version 2.120.6.0)
1. Mailadresse beim ersten Öffnen: Kinder und Partner geben sie zweimal ein, ohne Kopieren; ohne Eingabe geht es nicht weiter. Ablage über den Briefkasten, in der Verwaltung bei der Person sichtbar. Für den Versand der Gästekarten.
2. Termin kürzen bei Konflikt (Vorbehalt kollidiert teilweise mit Airbnb-Gast): von Hand in der Verwaltung als weitere Zeile in «Zu tun», Kind bekommt WhatsApp mit den neuen Daten.
3. Fehler bei «Einnahmen» («reading 'split'»): nicht nachstellbar, Wänu meldet sich.
4. Zahlung: Knopf «Zahlung eingegangen» erscheint erst nach der Abreise; Wänu fragt, ob früher nötig.
5. Stornierung 30 Tage für externe Gäste in Februar und Hochsaison, Regel danach offen.
6. Reinigungsliste: Marianne gibt noch ihre Meinung (später nachfragen). Gartenkissen und Liegestühle stehen seit 2.120.3.0 in allen Listen (Annahme, Wänu prüft).
7. Testdaten: Deborah 18.–21.11.2026, Miriam 10.–13.12.2026, Manuel 1.–4.3.2027, David 24.–27.3.2027 sind Tests; vor Version 3 entfernen (nur auf Wänus Ja). Davids persönlichen Link nach dem Test erneuern.
8. Wänu testet am 11.11.2026 ausgiebig: Kurzfilm Saisons, Reinigung ab 18, Minderjährige, Wäsche (Geschirrtücher, ungewaschen zurück), Checkliste in einem Stück, Trennung Partner/Kind, Anreise-Wäsche für späteren Aufenthalt, Staffelbeginn abgesagt (Wäsche-Info an den Nächsten).
9. Bei «Meine Familie und Geschwister» kennt die App die Zahl der Enkel nicht; bei der Reinigung «nach Personen» zählen dort alle ausser Kleinkindern.

Erledigt 10.11.2026 abends: Kurzfilm Saisons (2.120.0.x), Beherbergungsabgabe im Glossar, Backup eingerichtet, Gästemeldung getestet, Test-Stornos entfernt.
Erledigt: Haftung, Bedingungen, Stornierung als Kapitel, gelber Hilfeknopf (2.118.x). Liste «Zu tun» pro Buchung (2.117.0.0). Gästemeldung (2.116.x). Verwaltung neu, Schritte A bis C (2.114.0.0 bis 2.115.1.0). Kurtaxe für Freunde (2.113.0.0 und 2.113.0.1). Beträge fix im Code (P.kurtaxe, kurtaxeBeherb, kurtaxeKind), nicht aus der aktuellen Verordnung.
