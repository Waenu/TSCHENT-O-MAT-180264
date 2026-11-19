> **ZUERST (neuer Chat am Dienstag 24.11.2026):** Wänu zu Beginn an die offenen Punkte erinnern, bevor irgendetwas anderes passiert: gesammelte Meldungen 5, 8, 11, 13, 14, 15, 16 (siehe Liste «Gesammelte Meldungen bis zur Übernahme»), Belegung Schritt 2 (App liest eigene `belegt.json`, 3.20.2.0) und Übernahme in die laufende App erst nach «übernehmen». Die fertige laufende App 3.20.1.1 (index.html, einstellungen.json, versionen.json, scripts/gaestemeldung.gs, CLAUDE.md) liegt im Zweig `bereit-3.20.1.1` des Repos `Waenu/TSCHENT-O-MAT-180264`, falls gepusht. Diesen Hinweis danach entfernen.

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
3. In `versionen.json` oben einen Eintrag einfügen (UTF-8, `ensure_ascii=False`, Einrückung 2, Zeilenumbruch am Ende). `arten` z. B. «Layout», «Fehler», «Text». `datum` immer als «JJJJ-MM-TT» (z. B. «2026-11-18»); die Historie zeigt nur dieses Format (`dat()`), «18.11.2026» erscheint ohne Datum (bis 18.11.2026 bei 3.5.0.2 bis 3.17.11.1 passiert, korrigiert).
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

## Arbeitsweise Testversion und laufende App (Wänu, 12.11.2026)
1. Layout, Texte und Kalender zuerst in der Testversion (`Waenu/TSCHENT-O-MAT-Test`). Am Anfang der Antwort «📍 Testversion» schreiben. Nach Wänus «push» schaut er auf dem Handy, nach «übernehmen» `index.html` und `sw.js` unverändert in die laufende App kopieren.
2. Direkt in der laufenden App (`Waenu/TSCHENT-O-MAT-180264`) nur, was die Testversion nicht prüfen kann (Buchungen, Mails, WhatsApp, Zahlungen, speichern) oder dringende Fehlerkorrekturen. Am Anfang «📍 Laufende App» schreiben und den Grund nennen. Danach die Testversion auf denselben Stand bringen.
3. Vor jeder Arbeit in beiden Repos den neuesten Stand holen (`git pull`), weil Wänu auch in anderen Chats ändern kann.
4. Beide Repos im selben Chat angehängt; ein eigener Chat für die Testversion ist nicht nötig.
5. Seit 17.11.2026 (Wänu): parallel bauen. Jede Änderung gleichzeitig in beiden Repos mit derselben Version (`index.html` und `sw.js` gleich, Versionshistorie in beiden). «push» heisst nur Testversion pushen; die laufende App liegt fertig bereit und wird erst nach «übernehmen» (bzw. ausdrücklichem Push der laufenden App) gepusht.

## Testversion und neuer Kalender (12.11.2026, übernommen als 3.2.1.2)
- Testversion: Repo `Waenu/TSCHENT-O-MAT-Test`, Seite https://waenu.github.io/TSCHENT-O-MAT-Test/ (nur Layout-Tests, speichert und sendet nichts). Dieselbe `index.html` erkennt am Pfad «TSCHENT-O-MAT-Test» den Testmodus (`TEST_MODUS`, Skript ganz oben im `<head>`); hier in der laufenden App ist er aus. Einzelheiten in `CLAUDE.md` des Test-Repos. Neues zuerst dort bauen, nach Wänus «übernehmen» `index.html` und `sw.js` unverändert hierher kopieren (nie `manifest.json` oder die orangen Symbole).
- Kalender seit 3.2.0.0: Monate untereinander im Scroll-Fenster `#calBox` (`KAL_LISTE`, `kalSpringen`, `kalOben`, `KAL_BIS`, `KAL_ZIEL`), aktuelle Woche zuoberst, 12 Monate zurück, 13 voraus plus «Weitere Monate» bis 24. `#calGrid` ist ein Behälter, jeder Monat ein `.cal-grid.kal-g`; `zeichneBalken()` ohne Angabe zeichnet alle Monate.
- 3.2.1.3 (12.11.2026 aus der Testversion übernommen): Monatstitel beim Blättern gleich gross wie die Überschriften der Liste; «Monat 27» oder, falls «September 27» nicht passt, bei allen Monaten «2027» in neuer Zeile (`kalJahrForm`); Skisaison klein darunter, auch in der Liste.
- 3.2.1.4 (übernommen): Jahr nie abgekürzt. Untereinander immer «Monat 2026»; beim Blättern «Monat 2027» oder, falls «September 2027» nicht passt, bei allen Monaten «2027» in neuer Zeile. ResizeObserver auf `#calTitle` misst nach dem Umschalten neu.
- 3.2.1.5 (12.11.2026, in einem anderen Chat direkt in der laufenden App gebaut, Testversion nachgezogen): Monatssymbol am Ende des Monatsspruchs; Angebote wechseln nur alle 60 s; Symbolzeile der Termin-Box ohne Ameisenpfad, Symbole orange unterstrichen.
- 3.2.1.x: Umschalter `#calArt` neben «Heute» (⇄/⇅) zwischen untereinander und Blättern, pro Handy in `tm2_kalart`; schmale Pfeile, Titel `titelHtml()`; Klasse `zieht` beim Wischen an `#cal`.

## Offen und Hinweise nach dem Kalender-Umbau (Stand 12.11.2026, 3.2.1.5)
1. Zurück zum Stand vor dem neuen Kalender (3.0.0.1): Commit `0ede210`. Nur `index.html`, `sw.js`, `einstellungen.json`, `versionen.json` und `CLAUDE.md` aus diesem Commit zurückholen, die Daten bleiben. Ein Git-Tag dafür gibt es nicht (Anlegen hatte nicht geklappt). Nur auf Wänus ausdrücklichen Wunsch.
2. Geschwindigkeit: für Wänu in Ordnung (12.11.2026). Der Kalender zeichnet bei jedem Antippen alle (bis 26) Monate neu; nur bei Bedarf beschleunigen.
3. Gäste durch Papi im Kalender eintragen: funktioniert mit dem neuen Kalender (Wänu auf dem Handy und Playwright in beiden Ansichten, Speichern nachgestellt; 12.11.2026).
4. Scrollen am Ende des Kalenderfensters: Danach scrollt die ganze Seite weiter. Für Wänu so in Ordnung (12.11.2026).
5. Name «TSCHENT-O-MAT TEST» unter dem Symbol auf dem Startbildschirm (vermutlich gekürzt) nicht geprüft.
6. Umschalter ⇄/⇅: kein Leuchten und kein Hinweis, das Symbol genügt (Wänu).

## Idee: Zahler für Freunde unter 18 und Gästegrafik (Wänu, 13.11.2026, nächste Woche besprechen, NICHTS bauen ohne «ja»)
Ausgangspapier von Wänu (von anderer KI geschrieben): grafische Gästeübersicht mit Zahlungsaufteilung. Wänus Präzisierung:
1. Grafik nur, wenn ein Freund unter 18 dabei ist.
2. Die Familie kennt die App über das Handy des Buchenden (z. B. Rahel: mit Partner und 2 Kindern). Namen der Enkel würde Wänu hinterlegen.
3. Freunde brauchen keine Namen: «Freund über 18», «Freund unter 18» genügt.
4. Freund unter 18 antippen, dann wählen, wer für ihn zahlt (Familie und/oder einzelne Freunde; Standard gleich verteilt, wahlweise Prozent).
5. Bei vielen Freunden (z. B. Dave allein mit 5) muss man wissen, wer wer ist: Daten der Gästemeldung (Kurtaxe) könnten helfen.
6. Bei «Wer zahlt was» eine Option «Grafik zeigen» mit allen Namen. Fehlt die Gästemeldung noch: Hinweis, dass die Funktion erst danach geht. Bei Familie ohne Freunde nur die Abbildung.
Analyse und Empfehlung Claude (13.11.2026):
- Heute: Familie zahlt Pauschale pro Nacht unabhängig von der Kopfzahl (Enkel kosten nichts extra); jeder Freund ist eigener Zahler (Nachtpreis, Reinigungsanteil, Kurtaxe nach Alter); nur Anzahlen, keine Namen/Alter im Rechner; ein Buchender pro Anfrage.
- Rechnung in `derive()`/`calc()` unverändert lassen, Zuordnung nur als Umverteilung der fertigen Beträge (Total bleibt gleich).
- Mehrere Familien mit getrennter Zahlung pro Buchung: grosser Umbau, vorerst nicht.
- Namen und Alter von Minderjährigen nie ins öffentliche Repo (auch nicht in `index.html`); höchstens privat (Handy oder privater Speicher).
- Zuerst klären, wie oft Freunde unter 18 mitkommen. Wenn selten: einfache Lösung ohne Grafik («Wer übernimmt seinen Anteil?»).
Ergänzung Wänu (13.11.2026): Gästemeldung schon im Rechner. Bei «Wie viele Freunde» erscheint die bestehende Tabelle (Name, Vorname, Geburtsdatum …).
- Frage «Kinder von 6 bis 15 Jahren» fällt weg (Alter aus Geburtsdatum). Damit sind Kurtaxe und Zuordnung der Zahler für unter 18 möglich, und Wänu muss der Liste nicht mehr nachrennen.
- Empfehlung Claude: im Rechner nur Vorname und Geburtsdatum pro Freund (Preis, Kurtaxe, Zahler); Name, Geschlecht, Nationalität erst beim Abschicken der Anfrage, vorausgefüllt. Liste bleibt nachträglich änderbar. Daten weiterhin nur an den Briefkasten (Google), nie ins Repo; bei Ablehnung/Storno Liste dort löschen. Kleinkinder von Freunden (unter 2½, ohne Bett): Preis noch von Wänu festzulegen.
- Als ein Paket mit «Zahler für Freunde unter 18» umsetzen.
Bedienung (Vorschlag Claude, 13.11.2026) und Entscheide Wänu:
- Unter 2½: nur in der Liste («Kleinkind, ohne Bett, gratis»), keine Zuordnung.
- 2½ bis 17: eigener Anteil (Nachtpreis + Kurtaxe); bei «Wer zahlt was» Chips zum Antippen: Familie, jeder erwachsene Freund UND der Jugendliche selbst (Wänu: z. B. 17-Jähriger ohne Eltern zahlt selbst). Mehrere gewählt = gleich verteilt; Prozente vorerst nicht. Abschicken erst, wenn für jedes Kind ein Zahler gewählt ist (kein Vorschlag).
- Nachtpreis für Freunde unter 18 gleich wie Erwachsene (Wänu: Bett, Wäsche, Dusche, WLAN, Infrastruktur), kein Kinderpreis.
- Reinigungsanteil von Freunden unter 18 (Wänu «ja», 13.11.2026): zahlt der Jugendliche selbst, zählt er wie ein erwachsener Freund (auch bei der Reinigung); wird er übernommen, trägt er keinen Reinigungsanteil. Option «Nach Personen» dann sinngemäss «jede Person, die selbst zahlt». Total bleibt immer gleich.
Entscheide Wänu (13.11.2026 spät, nach Mockup im privaten Design-Artefakt «TSCHENT-O-MAT Mockup: Wer zahlt was»):
- Grafik (Personen-Kreise) und Chip-Zeilen «Wer übernimmt …?» erscheinen NUR, wenn ein Freund unter 18 dabei ist; kein Knopf «Grafik zeigen» sonst. Die Aufteilung selbst (Hälfte-Hälfte, pro Kopf usw.) kommt weiter aus der bestehenden Auswahl; vor dem Bau prüfen, was diese genau abdeckt.
- Familie pro Handy: Partner und Kinder des Kindes stecken im persönlichen Link (von Wänu in der Verwaltung erzeugt) und werden nur auf dem Handy gespeichert (localStorage). NIE ins Repo, nicht in index.html, nicht in CLAUDE.md. Neues Enkelkind = neuer Link.
- «Wer kommt?»: die buchende Person fest, Partner und jedes Kind als Chips zum An- und Abwählen (jede Kombination, z. B. ohne Partner mit Kindern).
- Mehrere Familien zusammen (z. B. zwei Geschwister mit Familie) und Freunde mit mehreren Jugendlichen sind im Mockup skizziert; ab etwa drei Jugendlichen Chip-Zeilen einklappbar.

## Familie mit Namen (3.5.0.x, Testversion 14.11.2026, übernommen als 3.5.0.2)
- «Wer von der Familie kommt?» zeigt die echten Namen (alle Kombinationen aus Partner/in und Kindern, z. B. «Ich, David, Mael & Yara») plus «Meine Familie und Geschwister». `famOpts()`; `S.werFam` = Label, `S.wer` bleibt die alte Antwort für `derive()` (mehr als 2 Kinder: MFG mit automatischer Personenzahl).
- Namen: Papi in der Verwaltung (Persönliche Links, Felder Partner/in und Kinder, «Namen speichern», `tm2_famListe` nur auf seinem Handy). Link `#ich=Name.CODE&fp=Partner&fk=Kind1,Kind2`, Code bleibt gleich; beim Kind `tm2_famIch`. Nie ins Repo.
- WhatsApp-Anfrage mit Namen; der gespeicherte Schnappschuss (`rechnung` in `buchungen.json`) bleibt neutral ohne Namen.
- Ohne Namen, in der Lücke, bei Papi und Mami: alte Liste. Kleinkind-Frage unverändert.
- Später (Wänu): bei Chips/Personen-Kreisen «Ich» und darunter klein «(Name der buchenden Person)».
- Nationalität in der Liste der Freunde bleibt, vorausgefüllt mit «Schweiz».
- Nächstes Paket (in der Testversion): Liste der Freunde im Rechner (Vorname, Name, Geschlecht, Geburtsdatum, Nationalität), danach Zahler für Freunde unter 18. Einzelheiten in der CLAUDE.md der Testversion.

## Übernommen aus der Testversion: 3.6.0.0 bis 3.16.2.1 (17.11.2026, Wänu «übernehmen»)
- `index.html` und `sw.js` unverändert aus `Waenu/TSCHENT-O-MAT-Test` kopiert, Version 3.16.2.1, Versionshistorie mit allen Einträgen ab 3.6.0.0 ergänzt. Einzelheiten zu jeder Version in der CLAUDE.md der Testversion.
- Wichtigste Neuerungen: Liste der Freunde im Rechner (Kurtaxe, Adressbuch, Rufnamen), Parteien und Zahler für Freunde unter 18, Familie mit Geschwistern, Aufteilung mit Balken, Mindestpreis gratis oder mitzahlen, «👤 Meine Verwaltung» (Aufenthalte, Listen, Geld einsammeln, Profil), Sonderbuchungen (`vorlagen` in buchungen.json), Reinigung nur nach Personen oder Parteien, Leiste mit Kurtaxe, Listen auf der Startseite ab 7 Tagen vor der Anreise, «Ansicht als» mit Chips.
- 3.16.3.2 (parallel gebaut): Glossar «Auswahlfelder»: nochmals antippen hebt die Wahl auf.
- 3.17.0.3 (parallel gebaut): Glossar-Kapitel «📧 Mail, wenn etwas zu tun ist».
- 3.17.0.2 (parallel gebaut): nur Testversion betroffen (oranger Balken kürzer).
- 3.17.0.1 (parallel gebaut): Liste der Freunde erst mit gültiger Mailadresse (Kasten mit Mailfeld im Rechner).
- 3.17.0.0 (parallel gebaut): Mail-Benachrichtigungen. Schalter im Profil, Versand täglich 8 Uhr durch `scripts/gaestemeldung.gs` (`taeglich`, einmal `einrichten` ausführen). Einzelheiten in der CLAUDE.md der Testversion.
- 3.16.3.1 (parallel gebaut): Aufteilung immer mit Rappen; Papi ohne Ansicht kann die Freunde-Zeilen aufklappen (ohne Namen).
- 3.16.3.0 (parallel gebaut): Papi «Ansicht als» zeigt «👤 Meine Verwaltung» des Kindes (Profil grau, leer), Papi-Verwaltung dabei ausgeblendet, zurück über «Zurück zu Papi».
- 3.16.2.3 (parallel gebaut): Papi «Ansicht als» zeigt bei MFG die Geschwister mit Namen (`famAlle()` aus `tm2_famListe`). Kinder brauchen dafür einen Link mit `&fa=` (ab 3.9.0.0 erzeugt).
- 3.16.2.2 (parallel gebaut, 17.11.2026): Knopf der Familiennamen zeigt «✓ Gespeichert» bzw. «Nochmals speichern» (`lkfKnopf`).
- 3.17.1.0 bis 3.17.8.0 (17.11.2026, Wänu «übernimm»): `index.html` unverändert aus der Testversion (sw.js gleich geblieben). Inseln «Wer gehört zusammen?», Farben der Parteien, Zahler pro Partei, Fragen erst wenn oben alles gewählt ist, Kinder jederzeit aufteilen. Einzelheiten in der CLAUDE.md der Testversion.
- 3.17.8.1 (parallel gebaut): einheitliche Rahmen (12 px innen, 10 px dazwischen) und Knöpfe in voller Breite, Text mittig.
- 3.17.8.2 (parallel gebaut): «Kopieren» ohne Ausnahme, volle Breite.
- 3.17.9.0 (parallel gebaut): frühere Aufenthalte in der Verwaltung mit 🗑️ endgültig löschbar.
- 3.17.9.1 (parallel gebaut): Kinderbettchen-Chips in der Farbe der Familie.
- 3.17.10.0 (parallel gebaut): Kinderbettchen der Freunde zählen bei der Familie mit.
- 3.17.10.1 (parallel gebaut): Kleinkinder der Freunde im Kinderbettchen sichtbar, Platz bei «Freunde», Knopf nur bei vollen Betten.
- 3.17.10.2 (parallel gebaut): Kleinkind der Freunde bei «Wer gehört zusammen?» in der Insel der Eltern.
- 3.17.11.0 (parallel gebaut): Kleinkinder der Freunde bei «Wer gehört zusammen?» zuordnen (Vorschlag, verschiebbar, WhatsApp).
- 3.17.11.1 (parallel gebaut): Kinderbettchen mit 👶. 3.17.11.0 und 3.17.11.1 am 17.11.2026 übernommen.
- 3.17.11.2 (parallel gebaut): Versionshistorie pro Tag zusammengefasst (Marken des Tages, Versionen aufklappbar).
- 3.17.12.0 (parallel gebaut): Trinkgeld nicht mehr im Rechner, sondern beim Bezahlen in der Karte «💳 Zu bezahlen» (Chips, Summe zum Überweisen).
- 3.17.12.1 (parallel gebaut): Trinkgeld-Chip «Aufrunden» und Herzchen als Dankeschön.
- 3.17.12.2 (parallel gebaut): Geldverwendung nicht mehr im Rechner.
- 3.17.12.3 (parallel gebaut): Trinkgeld als Eingabefeld, Aufrunden nur bei krummen Beträgen, IBAN in «💳 Zu bezahlen».
- 3.17.12.4 (parallel gebaut): Meine Verwaltung ohne blauen Rahmen.
- 3.17.12.5 (parallel gebaut): Trinkgeld: Aufrunden als Vorschlag im Feld, Knopf «Übernehmen» darunter, «Kein Trinkgeld».
- 3.17.12.6 (parallel gebaut): Meine Verwaltung ohne äusseren Rahmen, Kopfzeile pro Aufenthalt wie bei Papi, Rahmen feuerrot.
- 3.17.12.7 (parallel gebaut): Fehler «Wer gehört zusammen» mit nur einem Freund behoben; Knopf «Meine Verwaltung» feuerrot bzw. blau, wenn alles erledigt.
- 3.17.12.8 (parallel gebaut): Trinkgeld: Aufrunden als Frage mit Knopf, Feld nur für das Trinkgeld mit Vorschau, Rückfrage bei Beträgen über dem fälligen Betrag.
- 3.17.12.9 (parallel gebaut): Glossar-Kapitel «🔒 Datenschutz». Bei Änderungen am Datenfluss nachführen.
- Entscheid Wänu (18.11.2026): Vornamen der Airbnb-Gäste bleiben öffentlich in `gaeste.json` (keine Änderung am Datenschutz der App, auch nicht an der Versionsgeschichte). Nicht erneut vorschlagen.
- 3.20.1.0 (19.11.2026 in einem anderen Chat in der Testversion gebaut und gepusht, hierher kopiert): Preisberechnung wie beim Buchen (Aufteilung mit Farben, «📋 Ganze Berechnung», Vornamen bei Papi). 3.20.0.8 (flache Felder) ist darin NICHT enthalten (war nur lokal gebaut).
- 3.20.0.7 (parallel gebaut): alle Rahmen gleich rund, rote Rahmen feuerrot, «Von deinen Freunden noch offen» sofort richtig.
- 3.20.0.6 (parallel gebaut): blauer Rahmen um den ganzen Kasten «Wer ist wann da?» in «Meine Verwaltung».
- 3.20.0.5 (parallel gebaut): «Wer ist wann da?» bei den Eltern mit richtigen Nächten, Kleinkindern und Farben; in «Meine Verwaltung» blauer Rahmen.
- 3.20.0.4 (parallel gebaut): Kleinkinder müssen bei «Wer gehört zusammen?» zugeteilt werden, Meldung nach «Ja, passt».
- 3.18.0.0 (parallel gebaut): Luftmatratze als 7. Bett, immer Ausnahme, für Freunde und Familie, in jeder Zeit (gestrichelter Chip bei «Freunde», 7 Personen bei MFG, Eltern sagen zu oder ab).
- 3.18.1.0 (parallel gebaut): Luftmatratze in der Verwaltung mit Ja/Nein freigeben; Nein schickt die Anfrage zurück (eine Person weniger).
- 3.18.2.0 (parallel gebaut): Luftmatratze abgelehnt → beim Kind «Wer bleibt zuhause?», ein Tipp rechnet die Anfrage ohne diese Person neu.
- 3.18.2.1 (parallel gebaut): Knopf «Wer bleibt zuhause?» führt in Meine Verwaltung; zurückgeschickte Anfrage bleibt bei Papi sichtbar.
- 3.18.2.2 (parallel gebaut): Gast auf der Luftmatratze gelb markiert; zurückgeschickte Anfrage orange, mit Zurücknehmen und Löschen.
- 3.18.2.3 (parallel gebaut): Trinkgeld «Übernommen»; Luftmatratze in der Checkliste zur Abreise.
- 3.19.0.0 (parallel gebaut): Freunde mit eigener An- und Abreise (Preis und Kurtaxe pro eigene Nacht, Betten pro Nacht, Luftmatratze nur in vollen Nächten); «👥 Wer kommt mit?» bei normalen Buchungen. `scripts/gaestemeldung.gs` speichert An- und Abreise: Wänu muss das Skript bei Google neu bereitstellen.
- 3.19.0.1 (parallel gebaut): Glossar «Freunde mit eigenen Daten» und «Luftmatratze». Google-Skript (an/ab) von Wänu am 18.11.2026 bei Google bereitgestellt.
- 3.19.0.2 (parallel gebaut): eigene Daten der Freunde im kleinen Kalender (1. Tipp Anreise, 2. Tipp Abreise); Luftmatratzen-Chip in derselben Zeile.
- 3.19.0.3 (parallel gebaut): eigene Nächte der Freunde in Rechnungen, Listen und Verwaltung; Mail der Gästemeldung gegliedert mit Nächten (`scripts/gaestemeldung.gs`, neu bereitstellen).
- 3.19.0.4 (parallel gebaut): Kurtaxe mit eigenen Nächten im Total (Fehler), Zeile «N Nächte weniger» in der Preisberechnung, Aufenthalt wie das Geburtsdatum mit 📅 hinten, Leerzeilen in der Anfrage.
- 3.19.0.5 (parallel gebaut): Glossar nachgeführt (eigene Daten, Inseln, Luftmatratze, Datenschutz).
- 3.19.0.6 (parallel gebaut): Hinweis beim Aufenthalt mit Namen, «Bedingungen 📜 und Zahlung 💰», Hinweise unter der Aufteilung weg (Zimmer 1 in der Aufschlüsselung der Familie).
- 3.20.0.0 (parallel gebaut): Buchungsübersicht «👥 Wer ist wann da?» im Rechner, in «Meine Verwaltung», im Kalender und bei Papi (Namen nur auf dem Handy bzw. aus dem Briefkasten, `tm2_ub`).
- 3.20.1.1 (parallel gebaut): Eingabefelder flach wie die Chips.
- Plan (Wänu 18.11.2026): Wänu testet 3.19.0.x ausgiebig in der Testversion und meldet; Übernahme in die laufende App am Dienstag 24.11.2026, erst nach seinem «übernehmen».
- Stand 18.11.2026 abends: 3.19.0.6 bis 3.20.1.1 in der Testversion gepusht (3.20.0.8 nie gepusht) (Wänu «baue … und pushe»); laufende App liegt mit 3.20.1.1 fertig bereit, Push erst nach «übernehmen» (geplant Dienstag 24.11.2026). Offen: Punkt 5 (Sonderbuchung eine Nacht) und Punkt 6 (Luftmatratzen-Hinweis gelb).
- Regel bis zur Übernahme (Wänu 18.11.2026): Wänu meldet nur Text-, Darstellungs- und Funktionsfehler. Claude sammelt alle Meldungen in einer nummerierten Liste und setzt NICHTS um ohne seinen ausdrücklichen Befehl.
- Gesammelte Meldungen bis zur Übernahme (nur sammeln, nichts bauen):
  1. Gebaut als 3.20.0.0 (Wänu «baue», 18.11.2026). Idee (Wänu 18.11.2026, «nur als Spielerei»): Buchungsübersicht pro Aufenthalt, Tage als Spalten, eine farbige Zeile pro Person mit Namen, sichtbar wer wann kommt und geht. Ort und Form noch offen (Vorschlag Claude: unter der Liste der Freunde im Rechner und in der Karte bei Papi, Farben wie die Parteien, Zeile «Betten pro Nacht» mit Luftmatratze).
  2. Erledigt in 3.19.0.6. Text (Wänu 18.11.2026): Hinweis unter «Aufenthalt (wie die Familie)» mit dem Namen des Freundes (Rufname, sonst Vorname): «Kommt Fränzu später oder reist er früher ab? …» statt «Kommt jemand später …» (`datHtml`).
  3. Erledigt in 3.19.0.6. Darstellung (Wänu 18.11.2026): Symbol 💰 «Zahlung» in den roten Kasten «Ich bin mit den Bedingungen 📜 einverstanden» nehmen Entscheid Wänu: wie Vorschlag (b), «Ich bin mit den Bedingungen 📜 und der Zahlung 💰 einverstanden»; Kasten «Zahlung» bleibt, wo er ist.
  4. Erledigt in 3.19.0.6. Frage (Wänu 18.11.2026): Hinweise unter der Aufteilung («Zimmer 1 und rotes Bad bleiben unberührt …», «Reinigung aufgeteilt: …») sinnvoll? Idee: ausführliche Liste auf Wunsch. Empfehlung Claude: «Reinigung aufgeteilt» weglassen (steht schon in den Zeilen), Zimmer-1-Hinweis als Zeile in die Aufschlüsselung der Familie; keine zusätzliche Liste. Entscheid Wänu: einverstanden, keine ausführliche Liste; die Buchungsübersicht (Punkt 1) schauen wir später an.
  5. Funktion (Wänu 18.11.2026, «ist was für Dienstag»): Sonderbuchung auch für nur eine Nacht zulassen können (`sbKalTag` in der Verwaltung lässt eine Nacht schon zu; vor dem Bau prüfen, wo eine Nacht heute scheitert, z. B. Rechner oder Mindestnächte). Noch nicht gebaut.
  6. Erledigt in 3.20.0.2/3.20.0.3 (Hinweis-Markierung `[[…]]` → `span.hgelb`, Wänu «wie gehabt»: Marker wie `.hl`, kein Kasten). Darstellung (Wänu 18.11.2026): Hinweis «🛏️ Luftmatratze: Das 7. Bett ist eine Ausnahme …» unter den Chips «Freunde» gelb hinterlegen (wie die gelbe Zeile `.gm-matra`).
  7. Erledigt in 3.20.0.1 (Wänu «ja, mach das»): Zeile der Übersicht heisst «🛏️ Betten pro Nacht» (zweizeilig in der Namensspalte).
  8. Darstellung (Wänu 18.11.2026, «schauen wir am Dienstag an»): Chips (heute Pillen, 22 px) eventuell mit denselben Ecken wie die Kästen (6 px). Noch nicht gebaut.
  9. Erledigt in 3.20.1.0. Fehler (Wänu 19.11.2026): Preisberechnung in der Verwaltung ohne Namen der Freunde, «Wer ist wann da?» mit Namen.
  10. Erledigt in 3.20.1.0. Darstellung (Wänu 19.11.2026): Preisberechnung in der Verwaltung zu unübersichtlich, «wie vor dem Absenden, aufklappbar und übersichtlich mit Farben».
  11. Darstellung (Wänu 18.11.2026, «am Dienstag»): bei «Meine Familie und Geschwister» (MFG, `#mfgRech`) die Zeile «🛏️ Alle 6 Betten und die Luftmatratze belegt (Ausnahme …)» gelb hinterlegen wie der Luftmatratzen-Hinweis bei «Freunde» (`span.hgelb`). Noch nicht gebaut.
  12. Erledigt in 3.20.1.1. Darstellung (Wänu 18.11.2026 «so wie Sarah»): Eingabefelder der Liste der Freunde, Mail und Trinkgeld flach wie ein Chip (`border: 2px solid var(--line)`, `background: var(--surface)`, `appearance: none`). Am 18.11. lokal als 3.20.0.8 gebaut, nie gepusht; in 3.20.1.0 nicht enthalten. Patch in /tmp/p3208.diff (nur Sitzung). Neu einbauen auf Wänus Befehl.
  13. Darstellung (Wänu 19.11.2026, «am Dienstag»): «Preisberechnung» beim Kind in «Meine Verwaltung» wie bei Papi. Aufbau pro Aufenthalt: Buchung aufklappbar, zuoberst Datum usw., darunter aufklappbar «👥 Wer ist wann da?», darunter aufklappbar «🧾 Preisberechnung» (`rechnungHtml`/`rechAufHtml` wie in `vkKarte`, Namen über `rechNameFn`). Noch nicht gebaut.
  14. Darstellung (Wänu 19.11.2026, «am Dienstag»): Rahmen- und Knopffarben vereinheitlichen (heute grün gestrichelt in Papis Verwaltung, Stornierung/WhatsApp beim Kind grün). Legende in der Einleitung (Bereich «welcher Knopf was bedeutet») oder im Glossar. Entscheide Wänu (19.11.2026): 14a Bedeutungen ja (Rot = fällig/dringend, Orange = zu erledigen, nicht dringend, Blau = Info/erledigt, Grün = Knopf, Gelb = Ausnahme, Grau = vorbei/gesperrt; gestrichelt nur noch «Vorschlag, bitte prüfen»); 14b keine zusätzlichen Textfarben, alles über die Rahmenfarbe; Ausnahme (Wänu 10:52): Lösch-/Stornoknöpfe mit rotem Text (gleiches Rot `--rot`), Rahmen grün wie alle Knöpfe; 14c Legende in der Einleitung beim Teil «welcher Knopf was bedeutet». Je Farbe genau EIN Wert überall (Rot `--rot`, ein Blau, ein Orange: heute zwei Orange `--missing-line` und #E5A100 vereinen); Rahmenabstände und Rundungen überall gleich. Chips (Punkt 8) am Dienstag. Noch nicht gebaut.
  15. Darstellung (Wänu 19.11.2026, «am Dienstag»): helle Ansicht «nicht so sexy». Idee Wänu: leicht farbiger Hintergrund statt Weiss (grau, hellblau oder rosa), eventuell pro Handy wählbar. Dunkler Modus bleibt, wie er ist (gefällt Wänu). Vor dem Bau Mockup mit den Varianten zeigen; Farben der Rahmen (Punkt 14) müssen auf jedem Hintergrund lesbar bleiben. Noch nicht gebaut.
  16. Text (Wänu 19.11.2026, «am Dienstag»): Mail der Gästemeldung (Google-Skript) gefällt sehr: pro Freund nummeriert «1. Name Vorname», darunter eingerückt Geburtsdatum, Geschlecht, Nationalität, Aufenthalt, Nächte, Leerzeile zwischen den Freunden. «So müsste es auch in der WhatsApp sein.» Entscheid Wänu (11:06): ALLE WhatsApp-Texte der App sauber so gliedern (Anfrage, Bestätigung/Absage, Rechnungen an Freunde, Zahlungs- und Endreinigungstexte usw.); in der Anfrage weiterhin nur Vornamen (keine Geburtsdaten/Geschlecht/Nationalität, Entscheid 14.11.). Noch nicht gebaut.
  Zu Punkt 1: Mockup im Chat gezeigt (18.11.2026), Wänu «super». Wunsch Wänu: beim Kind in «Meine Verwaltung» beim Aufenthalt, bei Papi in der Verwaltung bei der Buchung, eventuell beim Antippen des Balkens im Kalender. Empfehlung Claude: Kalender nur für eigene Buchungen und Papi (Namen der Freunde nie für andere sichtbar); Papi mit Namen erst, wenn die Liste im Briefkasten ist, vorher «Freund/in N»; über 10 Nächte waagrecht wischen. Entscheid Wänu: alle drei Orte, dazu (b) ab 10 Nächten waagrecht wischbar mit Namen fest links und (c) auch im Rechner unter der Liste der Freunde. Gebaut als 3.20.0.0. Hinweise «Zimmer 1 …»/«Reinigung aufgeteilt …» bleiben bei Papi über dem Status (Wänu «a. dort lassen»).
- Für die Namen der Familie braucht jedes Kind einen neuen persönlichen Link aus der Verwaltung (Namen nur im Link und auf dem Handy, nie im Repo).

## Gebaut als 3.19.0.0: Freunde mit eigener An- und Abreise (Wänu 18.11.2026)
- Familie bleibt immer den ganzen Aufenthalt; jeder Freund hat An- und Abreise, vorgegeben die Daten der Familie («übernehmen»), mit «Ändern» eigene Daten, immer innerhalb der Familiendaten, mindestens 2 Nächte.
- Betten zählen pro Nacht (Wechsel im selben Bett erlaubt, Bettwäsche von den Eltern, Gäste beziehen selbst); sind alle 6 Betten besetzt, ist die Luftmatratze das Notbett (7.).
- Preis: CHF 70.– pro eigene Nacht, unabhängig vom Bett/Zimmer. Reinigung wie bisher pro Person bzw. Partei, unabhängig von der Dauer. Kurtaxe pro eigene Nacht.
- Gästemeldung braucht die Daten pro Freund (Briefkasten/Google-Skript anpassen, Wänu stellt neu bereit).
- Regel Wänu (18.11.2026): Kommt ein Freund später und ist noch kein Bett frei geworden, braucht er ein neues Bett; sind alle 6 Betten in einer Nacht besetzt, kommt die Luftmatratze dazu (Freigabe durch Papi wie bisher).

## Offen: Airbnb-Belegung ins App-Repo umziehen (Wänu «ja», 13.11.2026, nächste Woche)
- Heute: Workflow `belegung.yml` + `belegung.py` im alten Repo `Waenu/Tschentomat` (Secret `AIRBNB_ICAL`) schreibt `belegt.json`; die App liest `/Tschentomat/belegt.json`.
- Plan (mit Wänu abgesprochen 13.11.2026, Testzeit etwa 4 Wochen, altes Repo am Schluss nur stilllegen, nicht löschen):
  1. Woche 1: Workflow und Skript ins App-Repo kopieren; erzeugt eigene `belegt.json`, App liest weiter die alte. Claude vergleicht beide Dateien.
  2. Ab Woche 2, wenn gleich: App (und Testversion) lesen die eigene `belegt.json` (3.2.2.0, funktionelle Änderung). Altes Repo läuft als Reserve weiter. Rückweg: eine Zeile in der App.
  3. Nach 4 Wochen ohne Probleme: Wänu legt das alte Repo still (Actions → Workflow «belegung» → Disable; Settings → Pages → Unpublish; Settings → Archive).
- Wänu muss nur das Secret `AIRBNB_ICAL` im App-Repo eintragen (Settings → Secrets and variables → Actions; Wert: Airbnb-Kalender exportieren). Claude kann Secrets weder sehen noch setzen. Schreibrechte für Workflows im App-Repo sind vorhanden (gaeste-sync schreibt bereits).
- 16.11.2026: Secret `AIRBNB_ICAL` im App-Repo von Wänu eingetragen. Schritt 1 gebaut: `.github/workflows/belegung.yml` (stündlich Minute 17, `concurrency: belegung`, `git pull --rebase` vor dem Push, ohne Lücken-Meldung und ohne Lebenszeichen, beides bleibt im alten Repo) und `scripts/belegung.py` (unverändert kopiert). Schreibt `belegt.json` ins App-Repo; die App liest weiter `/Tschentomat/belegt.json`. Vergleich: `git show origin/main:belegt.json` hier gegen das alte Repo.
- Bis dahin gilt: altes Repo nie ändern, löschen oder umbenennen.
- Die alte App 1.10.5 ist unter waenu.github.io/Tschentomat/ weiterhin öffentlich erreichbar (GitHub Pages ist dort an, weil `belegt.json` von dort kommt). Erst mit dem Umzug abschaltbar.

## Offen: Testversion für echte Tests ausbauen (Wänu «ja», 13.11.2026, nächste Woche als erster Schritt vor «Zahler/Gästemeldung im Rechner»)
- Ziel: In der Testversion auch Speichern, Gästemeldung, WhatsApp und Mail echt durchspielen, ohne die laufende App zu berühren.
- Speichern: nur ins Test-Repo (`GH_REPO` ist dort schon richtig). Wänu erweitert seinen Token um `TSCHENT-O-MAT-Test` und tippt ihn in der Testversion ein. Private Beträge (`Tschentomat-privat`) bleiben gesperrt.
- WhatsApp/Mail: öffnen wieder; Text beginnt mit «🧪 TEST». Wänu sendet beim Testen an sich selbst (so macht er es schon).
- Gästemeldung: Empfehlung echter Briefkasten (Google Apps Script) und Testlisten danach in der Verwaltung löschen; zweiter Briefkasten nur, falls Wänu das will (Entscheid offen).
- Prüfen: die laufende App darf nie ins Test-Repo schreiben und umgekehrt (beide Adressen lokal testen). Version: funktionelle Änderung.
- Gebaut 14.11.2026 als 3.4.0.0 in der Testversion (Einzelheiten in deren CLAUDE.md). Briefkasten: Testversion sendet Buchungsnummern «TEST:…»; `scripts/gaestemeldung.gs` prüft diese gegen das Test-Repo (`REPO_TEST`), Wänu muss das Skript bei Google nachführen (neue Version der Bereitstellung, Adresse bleibt). Am 14.11.2026 mit 3.4.0.1 (roter Rahmen um die offene Liste der Freunde) in die laufende App übernommen; Wänu hat in der Testversion Bestätigen, WhatsApp und Gästeliste echt getestet (nur Test-Repo/TEST:-Liste, laufende App unberührt). Mails der Gästelisten gehen an die Adresse in den Script-Eigenschaften (MAIL).
- Entscheide Wänu (13.11.2026 abends): echter Briefkasten (kein zweiter); Daten der Testversion vor dem Start aus der laufenden App auffrischen; Start am Dienstag 17.11.2026 (Limit). Token hat `TSCHENT-O-MAT-Test` bereits (Contents Read and write), Wänu tippt ihn nur in der Testversion ein. Version 3.4.0.0 (neue Funktion).

## Erledigt: Kalender-Abgleich aus der App (3.3.0.0, 13.11.2026)
- Gebaut: `syncAnstossen()` (nur Papi, nicht Testmodus/Mami/Kind-Ansicht) startet `gaeste-sync.yml` per workflow_dispatch beim Start und bei `visibilitychange`, höchstens alle 10 Min. (`tm2_syncZeit`), wartet auf den Lauf (id > letzter Lauf), holt `gaeste.json` roh über die API und zeichnet neu. Symbol 🔄 (`#syncK`) seit 3.3.1.1 im Titel «Termin finden» (`h2.cal-kopf`, Symbole rechtsbündig in `.ck-sym`): 🔄 zuerst, ohne Strich, mit Lücke von etwa einem Symbol, damit die Symbole der Kinder am Platz bleiben; neue Symbole für alle hinten anfügen. Im Testmodus zeigt 🔄 nur einen Hinweis. Infozeile `#syncInfo` unter dem Titel; ✅ eine Minute, ⚠️ bleibt. Letzter Erfolg in `tm2_syncOk`.
- 3.2.1.7: `gaesteAufraeumen()` lässt Einträge mit `quelle: "kalender"` stehen (hatte Familienaufenthalte ohne Airbnb-Sperre gelöscht).
- Token um «Actions: Read and write» ergänzt, echter Lauf aus der App am 13.11.2026 erfolgreich.
- 3.3.1.0: Kalendereinträge Familie/Extern/Blockiert (`kalEigen`) gelten auch ohne Airbnb-Sperre (`gastGilt`), Tage wie Vorbehalt gezeichnet (`provtag`: nicht schraffiert, nicht wählbar). Schraffiert heisst damit immer «in Airbnb gesperrt». Airbnb-Gäste weiterhin nur mit Sperre. Wänus Arten: A schraffiert ohne Name (Airbnb gesperrt, nicht im Pimlical oder Lücke nicht freigegeben), B schraffiert mit Name, C nicht schraffiert mit Name (Vorbehalt oder in Airbnb offen).

## Früherer Plan: Kalender-Abgleich aus der App anstossen (Wänu «ja», 13.11.2026)
- Papi-Ansicht: beim Öffnen der App (auch Herunterziehen = Neuladen) startet der Workflow `gaeste-sync.yml` automatisch per GitHub-API (workflow_dispatch), höchstens alle 10 Min.; danach gaeste.json neu laden.
- Viertes Symbol 🔄 neben 📅 📊 🎬 im Titel «Wunschtermin finden», nur für Papi: dreht sich während des Laufs, dann ✅ bzw. ⚠️; Antippen startet sofort und zeigt den letzten Abgleich. Platz schaffen (Titel «Wunschtermin finden» etwas nach links bzw. Abstände anpassen), auf 360 px prüfen.
- Token braucht zusätzlich «Actions: Read and write» für `TSCHENT-O-MAT-180264`: Wänu bekommt eine Schritt-für-Schritt-Anleitung für GitHub.
- 📍 Laufende App (Testversion kann keine Abläufe auslösen), danach Testversion nachziehen. Version 3.3.0.0.
- Hinweis: wirkt nur auf die Stufe Google-iCal-Link → App; Verzögerung von Google selbst bleibt.

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
