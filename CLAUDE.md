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

## Arbeitsweise Testversion und laufende App (Wänu, 12.11.2026)
1. Layout, Texte und Kalender zuerst in der Testversion (`Waenu/TSCHENT-O-MAT-Test`). Am Anfang der Antwort «📍 Testversion» schreiben. Nach Wänus «push» schaut er auf dem Handy, nach «übernehmen» `index.html` und `sw.js` unverändert in die laufende App kopieren.
2. Direkt in der laufenden App (`Waenu/TSCHENT-O-MAT-180264`) nur, was die Testversion nicht prüfen kann (Buchungen, Mails, WhatsApp, Zahlungen, speichern) oder dringende Fehlerkorrekturen. Am Anfang «📍 Laufende App» schreiben und den Grund nennen. Danach die Testversion auf denselben Stand bringen.
3. Vor jeder Arbeit in beiden Repos den neuesten Stand holen (`git pull`), weil Wänu auch in anderen Chats ändern kann.
4. Beide Repos im selben Chat angehängt; ein eigener Chat für die Testversion ist nicht nötig.

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

## Offen: Airbnb-Belegung ins App-Repo umziehen (Wänu «ja», 13.11.2026, nächste Woche)
- Heute: Workflow `belegung.yml` + `belegung.py` im alten Repo `Waenu/Tschentomat` (Secret `AIRBNB_ICAL`) schreibt `belegt.json`; die App liest `/Tschentomat/belegt.json`.
- Plan (mit Wänu abgesprochen 13.11.2026, Testzeit etwa 4 Wochen, altes Repo am Schluss nur stilllegen, nicht löschen):
  1. Woche 1: Workflow und Skript ins App-Repo kopieren; erzeugt eigene `belegt.json`, App liest weiter die alte. Claude vergleicht beide Dateien.
  2. Ab Woche 2, wenn gleich: App (und Testversion) lesen die eigene `belegt.json` (3.2.2.0, funktionelle Änderung). Altes Repo läuft als Reserve weiter. Rückweg: eine Zeile in der App.
  3. Nach 4 Wochen ohne Probleme: Wänu legt das alte Repo still (Actions → Workflow «belegung» → Disable; Settings → Pages → Unpublish; Settings → Archive).
- Wänu muss nur das Secret `AIRBNB_ICAL` im App-Repo eintragen (Settings → Secrets and variables → Actions; Wert: Airbnb-Kalender exportieren). Claude kann Secrets weder sehen noch setzen. Schreibrechte für Workflows im App-Repo sind vorhanden (gaeste-sync schreibt bereits).
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
