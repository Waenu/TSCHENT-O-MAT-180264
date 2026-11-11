# TSCHENT-O-MAT: Projektübergabe für Claude Code

Dieses Dokument fasst Projekt, Regeln und Arbeitsweise zusammen. Es ersetzt den bisherigen Chatverlauf.

## Projekt
- Preisrechner, Buchungskalender und Verwaltung für Familienaufenthalte im Chalet Tschenten (Adelboden). Der Besitzer heisst Wänu (Silvan), pensionierter Servicetechniker, wohnt in Densbüren AG.
- Dieses Repo (Vorschau): `Waenu/TSCHENT-O-MAT-180264`, öffentlich. Seite: https://waenu.github.io/TSCHENT-O-MAT-180264/
- Seit 11.11.2026 ist dieses Repo mit Version 3.0.0.0 die freigegebene App (Meilenstein). Das alte Repo `Waenu/Tschentomat` (1.10.5) wird NICHT verändert und darf nie gelöscht oder umbenannt werden, weil dort die Belegung läuft.
- Dort läuft auch die Belegung: Workflow `.github/workflows/belegung.yml` (stündlich, Minute 17) holt per `.github/scripts/belegung.py` den Airbnb-iCal (Secret `AIRBNB_ICAL`) und schreibt `belegt.json`. Die App liest `/Tschentomat/belegt.json`.

## Dateien
- `index.html`: die ganze App, eine Datei mit Vanilla JS und CSS (ca. 6800 Zeilen). Kein Build-Schritt.
- `einstellungen.json`: Einstellungen und Version. Die Dateigrösse muss exakt 3024 Bytes bleiben (still prüfen, nicht in Meldungen erwähnen).
- `versionen.json`: Versionsverlauf, neueste zuerst, Schlüssel `versionen`, Einträge `{"v","datum","titel","arten":[...],"punkte":[...]}`.
- `sw.js` Service Worker, `buchungen.json`, `gaeste.json` Daten.
- Öffentliches Repo: keine Passwörter, Zugangscodes, IBAN oder Zahlungsdaten, keine Personendaten ins Repo.

## Versionsnummern (vier Stellen, strikt einhalten)
1. Stelle: Hauptversion, seit der Freigabe 3. Ändert nur auf Wänus Entscheid.
2. Stelle: neue Funktion (zählt ohne Obergrenze hoch: 3.1.0.0, 3.2.0.0 …).
3. Stelle: funktionelle Änderung oder Regeländerung.
4. Stelle: Layout, Text oder Fehlerkorrektur.
Eine höhere Stelle setzt die tieferen auf 0. Stand beim Schreiben: 3.0.0.0.

## Versionsänderung (Ablauf)
1. In `index.html` genau eine Stelle `let VERSION = "…"` ändern (vorher prüfen, dass sie genau einmal vorkommt).
2. In `einstellungen.json` `"version": "…"` auf Bytes-Ebene ersetzen, Dateigrösse 3024 prüfen.
3. In `versionen.json` oben einen Eintrag einfügen (UTF-8, `ensure_ascii=False`, Einrückung 2, Zeilenumbruch am Ende). `arten` z. B. «Layout», «Fehler», «Text».
4. Syntax prüfen: das längste `<script>` aus `index.html` extrahieren und mit `new Function(...)` parsen.

## Push
Nur nach ausdrücklichem «ja» oder «push» von Wänu. Danach:
```
git add index.html einstellungen.json versionen.json   # bei Bedarf auch manifest.json, CLAUDE.md
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

## Offene Themen (Stand 11.11.2026, abends, Version 3.0.0.0)
1. Erledigt 11.11.2026: Version 3.0.0.0 freigegeben (Historie «Meilenstein: Version 3 freigegeben» mit Übersicht aller Funktionen). Manifest und Seitentitel ohne «Vorschau», Name auf dem Startbildschirm «TSCHENT-O-MAT». Wänu verschickt die WhatsApp-Ankündigung (Gruppe ohne Link, mit Hinweis auf Startbildschirm) und jedem einzeln den persönlichen Link aus der Verwaltung.
1b. Erledigt: Niemand in der Familie hat ein iPhone (Wänu, 11.11.2026). Startbildschirm-Hinweis im Text für Chrome und Samsung Internet.
1c. Marianne: weiterhin die Speziallösung …/#mami=CODE (nur Ansehen, Kopf «Mariannes»), nicht über die persönlichen Links der Verwaltung. Code kennt nur Wänu.
2. Persönliche Links: alle acht vergeben. Wo in der Verwaltung «hier nicht sichtbar» steht, erzeugt Wänu den Link vor dem Versand neu.
3. Real noch nicht getestet (nur mit nachgestellten Daten): Storno mit Änderungsmeldung an den neuen Staffelbeginn, Endreinigung der Staffel samt Zahlung, Kopf «Mariannes».
4. Offen bei Wänu: Reinigungskosten unter 18; ob Davids Mail in der Verwaltung ankommt; Fehler «Einnahmen» («reading 'split'») falls er wieder auftritt; Endreinigung vor einem Airbnb-Gast («ein Tag vor Ankunft» oder Zeitfenster Abreise bis Ankunft, heute Zeitfenster).
5. Bei «Meine Familie und Geschwister» kennt die App die Zahl der Enkel nicht; bei der Reinigung «nach Personen» zählen dort alle ausser Kleinkindern.
6. Daten: nur Jerome 6.–9.5.2027 (echt). Testanfragen sind entfernt.

## Gebaut am 11.11.2026 (2.122.3.0 bis 3.0.0.0)
- Kopf: schwarz in beiden Modi, Spitzname in Gold (Schrift «Great Vibes», lokal in fonts/): Jerrys, Debys, Miris, Mänsis, Daves, Andys, Rahels, Sarahs; Eltern Wänus und Mariannes. Spitznamen nur im Kopf (SPITZNAME). Unten «Version …» und Versionshistorie.
- Testmodus: dreimal auf den 🎰 im Kopf tippen (in der Versionshistorie geschwärzt, ebenso das versteckte Menü).
- Angebote: in der Staffelzeit auch ohne Buchung «Staffel beginnen: ab heute (Staffelzeit bis …)»; Beschriftung wechselt alle 4 s zwischen Lücken und «Es ist Staffelzeit». Auswahl bündig unter dem Kalendersymbol; offener Kalender: ganzes Kästchen grün.
- Hochsaison unter 7 Nächten: dunkelrote Meldung oben im Rechner «Mit Vorbehalt … verbindlich erst ab 7 Nächten».
- Gruss unter jeder WhatsApp der Eltern (grussVon): Kinder «Liebe Grüsse, Papi und Mami», Partner «Liebe Grüsse, Silvan und Marianne». Texte in der Wir-Form.
- Storno: «❌ Stornieren» (Eintrag bleibt grau mit Datum; Aufgaben Storno-Bestätigung, In Airbnb freigeben, Aus Pimlical austragen) und «🗑️ Endgültig löschen» (keine Spur, keine Meldung beim Kind; für Tests). Kinder: «Stornierung anfragen» auf der Startseite (WhatsApp an die Eltern). Bei Kindern nur «Bei Änderungen melde dich».
- Rolle in der Staffel (rolle: start/folge, beim Bestätigen, Bescheid und bei der Änderungsmeldung gespeichert): weicht sie von der aktuellen Lage ab, erscheint rot «🔔 Änderung: … informieren» (beide Richtungen), Hinweis auch beim Kind. stornoVor() nennt, wer abgesagt hat; staffelBeginner() wer jetzt beginnt.
- Endreinigung der Staffel: bei der letzten Gruppe einer geschlossenen Staffel «🪣 Endreinigung» mit Anteilen, Frist 7 Tage nach deren Abreise, eigener Zahlungshaken (endreinBezahlt), beim Kind auf der Startseite. Mitgeteilt im Bescheid oder in der Staffel-Ende-Info (eine Nachricht statt drei); separat nur, wenn sich die Anteile danach ändern (endreinAnteile).
- Verwaltung: Legende (rot dringend, weiss offen, grün erledigt); bei dringenden Aufgaben Titel weiss, Kästchen und Hinweis rot.
- Texte: Willkommen (statt Benutzung) mit «Neu: Ferien können gratis sein, auch in der Hochsaison»; Cheminée-Anleitung «So bedienst du das Cheminée richtig», Unterschrift «die Eltern»; Reissverschluss-Hinweis; «ungewaschen» gelb; IBAN und SLF im Glossar Zahlung; Preise «weit unter den Marktpreisen».
- Reinigungstag (2.126.0.0): Papi tippt im Kalender einen Tag an und setzt den Reinigungstag (jj.reinigung [{tag, ab}], REIN_TAGE). Von der letzten Abreise davor bis dahin ist gesperrt (reinSperrBerechnen in belegtMischen, reinFilter am Ende von berechneLuecken), 🧽 im Kalender, Warnung reinZuSpaet bei Airbnb-Ankunft davor, Reinigungsliste Art «geplant».
- Fehler behoben: Mailabfrage zeigte nach einem neuen Link kurz den alten Namen; Suche in der Hilfe zeigt nur Fliesstext; Seite nicht seitlich verschiebbar (overflow-x: clip).

Erledigt 10.11.2026 abends: Kurzfilm Saisons (2.120.0.x), Beherbergungsabgabe im Glossar, Backup eingerichtet, Gästemeldung getestet, Test-Stornos entfernt.
Erledigt: Haftung, Bedingungen, Stornierung als Kapitel, gelber Hilfeknopf (2.118.x). Liste «Zu tun» pro Buchung (2.117.0.0). Gästemeldung (2.116.x). Verwaltung neu, Schritte A bis C (2.114.0.0 bis 2.115.1.0). Kurtaxe für Freunde (2.113.0.0 und 2.113.0.1). Beträge fix im Code (P.kurtaxe, kurtaxeBeherb, kurtaxeKind), nicht aus der aktuellen Verordnung.
