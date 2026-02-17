

# Hintergrundbilder fuer Game Cards

## Uebersicht
Jede Game Card bekommt ein atmosphaerisches Hintergrundbild im Header-Bereich, das dem jeweiligen Spiel entspricht. Die Bilder werden als URL-Referenzen aus frei verfuegbaren Quellen eingebunden und mit einem dunklen Overlay versehen, damit Text und Icons weiterhin gut lesbar bleiben.

## Aenderungen

### 1. Game-Bilder als URLs definieren (`src/components/landing/FeaturesSection.tsx`)
- Dem `gameData`-Array wird pro Spiel ein neues Feld `backgroundImage` hinzugefuegt
- Verwendet werden hochwertige, frei verfuegbare Bilder (z.B. von Unsplash oder offizielle Promo-Bilder via CDN)
- Alternativ: Du kannst eigene Bilder hochladen (per Chat-Upload), die ich dann direkt einbinde

### 2. GameCard-Komponente erweitern (`src/components/landing/GameCard.tsx`)
- Neues Prop `backgroundImage?: string` hinzufuegen
- Im CardHeader-Bereich wird das Bild als `background-image` mit CSS eingesetzt
- Darueber kommt ein dunkles Gradient-Overlay (`bg-gradient-to-t from-black/80 via-black/50 to-black/30`), damit der Titel und das Icon lesbar bleiben
- Der Header wird etwas hoeher (z.B. `h-32` statt der aktuellen kompakten Hoehe)
- Das Icon und der Titel werden ueber dem Overlay positioniert (`relative z-10`)

### Visuelles Ergebnis

Jede Karte zeigt im oberen Bereich ein stimmungsvolles Spielbild mit einem sanften dunklen Verlauf. Darunter bleiben Beschreibung, Tags, Fortschrittsbalken und Button unveraendert.

```text
+---------------------------+
|  [Hintergrundbild]        |
|  ~~~~~~~~~~~~~~~~~~~~~~~~ |
|  Icon  Spielname          |
+---------------------------+
|  Beschreibung...          |
|  [Tag] [Tag] [Tag]        |
|                           |
|  ████████░░░ 5/10 Claimed |
|  [ Select Minecraft ]     |
+---------------------------+
```

## Technische Details

### Dateien die geaendert werden:
1. **`src/components/landing/FeaturesSection.tsx`** -- `backgroundImage`-Feld zum gameData-Array hinzufuegen und als Prop an GameCard weitergeben
2. **`src/components/landing/GameCard.tsx`** -- Neues Prop akzeptieren, Header-Bereich mit Hintergrundbild und Overlay gestalten

### GameCard Header-Aenderung (Kern-Idee):
- Der `CardHeader` bekommt `position: relative`, `overflow: hidden` und eine feste Hoehe
- Ein `div` mit `background-image`, `background-size: cover`, `background-position: center` wird absolut positioniert
- Ein zweites `div` als Gradient-Overlay liegt darueber
- Icon und Titel bleiben relativ positioniert mit `z-10`

### Bild-Quellen:
Es werden Unsplash-URLs verwendet (kostenlos, keine Lizenzprobleme):
- **Minecraft**: Blockiges Landschafts-/Craft-Motiv
- **Terraria**: Pixelart / Naturlandschaft
- **Satisfactory**: Fabrik-/Industriemotiv
- **CS2**: Taktisches/FPS-Motiv
- **Factorio**: Mechanik-/Zahnrad-Motiv
- **Rust**: Survival-/Wildnis-Motiv

Falls du lieber eigene Bilder verwenden moechtest, kannst du sie einfach hier im Chat hochladen -- ich baue sie dann direkt ein.

