// store.jsx — état global, données de démo, persistance, helpers
// Exporte vers window: AppCtx, useApp, AppProvider, fmtDates, STEPS, statusOf, money

const { createContext, useContext, useState, useEffect, useCallback, useRef } = React;

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

const STEPS = [
  { key: 'confirmed', label: 'Réservation confirmée', sub: 'On se voit au concours.' },
  { key: 'working',   label: 'Je m’occupe de tes photos', sub: 'Tri et retouche en cours.' },
  { key: 'sent',      label: 'Photos envoyées', sub: 'À toi de jouer, télécharge-les.' },
];
const statusOf = (key) => STEPS.findIndex(s => s.key === key);

const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function fmtDates(start, end) {
  const d1 = new Date(start + 'T00:00:00');
  if (!end || end === start) {
    return `${d1.getDate()} ${MOIS[d1.getMonth()]} ${d1.getFullYear()}`;
  }
  const d2 = new Date(end + 'T00:00:00');
  if (d1.getMonth() === d2.getMonth()) {
    return `${d1.getDate()} – ${d2.getDate()} ${MOIS[d1.getMonth()]} ${d1.getFullYear()}`;
  }
  return `${d1.getDate()} ${MOIS[d1.getMonth()]} – ${d2.getDate()} ${MOIS[d2.getMonth()]} ${d2.getFullYear()}`;
}

const uid = (p) => p + Math.random().toString(36).slice(2, 7);

// Vraies photos de Mélanie (window.__resources si bundle hors-ligne, sinon chemins relatifs)
const _R = (typeof window !== 'undefined' && window.__resources) || {};
const P = (id, file) => _R[id] || ('photos/' + file);
const PHOTOS = {
  mel:  P('mel', 'mel.jpg'),     // portrait de la photographe
  // réalisations
  g1:  P('g1', 'g1.jpg'),   // dressage cheval noir
  g2:  P('g2', 'g2.jpg'),   // dressage cheval bai, Jump'Est
  g3:  P('g3', 'g3.jpg'),   // saut, cheval gris, obstacle rouge
  g4:  P('g4', 'g4.jpg'),   // plage, cheval bai dans l'eau
  g5:  P('g5', 'g5.jpg'),   // plage, galop cheval gris
  g6:  P('g6', 'g6.jpg'),   // plage, cavalière penchée cheval alezan
  g7:  P('g7', 'g7.jpg'),   // saut, obstacle turquoise
  g8:  P('g8', 'g8.jpg'),   // saut, alezan, drapeau / clocher
  g9:  P('g9', 'g9.jpg'),   // horse-ball
  g10: P('g10', 'g10.jpg'), // dressage cheval gris, lunettes
  g11: P('g11', 'g11.jpg'), // saut, alezan, clocher
};
// alias pour compat anciens écrans
PHOTOS.saut = PHOTOS.g7;
PHOTOS.coeur = PHOTOS.g4;

// Carrousel d'accueil (paysages dynamiques) + galerie complète
const HERO_SLIDES = [
  { src: PHOTOS.g5, focus: 'center 42%' },
  { src: PHOTOS.g7, focus: 'center 40%' },
  { src: PHOTOS.g4, focus: 'center 46%' },
];
const HERO_KEYS = [
  { key: 'g5', focus: 'center 42%' },
  { key: 'g7', focus: 'center 40%' },
  { key: 'g4', focus: 'center 46%' },
];
const seedHero = () => HERO_KEYS.map((h, i) => ({ id: 'h' + i, ...h }));
const GALLERY = ['g8','g4','g1','g3','g5','g11','g10','g7','g6','g9','g2'];
const LANDSCAPE = ['g4','g5','g7','g9'];
// Photos intégrées disponibles pour la galerie (hors portrait 'mel')
const GALLERY_POOL = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11'];
const seedGallery = () => GALLERY.map(k => ({ id: k, key: k, wide: LANDSCAPE.includes(k) }));

// Tarifs par défaut (modifiables depuis l'espace photographe)
const DEFAULT_PRICING = {
  concours: [
    { id: 'c1', name: 'À l’unité', price: '5', tag: '',
      lead: 'Une photo, juste celle que tu veux.',
      feats: ['1 photo de ton choix', 'Traitement & retouche', 'Format numérique pleine résolution'] },
    { id: 'c2', name: 'Pack découverte', price: '15', tag: '',
      lead: 'Les 5 plus belles de ton passage.',
      feats: ['5 photos au choix', 'De ton match, tour ou reprise', 'Traitement & retouche', 'Envoi numérique'] },
    { id: 'c3', name: 'Pack numérique', price: '20', tag: 'Le plus choisi',
      lead: 'Toutes les photos de ton épreuve.',
      feats: ['Toutes les photos de ton match, tour ou reprise', 'Traitement & retouche', 'Galerie privée à télécharger'] },
    { id: 'c4', name: 'Pack concours', price: '30', tag: '',
      lead: 'L’épreuve + les coulisses du paddock.',
      feats: ['Toutes les photos de ton tour ou reprise', '+ les photos du paddock', '+10 € pour 2 tours et plus', 'Traitement & retouche'] },
  ],
  shooting: [
    { id: 's1', name: 'Pack découverte', price: '25', meta: '15 min de shooting', tag: '',
      lead: 'Une première séance, en douceur.',
      feats: ['5 photos numériques', 'Sélectionnées dans ta galerie', '15 min de shooting'] },
    { id: 's2', name: 'Pack classique', price: '35', meta: '30 min de shooting', tag: 'Le préféré',
      lead: 'De quoi raconter une vraie histoire.',
      feats: ['10 photos numériques', 'Sélectionnées dans ta galerie', '30 min de shooting'] },
    { id: 's3', name: 'Pack prestige', price: '50', meta: '30 min de shooting', tag: '',
      lead: 'Toute la séance, sans en perdre une.',
      feats: ['Toutes les photos de la séance', '30 min de shooting', 'Galerie privée complète'] },
  ],
  concoursNote: 'Tous les prix incluent le traitement, les retouches et l’envoi.',
  shootingNote: 'Retouches, traitement et envoi compris. Des frais kilométriques peuvent s’ajouter au-delà de 20 km.',
};

function seed() {
  const e1 = 'evt-fontainebleau', e2 = 'evt-saumur', e3 = 'evt-pompadour';
  return {
    events: [
      { id: e1, name: 'CSO de Fontainebleau', place: 'Grand Parquet, Fontainebleau',
        start: '2026-06-19', end: '2026-06-21', cover: 'g7', published: true },
      { id: e2, name: 'Dressage de Saumur', place: 'École Nationale d’Équitation, Saumur',
        start: '2026-06-27', end: '2026-06-28', cover: 'g1', published: true },
      { id: e3, name: 'Complet de Pompadour', place: 'Arnac-Pompadour, Corrèze',
        start: '2026-07-04', end: '2026-07-05', cover: 'g3', published: true },
    ],
    bookings: [
      { id: 'mel-7gk2a', eventId: e1, firstName: 'Camille', lastName: 'Rousseau',
        horse: 'Vivaldi du Pré', slot: 'Épreuve 2, vers 10h30', email: 'camille.r@email.fr',
        contact: '@camille.eque', status: 'sent', wetransfer: 'https://we.tl/t-aZ9k2Vivaldi', createdAt: Date.now() - 7e8 },
      { id: 'mel-3p8wq', eventId: e1, firstName: 'Léa', lastName: 'Marchand',
        horse: 'Quordoba', slot: 'Vers 14h00', email: 'lea.marchand@email.fr',
        contact: '06 71 22 90 14', status: 'working', wetransfer: '', createdAt: Date.now() - 6e8 },
      { id: 'mel-9f1xz', eventId: e1, firstName: 'Thomas', lastName: 'Bénard',
        horse: 'Ulysse de la Cour', slot: 'Épreuve 4', email: 'tbenard@email.fr',
        contact: '@thomas_jumping', status: 'confirmed', wetransfer: '', createdAt: Date.now() - 4e8 },
      { id: 'mel-5d6tn', eventId: e1, firstName: 'Inès', lastName: 'Faure',
        horse: 'Sirius', slot: 'Le matin', email: 'ines.faure@email.fr',
        contact: '@ines.f', status: 'confirmed', wetransfer: '', createdAt: Date.now() - 3e8 },
      { id: 'mel-2h4rv', eventId: e2, firstName: 'Mathilde', lastName: 'Garnier',
        horse: 'Opaline', slot: 'Reprise Saint-Georges', email: 'm.garnier@email.fr',
        contact: '@mathilde.dressage', status: 'confirmed', wetransfer: '', createdAt: Date.now() - 2e8 },
      { id: 'mel-8j3bd', eventId: e2, firstName: 'Hugo', lastName: 'Lefèvre',
        horse: 'Naïko', slot: 'Vers 11h', email: 'hugo.lefevre@email.fr',
        contact: '06 88 41 03 77', status: 'working', wetransfer: '', createdAt: Date.now() - 1e8 },
    ],
    pricing: JSON.parse(JSON.stringify(DEFAULT_PRICING)),
    gallery: seedGallery(),
    hero: seedHero(),
    concoursCount: '120+',
  };
}

const LS_KEY = 'mel-store-v6';

function AppProvider({ device, children }) {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seed();
  });
  const [route, setRoute] = useState({ name: 'home' });
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
  }, [data]);

  const navigate = useCallback((name, params = {}) => {
    setRoute({ name, ...params });
    // remonter en haut de la zone scrollable
    requestAnimationFrame(() => {
      const sc = document.querySelector('[data-scroll-root]');
      if (sc) sc.scrollTop = 0;
    });
  }, []);

  // --- actions ---
  const addBooking = useCallback((b) => {
    const id = uid('mel-');
    const booking = { id, status: 'confirmed', wetransfer: '', createdAt: Date.now(), ...b };
    setData(d => ({ ...d, bookings: [...d.bookings, booking] }));
    return id;
  }, []);

  const setBookingStatus = useCallback((id, status) => {
    setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, status } : b) }));
  }, []);

  const setBookingWetransfer = useCallback((id, wetransfer) => {
    setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, wetransfer } : b) }));
  }, []);

  const bulkStatus = useCallback((eventId, status) => {
    setData(d => ({ ...d, bookings: d.bookings.map(b => b.eventId === eventId ? { ...b, status } : b) }));
  }, []);

  const addEvent = useCallback((e) => {
    const id = uid('evt-');
    setData(d => ({ ...d, events: [...d.events, { id, published: true, cover: 'g7', ...e }] }));
    return id;
  }, []);

  const closeEvent = useCallback((id) => {
    setData(d => ({ ...d, events: d.events.map(e => e.id === id ? { ...e, archived: true } : e) }));
  }, []);

  const reopenEvent = useCallback((id) => {
    setData(d => ({ ...d, events: d.events.map(e => e.id === id ? { ...e, archived: false } : e) }));
  }, []);

  const deleteEvent = useCallback((id) => {
    setData(d => ({ ...d,
      events: d.events.filter(e => e.id !== id),
      bookings: d.bookings.filter(b => b.eventId !== id),
    }));
  }, []);

  const updatePricing = useCallback((next) => {
    setData(d => ({ ...d, pricing: typeof next === 'function' ? next(d.pricing) : next }));
  }, []);

  const resetPricing = useCallback(() => {
    setData(d => ({ ...d, pricing: JSON.parse(JSON.stringify(DEFAULT_PRICING)) }));
  }, []);

  // --- galerie réalisations ---
  const addGalleryItem = useCallback((item) => {
    const it = { id: uid('ph-'), wide: false, ...item };
    setData(d => ({ ...d, gallery: [...(d.gallery || []), it] }));
  }, []);

  const removeGalleryItem = useCallback((id) => {
    setData(d => ({ ...d, gallery: (d.gallery || []).filter(g => g.id !== id) }));
  }, []);

  const moveGalleryItem = useCallback((id, dir) => {
    setData(d => {
      const g = [...(d.gallery || [])];
      const i = g.findIndex(x => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= g.length) return d;
      [g[i], g[j]] = [g[j], g[i]];
      return { ...d, gallery: g };
    });
  }, []);

  const resetGallery = useCallback(() => {
    setData(d => ({ ...d, gallery: seedGallery() }));
  }, []);

  // --- carrousel d'accueil ---
  const addHeroItem = useCallback((item) => {
    const it = { id: uid('hr-'), focus: 'center 42%', ...item };
    setData(d => ({ ...d, hero: [...(d.hero || []), it] }));
  }, []);

  const removeHeroItem = useCallback((id) => {
    setData(d => {
      const h = (d.hero || []);
      if (h.length <= 1) return d; // garder au moins une image
      return { ...d, hero: h.filter(x => x.id !== id) };
    });
  }, []);

  const moveHeroItem = useCallback((id, dir) => {
    setData(d => {
      const h = [...(d.hero || [])];
      const i = h.findIndex(x => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= h.length) return d;
      [h[i], h[j]] = [h[j], h[i]];
      return { ...d, hero: h };
    });
  }, []);

  const resetHero = useCallback(() => {
    setData(d => ({ ...d, hero: seedHero() }));
  }, []);

  // --- présentation (à propos) ---
  const setConcoursCount = useCallback((v) => {
    setData(d => ({ ...d, concoursCount: v }));
  }, []);

  const resetDemo = useCallback(() => { setData(seed()); }, []);

  // --- sélecteurs ---
  const getEvent = (id) => data.events.find(e => e.id === id);
  const getBooking = (id) => data.bookings.find(b => b.id === id);
  const bookingsFor = (eventId) => data.bookings.filter(b => b.eventId === eventId);

  const value = {
    device, ...data, route, navigate, auth, setAuth,
    addBooking, setBookingStatus, setBookingWetransfer, bulkStatus, addEvent,
    closeEvent, reopenEvent, deleteEvent, updatePricing, resetPricing,
    addGalleryItem, removeGalleryItem, moveGalleryItem, resetGallery,
    addHeroItem, removeHeroItem, moveHeroItem, resetHero, setConcoursCount, resetDemo,
    getEvent, getBooking, bookingsFor,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

Object.assign(window, { AppCtx, useApp, AppProvider, fmtDates, STEPS, statusOf, PHOTOS, HERO_SLIDES, GALLERY, LANDSCAPE, GALLERY_POOL, DEFAULT_PRICING });