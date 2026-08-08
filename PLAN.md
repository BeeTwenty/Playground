# Plan og arkitektur: Lekeplass Rater

Dette dokumentet beskriver foreslått arkitektur og gjennomføringsplan for MVP,
basert på prosjektbeskrivelsen. Ingen kode skrives før planen er godkjent.

## 1. Overordnet arkitektur

```
┌─────────────────────────────┐
│  Expo-app (React Native)    │
│  - expo-router (navigasjon) │
│  - react-native-maps (kart) │
│  - expo-location (GPS)      │
│  - expo-image-picker/       │
│    expo-image-manipulator   │
│    (bilder + komprimering)  │
└──────────────┬──────────────┘
               │ @supabase/supabase-js
┌──────────────▼──────────────┐
│  Supabase                   │
│  - Postgres (datamodell)    │
│  - Auth (e-post/passord)    │
│  - Storage (bilder)         │
│  - Row Level Security       │
└─────────────────────────────┘
```

### Valg og begrunnelser

| Valg | Begrunnelse |
|---|---|
| **Expo managed workflow + TypeScript** | Som ønsket. TypeScript gir tryggere endringer for deg som ikke er RN-ekspert – editoren sier fra når noe brukes feil. |
| **expo-router** | Filbasert navigasjon (én fil per skjerm i `app/`-mappen). Lettere å finne frem i enn manuell React Navigation-konfigurasjon. |
| **react-native-maps** | Kompatibel med Expo managed workflow og fungerer i Expo Go-appen (Apple Maps på iOS, Google Maps på Android). Ingen native build nødvendig for MVP. |
| **Enkle custom hooks i stedet for state-bibliotek** | For en app på denne størrelsen holder det med `useState`/`useEffect` pakket inn i lesbare hooks (`usePlaygrounds()`, `useRatings()` osv.). Mindre magi = lettere å følge med. |
| **Bildekomprimering med expo-image-manipulator** | Skalerer ned til maks ~1280 px bredde og ~80 % JPEG-kvalitet før opplasting. Holder Storage-forbruket lavt og opplasting rask på mobilnett. |

## 2. Datamodell (justeringer fra utkastet)

Utgangspunktet ditt beholdes, med disse justeringene – alle er små og begrunnet:

### `playgrounds`
| Felt | Type | Endring/kommentar |
|---|---|---|
| id | uuid pk | uendret |
| name | text | uendret |
| latitude / longitude | double precision | «float» presisert til double – vanlig for koordinater |
| is_fenced | boolean | uendret |
| winter_open | boolean | uendret |
| **parking_distance_m** | integer, nullable | **Ny:** beskrivelsen nevner «avstand til nærmeste parkering», men utkastet hadde bare `has_parking`. Meter-felt (valgfritt) dekker begge: utfylt = parkering finnes. `has_parking` droppes for å unngå to felt som kan motsi hverandre. |
| has_shop_nearby | boolean | uendret |
| has_restroom_nearby | boolean | uendret |
| created_by | uuid fk → auth.users | uendret |
| created_at | timestamptz | timestamptz i stedet for timestamp (tidssone-trygt) |

### `playground_images`
Uendret fra utkastet (med timestamptz). `image_url` lagrer stien i Storage-bucketen
`playground-images`, ikke full URL – da kan vi bytte domenet/CDN senere uten migrering.

### `ratings`
| Felt | Endring/kommentar |
|---|---|
| age_group | Enum-verdier blir `'0_2'`, `'3_6'`, `'6_12'` (ikke «småbarn» – æ/å i enum-verdier gir kluss i kode og API; visningsnavn oversettes i appen) |
| safety_rating m.fl. | `smallint` med `CHECK (1..5)` – databasen nekter ugyldige verdier |
| **UNIQUE (playground_id, user_id)** | **Ny:** én rating per bruker per lekeplass; ny innsending oppdaterer den gamle. Hindrer at én person «stemmer» mange ganger. |

### Sikkerhet (Row Level Security)
- **Lese:** alle innloggede kan lese alt (evt. også anonymt – se spørsmål nederst).
- **Skrive:** alle innloggede kan opprette; bare eier (`created_by`/`user_id`/`uploaded_by`) kan endre/slette egne rader. Dette dekker krav 5 («redigere/slette egne innlegg») på databasenivå, ikke bare i appen.
- Storage-bucket med tilsvarende policy: alle kan lese, bare opplaster kan slette.

### Avstandssøk
MVP beregner avstand **client-side** (haversine på lat/lng) og sorterer/filtrerer
lekeplassene som hentes. Med hundrevis av lekeplasser er dette raskt nok.
Hvis datamengden vokser, er neste steg en PostGIS-spørring i Supabase – skjemaet
er forberedt på det (rene koordinatfelt), så det krever ingen datamigrering.

## 3. Supabase-oppsett – praktisk

Jeg kan ikke opprette Supabase-prosjektet i din konto herfra. Planen er:

1. Jeg leverer ferdige SQL-migreringer i `supabase/migrations/` (tabeller, enum,
   RLS-policies, storage-bucket) som du limer inn i Supabase SQL Editor
   (eller kjører med Supabase CLI).
2. Du oppretter et gratis prosjekt på supabase.com og legger prosjektets URL og
   anon-nøkkel i en `.env`-fil (mal følger med som `.env.example`).

## 4. Skjermer og rekkefølge (som spesifisert)

1. **Kartvisning** – kart sentrert på brukerens posisjon, pins for lekeplasser, avstandsfilter (glidebryter/valg: 1/5/20 km), klikk på pin → detaljvisning.
2. **Detaljvisning** – bildekarusell, snittratings per kategori, aldersgruppe-fordeling, praktisk info som tydelige tags, kommentarliste.
3. **Legg til lekeplass** – GPS-forslag med justerbar pin på kart, navn, praktisk info, bildevelger (kamera/galleri) med komprimering.
4. **Legg til rating** – aldersgruppe-velger, tre stjernerader, kommentarfelt; redigerer eksisterende rating hvis du har en fra før.
5. **Innlogging/registrering** – e-post + passord via Supabase Auth. Kart og detaljer kan ses uten innlogging; å bidra krever konto (appen sender deg til innlogging ved behov).

Merk: selve auth-*wiringen* (Supabase-klient + session-håndtering) settes opp i
grunnmuren fra start, siden skjerm 3 og 4 trenger den – bare *skjermene* kommer sist.

## 5. Kodekvalitet og testing

- TypeScript overalt, kommentarer på «hvorfor»-nivå, én skjerm per fil, delte
  komponenter i `components/`, datalogikk i `lib/` og `hooks/`.
- **Automatisk:** Jest-tester for logikk (avstandsberegning, snittratings,
  validering), `tsc --noEmit` og ESLint kjøres etter hvert steg.
- **Manuelt:** dette miljøet kan ikke kjøre en telefon-emulator, så visuell
  verifisering skjer hos deg med **Expo Go** (skann QR-kode fra `npx expo start`).
  Jeg leverer i små bolker (én skjerm om gangen) så du kan teste underveis.
- «Her nå»-funksjonalitet holdes utenfor, som spesifisert – ingen felt eller
  tabeller som forbereder sanntids-tilstedeværelse.

## 6. Leveranserekkefølge

| Steg | Innhold |
|---|---|
| 0 | Expo-prosjekt, mappestruktur, Supabase-klient, `.env.example`, SQL-migreringer |
| 1 | Kartvisning med pins + avstandsfilter |
| 2 | Detaljvisning |
| 3 | Legg til lekeplass (inkl. bildeopplasting) |
| 4 | Legg til/rediger rating |
| 5 | Innlogging/registrering + «mine bidrag»-håndtering (rediger/slett) |

## Avklaringer før koding

1. **Anonym lesing:** Skal man kunne se kart/lekeplasser *uten* å logge inn (min anbefaling – senker terskelen), eller skal alt kreve innlogging?
2. **Språk i appen:** Norsk bokmål i all UI-tekst?
