# AURA — The Art of Finding Your Scent

Website-Prototyp für AURA, eine Premium-Parfummarke mit persönlichem Duftfinder. Gebaut nach dem Businessplan und Website-Build-Brief (Version 1.0).

> **Konzept-Prototyp.** Produkte, Preise und Duftnoten sind Beispieldaten. Warenkorb und Checkout funktionieren, es wird aber nichts verkauft, berechnet oder versendet. Die Website sagt das auf jeder Seite.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 22.12 (LTS empfohlen).

```bash
npm install
npm run dev
```

Danach im Browser **http://localhost:5173** öffnen. Mit `npm start` öffnet sich der Browser automatisch.

| Befehl            | Was passiert                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Entwicklungsserver mit Live-Reload auf Port 5173 |
| `npm start`       | wie `dev`, öffnet zusätzlich den Browser         |
| `npm run build`   | Typprüfung und Produktions-Build nach `dist/`    |
| `npm run preview` | Produktions-Build lokal ansehen (Port 4173)      |
| `npm test`        | Tests der Matching-Logik                         |
| `npm run format`  | Code mit Prettier formatieren                    |

## Was drin ist

**Seiten:** Startseite (alle neun Sektionen aus dem Brief), Duftfinder, Ergebnisseite, Shop, Produktseiten für alle fünf Produkte, Philosophie, FAQ, Kontakt, Warenkorb, Kasse, Bestellbestätigung, Impressum, Datenschutz, Widerruf, Versand, AGB und eine 404-Seite.

**Duftfinder** (`/duftfinder`)

- Alle zehn Fragen aus dem Brief plus die optionale Budgetfrage, die nur erscheint, wenn sie das empfohlene Format verändert.
- Bildkarten, Mehrfachauswahl bei Duftfamilien, Anlässen und gemiedenen Noten, Fortschrittsbalken, Zurück und Weiter.
- Einzelauswahl springt beim Tippen automatisch weiter, Tastaturnutzer behalten die volle Kontrolle.
- Der Fortschritt wird im Browser zwischengespeichert. Wer abbricht, kann später weitermachen.
- Ohne Anmeldung und ohne E-Mail-Adresse.

**Ergebnis** (`/duftfinder/ergebnis`)

- Reveal-Animation mit Archetyp, Farbwelt und Markenbotschaft.
- Duftprofil (Frische, Blumig, Süße, Wärme, Holzig, Intensität), Farbwelt und gewählte Bildwelt.
- Empfohlener Duft mit Duftpyramide und Begründung aus den eigenen Antworten.
- Alternative, wenn zwei Düfte nah beieinander liegen.
- **Transparentes Matching:** eine aufklappbare Tabelle zeigt, wie viele Punkte jede Antwort vergeben hat.
- Ergebnis teilen per Link, Test neu starten, alle Düfte ansehen.

**Shop:** Varianten (30 ml / 50 ml) mit Grundpreis pro 100 ml, Mengenauswahl, Warenkorb-Drawer, Warenkorbseite, Versandkosten separat ausgewiesen, Demo-Checkout mit Validierung und Bestellbestätigung. Jede Produktseite zeigt, ob der Duft zum eigenen Duftfinder-Ergebnis passt.

**Weitere Bausteine:** Consent-Banner mit gleichwertigen Optionen, datenschutzfreundliche Analytics-Schnittstelle (ohne Einwilligung wird nichts erfasst), selbst gehostete Schriften (keine Verbindung zu Google Fonts), strukturierte Produktdaten (JSON-LD), Seitentitel und Meta-Descriptions, Mobile First, Tastaturbedienung und reduzierte Bewegung.

## Die Matching-Logik anpassen

Fragen, Antworten und alle Gewichtungen liegen zentral in **`src/data/quiz.ts`**. Jede Antwort vergibt Punkte an die drei Duftprofile (`scores`), beeinflusst das angezeigte Duftprofil (`profile`) und liefert Signale für die Begründung (`tags`). Gemiedene Noten (`exclusion`) ziehen Punkte ab und stellen betroffene Düfte nach Möglichkeit ganz zurück.

Die Berechnung selbst steht in `src/lib/matching.ts` und folgt Kapitel 5 des Businessplans:

1. Punkte aus allen Antworten summieren. Die Bildwelt zählt nur wenig, gemiedene Noten zählen stark negativ.
2. Düfte mit ausdrücklich gemiedenen Noten nach hinten stellen.
3. Bei Gleichstand: direkte Duftnoten, dann Ausschlüsse, dann Intensität und Anlass.
4. Ehrliche Einordnung: klare Übereinstimmung, gute Übereinstimmung, erste Orientierung (Duftvorlieben unbekannt) oder nächstbeste Option (Lieblingsrichtung ausgeschlossen). In den letzten beiden Fällen empfiehlt AURA das Discovery Set.

Nach Änderungen an den Gewichtungen `npm test` ausführen. Die Tests prüfen unter anderem, dass die Bildwelt nicht allein entscheidet und gemiedene Noten respektiert werden.

Produkte und Preise stehen in `src/data/products.ts`, die Archetypen und Begründungstexte in `src/data/archetypes.ts`.

## Projektstruktur

```
src/
  data/        Produkte, Archetypen, Fragenkatalog mit Gewichtungen
  lib/         Matching, Warenkorb, Einwilligung, Speicher, Formatierung
  components/  Header, Footer, Flakon- und Set-Grafiken, Stimmungsbilder, Karten
  pages/       alle Seiten
  styles/      Design-System (Farben, Typografie) und Seitenstile
```

Alle Produkt- und Stimmungsbilder sind Vektorgrafiken im Code. Für den Launch werden sie durch echte Produktfotografie ersetzt.

## 3D-Flakon (Blender)

Im Ordner `blender/` liegt ein fotorealistisches Blender-Modell des Flakons (Bernstein-Variante) mit fertiger Szene, Skript und Rendering. Details in [`blender/README.md`](blender/README.md).

## Vor dem echten Verkauf

- Echtes Shopsystem und Zahlungsanbieter anbinden. Der Bestellbutton muss dann „Zahlungspflichtig bestellen“ lauten.
- Impressum, Datenschutzerklärung, AGB und Widerrufsbelehrung vollständig ausfüllen und rechtlich prüfen lassen, inklusive elektronischer Widerrufsfunktion.
- Inhaltsstoffe (INCI) und Duftallergene nach Freigabe der Rezepturen und Sicherheitsbewertung ergänzen.
- Haltbarkeit und Intensität mit echten Mustern testen und realistisch beschreiben.
- Echte Versandkosten, Lieferzeiten und Rücksendeprozess eintragen.
- Analytics-Tool hinter der bestehenden Einwilligung anbinden (`track()` in `src/lib/consent.tsx`).
- Kontaktformular und Newsletter (Double-Opt-in) an einen Dienst anbinden.
- Gewichtungen des Duftfinders mit Testpersonen überprüfen.
