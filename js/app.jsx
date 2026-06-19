// app.jsx — montage du site en plein écran (sans coquille de prototype)
// Charge en dernier. Le device (mobile/desktop) suit la vraie largeur du viewport.
const { useState, useEffect } = React;

// ── Routeur ───────────────────────────────────────────────────
function Router() {
  const { route, auth } = useApp();
  const n = route.name;
  if (n.startsWith('admin-') && n !== 'admin-login' && !auth) return <AdminLogin />;
  switch (n) {
    case 'home':          return <Home />;
    case 'pricing':       return <Pricing />;
    case 'booking':       return <Booking />;
    case 'confirm':       return <Confirm />;
    case 'track':         return <Track />;
    case 'admin-login':   return <AdminLogin />;
    case 'admin-dash':    return <AdminDash />;
    case 'admin-event':   return <AdminEvent />;
    case 'admin-new':     return <AdminNew />;
    case 'admin-pricing': return <AdminPricing />;
    case 'admin-gallery': return <AdminGallery />;
    default:              return <Home />;
  }
}

// Au-delà de cette largeur, on bascule sur la mise en page desktop
// (grilles multi-colonnes). En dessous : mise en page mobile, une colonne.
const DESKTOP_MQ = '(min-width: 820px)';

// ── Application ───────────────────────────────────────────────
function App() {
  const [device, setDevice] = useState(
    () => (window.matchMedia(DESKTOP_MQ).matches ? 'desktop' : 'mobile')
  );
  const [anim, setAnim] = useState(false);

  // Suit la largeur réelle de la fenêtre : remplace l'ancien toggle Mobile/Desktop.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setDevice(mq.matches ? 'desktop' : 'mobile');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Active les animations de reveal une fois la première frame peinte.
  useEffect(() => {
    let r2;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setAnim(true)); });
    return () => { cancelAnimationFrame(r1); if (r2) cancelAnimationFrame(r2); };
  }, []);

  return (
    <AppProvider device={device}>
      <div
        data-scroll-root
        className={
          'scroll-root ' +
          (device === 'mobile' ? 'is-mobile' : 'is-desktop') +
          (anim ? ' js-anim' : '')
        }
      >
        <Router />
      </div>
    </AppProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
