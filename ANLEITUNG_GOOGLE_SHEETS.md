# Google Sheets Cloud-Sync einrichten

## Schritt 1: Google Sheet erstellen

1. Gehe zu [Google Sheets](https://sheets.google.com)
2. Erstelle ein neues, leeres Spreadsheet
3. Benenne es z.B. "Uebungstagebuch"

Die Tabellenblatter "Kind1" und "Kind2" werden automatisch erstellt, wenn der erste Eintrag gespeichert wird.

## Schritt 2: Apps Script einrichten

1. Im Google Sheet: **Erweiterungen** > **Apps Script**
2. Loesche den vorhandenen Code in der Datei `Code.gs`
3. Kopiere den gesamten Inhalt der Datei `google_apps_script.gs` und fuege ihn ein
4. Klicke auf das **Speichern**-Symbol (Diskette) oder Strg+S

## Schritt 3: Als Web-App bereitstellen

1. Klicke oben rechts auf **Bereitstellen** > **Neue Bereitstellung**
2. Klicke auf das Zahnrad-Symbol und waehle **Web-App**
3. Einstellungen:
   - **Beschreibung**: z.B. "Uebungstagebuch Sync"
   - **Ausfuehren als**: "Ich"
   - **Zugriff**: "Jeder"
4. Klicke auf **Bereitstellen**
5. Google fragt nach Berechtigungen - klicke auf **Zugriff erlauben**
   - Eventuell kommt "App nicht verifiziert" - klicke dann auf "Erweitert" > "Zu ... wechseln (unsicher)"
6. **Kopiere die angezeigte URL** (sieht aus wie: `https://script.google.com/macros/s/ABC.../exec`)

## Schritt 4: URL in die HTML-Dateien eintragen

In beiden Dateien ganz oben im `<script>`-Bereich steht:

```javascript
const SCRIPT_URL = ''; // <-- Deine URL hier einfuegen
```

Fuege die kopierte URL zwischen die Anfuehrungszeichen ein, z.B.:

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/ABC.../exec';
```

Dateien:
- `uebungstagebuch_kind1.html` (SHEET_NAME = 'Kind1')
- `uebungstagebuch_kind2.html` (SHEET_NAME = 'Kind2')

## Schritt 5: Testen

1. Oeffne eine der HTML-Dateien im Browser
2. Trage einen Eintrag ein und speichere
3. Oben rechts erscheint kurz "Gespeichert"
4. Pruefe im Google Sheet, ob der Eintrag erscheint
5. Oeffne die Seite auf einem anderen Geraet/Browser - die Daten sollten geladen werden

## Hinweise

- **Offline-Faehig**: Ohne Internet werden Eintraege lokal gespeichert. Beim naechsten Laden mit Internet werden sie synchronisiert.
- **Fallback**: Ohne URL funktioniert alles wie bisher nur mit localStorage.
- **Merge-Logik**: Cloud-Daten haben Vorrang bei gleichem Datum. Lokale Eintraege mit anderem Datum werden beibehalten.
- **Bei Aenderungen am Script**: Nach Aenderungen am Apps Script muss eine neue Version bereitgestellt werden (Bereitstellen > Bereitstellungen verwalten > Bearbeiten > Neue Version).
