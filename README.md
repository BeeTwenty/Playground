# Lekeplass Rater

App for foreldre som vil finne, rate og dele informasjon om lekeplasser.
Bygget med React Native (Expo managed workflow) og Supabase.
Se [PLAN.md](PLAN.md) for arkitektur og begrunnelser.

## Kom i gang

### 1. Opprett Supabase-prosjektet (én gang)

1. Lag et gratis prosjekt på [supabase.com](https://supabase.com).
2. Åpne **SQL Editor** i Supabase-dashbordet og kjør innholdet i disse to
   filene, i rekkefølge:
   - `supabase/migrations/001_schema.sql` (tabeller + Row Level Security)
   - `supabase/migrations/002_storage.sql` (bildelagring)

> **Tips:** Supabase krever som standard at nye brukere bekrefter e-posten sin
> før de kan logge inn. Under utvikling kan du skru dette av under
> *Authentication → Sign In / Up → Email → Confirm email*.

### 2. Konfigurer appen

```bash
cp .env.example .env
```

Fyll inn URL og anon-nøkkel fra *Project Settings → API* i Supabase-dashbordet.

### 3. Kjør appen

```bash
npm install
npx expo start
```

Skann QR-koden med **Expo Go**-appen ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) på telefonen.
Kartet bruker Apple Maps på iOS og Google Maps på Android – ingen egen API-nøkkel trengs i Expo Go.

## Bygg en APK (installerbar Android-app)

Expo Go er raskest under utvikling, men vil du ha en ekte APK på telefonen,
bygger du den gratis i skyen med EAS Build:

1. **Google Maps-nøkkel (kun første gang):** En standalone Android-app trenger
   egen kartnøkkel (Expo Go har sin egen innebygd, derfor virker kartet der uten).
   - Gå til [console.cloud.google.com](https://console.cloud.google.com), lag et
     prosjekt og aktiver **«Maps SDK for Android»** under *APIs & Services*.
   - Lag en API-nøkkel under *Credentials* og lim den inn i `app.json` der det
     står `LIM-INN-GOOGLE-MAPS-NOKKEL-HER`.
   - Google krever et betalingskort på prosjektet, men gratiskvoten er romslig –
     en hobbyapp når den aldri. Hopper du over dette steget bygger appen fint,
     men kartflaten blir grå.
2. **Supabase-verdier:** Lim inn de samme to verdiene som i `.env` i `eas.json`
   (feltene `EXPO_PUBLIC_SUPABASE_URL` og `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
   `.env`-filen blir nemlig ikke med opp til byggserveren.
3. **Bygg:**

   ```bash
   npm install -g eas-cli
   eas login          # gratis konto på expo.dev
   eas init           # kobler prosjektet til kontoen din (svar ja)
   eas build -p android --profile preview
   ```

   Etter ca. 10–20 minutter får du en lenke/QR-kode til ferdig APK. Åpne den på
   telefonen, last ned og installer (tillat «ukjente apper» hvis Android spør).

## Sjekker under utvikling

```bash
npm test           # enhetstester (avstand, snittratings, base64, oversettelser)
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

## Mappestruktur

```
app/                  Skjermene (én fil per skjerm, expo-router)
  (tabs)/index.tsx      Kart med pins og avstandsfilter
  (tabs)/add.tsx        Legg til ny lekeplass
  (tabs)/profile.tsx    Profil: språk, innlogging, egne bidrag
  playground/[id]/      Detaljvisning + vurderingsskjema
  auth.tsx              Innlogging/registrering
components/           Gjenbrukbare byggeklosser (stjerner, tags, knapper)
hooks/                Datahenting og tilstand (auth, posisjon, lekeplasser)
lib/                  Ren logikk uten React (Supabase-klient, geo, i18n …)
constants/theme.ts    Farger og avstander – bytt utseende her
supabase/migrations/  SQL som setter opp databasen
__tests__/            Enhetstester for logikken i lib/
```

## Verdt å vite

- **Å se kartet krever ikke innlogging.** Konto trengs først når man vil legge
  til lekeplasser, bilder eller vurderinger.
- **Én vurdering per bruker per lekeplass** – å sende inn på nytt oppdaterer
  den forrige (håndhevet av databasen).
- **Bilder komprimeres på telefonen** (maks 1280 px, JPEG) før opplasting.
- **Sikkerhet ligger i databasen:** Row Level Security sørger for at bare
  eieren kan endre/slette egne rader, uansett hva klienten prøver på.
- Sletter du en lekeplass, slettes rader for bilder/vurderinger automatisk,
  men selve bildefilene blir liggende igjen i Storage. Ufarlig for MVP;
  kan ryddes med en databasetrigger eller Edge Function senere.
- Ingen sanntids-/«her nå»-funksjonalitet – bevisst utelatt, se PLAN.md.
