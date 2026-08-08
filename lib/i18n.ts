// All user-visible text in the app lives here, in Norwegian (primary) and
// English. Screens look strings up by key via the useI18n() hook, so adding a
// language or fixing a typo only ever touches this file.

export type Language = 'nb' | 'en';

const nb = {
  // Common
  appName: 'Lekeplass Rater',
  cancel: 'Avbryt',
  save: 'Lagre',
  delete: 'Slett',
  edit: 'Endre',
  retry: 'Prøv igjen',
  loading: 'Laster …',
  genericError: 'Noe gikk galt. Prøv igjen.',

  // Tabs
  tabMap: 'Kart',
  tabAdd: 'Legg til',
  tabProfile: 'Profil',

  // Map screen
  distanceFilter: 'Avstand',
  filterAll: 'Alle',
  locationDenied:
    'Appen har ikke tilgang til posisjonen din. Kartet viser et standardområde – gi posisjonstilgang i innstillingene for å se lekeplasser nær deg.',
  mapEmpty: 'Ingen lekeplasser innenfor {distance}. Prøv et større område, eller legg til en!',

  // Playground detail
  photos: 'Bilder',
  noPhotos: 'Ingen bilder ennå',
  ratings: 'Vurderinger',
  noRatings: 'Ingen vurderinger ennå – bli den første!',
  basedOnOne: 'Basert på 1 vurdering',
  basedOnMany: 'Basert på {count} vurderinger',
  safety: 'Sikkerhet',
  facilities: 'Fasiliteter',
  variety: 'Størrelse og variasjon',
  suitableFor: 'Passer for',
  age_0_2: 'Småbarn (0–2 år)',
  age_3_6: '3–6 år',
  age_6_12: '6–12 år',
  practicalInfo: 'Praktisk info',
  fenced: 'Inngjerdet',
  notFenced: 'Ikke inngjerdet',
  winterOpen: 'Vinteråpen/brøytet',
  notWinterOpen: 'Ikke vinterbrøytet',
  parkingAt: 'Parkering {distance} unna',
  noParkingInfo: 'Ingen parkeringsinfo',
  shopNearby: 'Kiosk/butikk i gangavstand',
  restroomNearby: 'Stellerom/do i nærheten',
  comments: 'Kommentarer',
  distanceAway: '{distance} unna',
  addRating: 'Gi vurdering',
  editRating: 'Endre din vurdering',
  notFound: 'Fant ikke lekeplassen.',

  // Add playground
  addTitle: 'Ny lekeplass',
  nameLabel: 'Navn på lekeplassen',
  namePlaceholder: 'F.eks. «Torshovparken lekeplass»',
  nameRequired: 'Du må gi lekeplassen et navn.',
  adjustPin: 'Dra i kartnålen (eller trykk i kartet) for å finjustere posisjonen.',
  parkingDistanceLabel: 'Avstand til nærmeste parkering (meter)',
  parkingDistanceHint: 'La feltet stå tomt hvis det ikke finnes parkering i nærheten.',
  addPhotos: 'Legg til bilder',
  takePhoto: 'Ta bilde',
  pickFromGallery: 'Velg fra galleri',
  saving: 'Lagrer …',
  uploadingImages: 'Laster opp bilder …',
  photoUploadFailed: 'Lekeplassen ble lagret, men ett eller flere bilder feilet. Du kan prøve å laste dem opp igjen fra detaljsiden.',

  // Rating screen
  rateTitle: 'Vurder lekeplassen',
  chooseAgeGroup: 'Hvilken aldersgruppe vurderer du for?',
  commentLabel: 'Kommentar (valgfritt)',
  commentPlaceholder: 'Hva bør andre foreldre vite?',
  submitRating: 'Lagre vurdering',
  starsRequired: 'Gi 1–5 stjerner i alle tre kategoriene.',
  yourExistingRating: 'Du har vurdert denne lekeplassen før – innsending oppdaterer den forrige vurderingen.',

  // Auth
  signIn: 'Logg inn',
  signUp: 'Registrer deg',
  email: 'E-post',
  password: 'Passord',
  passwordHint: 'Minst 6 tegn',
  noAccount: 'Har du ikke konto?',
  haveAccount: 'Har du allerede konto?',
  signOut: 'Logg ut',
  checkEmail: 'Sjekk e-posten din og trykk på bekreftelseslenken, og logg deretter inn.',
  authRequired: 'Du må være innlogget for å bidra.',
  authRequiredExplainer: 'Logg inn for å legge til lekeplasser, bilder og vurderinger. Å se kartet krever ingen konto.',

  // Profile
  signedInAs: 'Innlogget som',
  myRatings: 'Mine vurderinger',
  myPlaygrounds: 'Mine lekeplasser',
  noContributions: 'Du har ingen bidrag ennå.',
  deleteRatingConfirm: 'Slette vurderingen din?',
  deletePlaygroundConfirm:
    'Slette lekeplassen? Alle bilder og vurderinger knyttet til den slettes også.',
  language: 'Språk',
  languageNb: 'Norsk',
  languageEn: 'English',
};

// English mirrors the Norwegian keys 1:1. TypeScript enforces that no key is
// missing, so the app can never show a "missing translation" hole.
const en: Record<TranslationKey, string> = {
  appName: 'Playground Rater',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  retry: 'Try again',
  loading: 'Loading …',
  genericError: 'Something went wrong. Please try again.',

  tabMap: 'Map',
  tabAdd: 'Add',
  tabProfile: 'Profile',

  distanceFilter: 'Distance',
  filterAll: 'All',
  locationDenied:
    'The app does not have access to your location. The map shows a default area — grant location access in Settings to see playgrounds near you.',
  mapEmpty: 'No playgrounds within {distance}. Try a wider area, or add one!',

  photos: 'Photos',
  noPhotos: 'No photos yet',
  ratings: 'Ratings',
  noRatings: 'No ratings yet — be the first!',
  basedOnOne: 'Based on 1 rating',
  basedOnMany: 'Based on {count} ratings',
  safety: 'Safety',
  facilities: 'Facilities',
  variety: 'Size and variety',
  suitableFor: 'Suitable for',
  age_0_2: 'Toddlers (0–2 yrs)',
  age_3_6: '3–6 yrs',
  age_6_12: '6–12 yrs',
  practicalInfo: 'Practical info',
  fenced: 'Fenced',
  notFenced: 'Not fenced',
  winterOpen: 'Open/plowed in winter',
  notWinterOpen: 'Not plowed in winter',
  parkingAt: 'Parking {distance} away',
  noParkingInfo: 'No parking info',
  shopNearby: 'Kiosk/shop within walking distance',
  restroomNearby: 'Changing room/toilet nearby',
  comments: 'Comments',
  distanceAway: '{distance} away',
  addRating: 'Rate this playground',
  editRating: 'Edit your rating',
  notFound: 'Playground not found.',

  addTitle: 'New playground',
  nameLabel: 'Playground name',
  namePlaceholder: 'E.g. “Central Park playground”',
  nameRequired: 'Please give the playground a name.',
  adjustPin: 'Drag the pin (or tap the map) to fine-tune the position.',
  parkingDistanceLabel: 'Distance to nearest parking (meters)',
  parkingDistanceHint: 'Leave empty if there is no parking nearby.',
  addPhotos: 'Add photos',
  takePhoto: 'Take photo',
  pickFromGallery: 'Choose from gallery',
  saving: 'Saving …',
  uploadingImages: 'Uploading photos …',
  photoUploadFailed: 'The playground was saved, but one or more photos failed. You can retry from the detail page.',

  rateTitle: 'Rate the playground',
  chooseAgeGroup: 'Which age group are you rating for?',
  commentLabel: 'Comment (optional)',
  commentPlaceholder: 'What should other parents know?',
  submitRating: 'Save rating',
  starsRequired: 'Give 1–5 stars in all three categories.',
  yourExistingRating: 'You have rated this playground before — submitting updates your previous rating.',

  signIn: 'Sign in',
  signUp: 'Sign up',
  email: 'Email',
  password: 'Password',
  passwordHint: 'At least 6 characters',
  noAccount: 'No account?',
  haveAccount: 'Already have an account?',
  signOut: 'Sign out',
  checkEmail: 'Check your email, tap the confirmation link, then sign in.',
  authRequired: 'You need to be signed in to contribute.',
  authRequiredExplainer:
    'Sign in to add playgrounds, photos and ratings. Browsing the map requires no account.',

  signedInAs: 'Signed in as',
  myRatings: 'My ratings',
  myPlaygrounds: 'My playgrounds',
  noContributions: 'You have no contributions yet.',
  deleteRatingConfirm: 'Delete your rating?',
  deletePlaygroundConfirm:
    'Delete the playground? All photos and ratings attached to it are deleted too.',
  language: 'Language',
  languageNb: 'Norsk',
  languageEn: 'English',
};

export type TranslationKey = keyof typeof nb;

export const translations: Record<Language, Record<TranslationKey, string>> = { nb, en };

/** Replaces {placeholders} in a translated string: format("Hi {name}", {name: 'Al'}). */
export function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match
  );
}
