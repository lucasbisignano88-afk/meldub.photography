// public.jsx — écrans côté client : Nav, Accueil, Tarifs, Réservation, Confirmation, Suivi
const { useState, useEffect, useRef } = React;

// Web3Forms : envoie un email à la photographe à chaque demande de réservation.
// Cette clé est publique (utilisable côté client sans danger).
const WEB3FORMS_ACCESS_KEY = "6621df39-47f0-4161-8ac4-ff99db5ad86e";

const COVER_LABEL = { saut: 'saut d’obstacles', coeur: 'lifestyle', dressage: 'dressage', cross: 'cross / complet' };
const IG = 'https://www.instagram.com/melaniedubois_photography/';

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const root = document.querySelector('[data-scroll-root]');
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > threshold);
    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function scrollToId(id) {
  const el = document.getElementById(id);
  const root = document.querySelector('[data-scroll-root]');
  if (el && root) root.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' });
}

// ── Navigation publique ───────────────────────────────────────
function PublicNav({ overHero }) {
  const { device, navigate, route } = useApp();
  const scrolled = useScrolled(60);
  const [open, setOpen] = useState(false);
  const solid = !overHero || scrolled;
  const isMob = device === 'mobile';

  const go = (action) => { setOpen(false); action(); };
  const links = [
    { label: 'Les concours', fn: () => route.name === 'home' ? scrollToId('concours') : navigate('home', { scrollTo: 'concours' }) },
    { label: 'À propos', fn: () => route.name === 'home' ? scrollToId('apropos') : navigate('home', { scrollTo: 'apropos' }) },
    { label: 'Tarifs', fn: () => navigate('pricing') },
  ];

  return (
    <React.Fragment>
      <nav className={'pubnav' + (solid ? ' solid' : '') + (isMob ? ' is-m' : '')}>
        <button className="pubnav-logo" onClick={() => navigate('home')}>
          <Logo size="md" light={!solid} />
        </button>
        {!isMob && (
          <div className="pubnav-links">
            {links.map(l => <button key={l.label} className="pubnav-link" onClick={l.fn}>{l.label}</button>)}
            <button className="pubnav-cta" onClick={() => navigate('admin-login')}>
              <Icon name="lock" size={14} /> Espace photographe
            </button>
          </div>
        )}
        {isMob && (
          <button className={'burger' + (open ? ' x' : '')} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span></span><span></span>
          </button>
        )}
      </nav>

      {isMob && (
        <div className={'menu-overlay' + (open ? ' open' : '')}>
          <div className="menu-inner">
            {links.map((l, i) => (
              <button key={l.label} className="menu-link" style={{ transitionDelay: (80 + i * 60) + 'ms' }} onClick={() => go(l.fn)}>
                <span className="menu-num">0{i + 1}</span>{l.label}
              </button>
            ))}
            <button className="menu-admin" style={{ transitionDelay: '280ms' }} onClick={() => go(() => navigate('admin-login'))}>
              <Icon name="lock" size={16} /> Espace photographe
            </button>
            <a className="menu-ig" style={{ transitionDelay: '340ms' }} href={IG} target="_blank" rel="noopener noreferrer">
              <Icon name="instagram" size={18} /> @melaniedubois_photography
            </a>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

// ── Carte concours ────────────────────────────────────────────
function EventCard({ ev, onBook, delay = 0 }) {
  return (
    <Reveal className="evt-card" delay={delay}>
      <div className="evt-cover-wrap">
        <Photo src={PHOTOS[ev.cover]} label={ev.name} ratio="16 / 10" radius={0} className="evt-cover" focus="center 38%" />
        <span className="evt-date-chip"><Icon name="calendar" size={13} />{fmtDates(ev.start, ev.end)}</span>
      </div>
      <div className="evt-body">
        <h3 className="evt-name">{ev.name}</h3>
        <div className="evt-meta">
          <span><Icon name="pin" size={15} />{ev.place}</span>
        </div>
        <Btn block size="lg" iconRight="arrow" onClick={() => onBook(ev.id)}>Je réserve ma séance</Btn>
      </div>
    </Reveal>
  );
}

// ── Accueil ───────────────────────────────────────────────────
function Home() {
  const { device, events, navigate, route, gallery, hero, concoursCount } = useApp();
  const isMob = device === 'mobile';
  const pub = events.filter(e => e.published && !e.archived);
  const [slide, setSlide] = useState(0);
  const slides = (hero && hero.length ? hero : HERO_SLIDES).map(h => ({
    src: h.key ? PHOTOS[h.key] : h.src,
    focus: h.focus || 'center 42%',
  }));
  const ROT = ['concours', 'shootings', 'souvenirs'];
  const [rot, setRot] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setRot(r => (r + 1) % ROT.length), 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (route.scrollTo) {
      const t = setTimeout(() => scrollToId(route.scrollTo), 240);
      return () => clearTimeout(t);
    }
  }, [route.scrollTo, route.name]);

  return (
    <div className="home">
      <PublicNav overHero />

      {/* HERO cinématique */}
      <header className="hero" style={{ height: isMob ? 624 : 700 }}>
        {slides.map((s, i) => (
          <div key={i} className={'hero-slide' + (i === slide ? ' on' : '')}>
            <Photo src={s.src} label="" ratio="auto" radius={0} kenburns={i === slide}
              className="hero-photo" focus={s.focus} style={{ height: '100%' }} />
          </div>
        ))}
        <div className="hero-grad" />
        <div className="hero-content" style={isMob ? null : { maxWidth: 860 }}>
          <span className="eyebrow eyebrow-light">Photographe équestre</span>
          <h1 className="hero-title">
            <span className="hl-word">Je</span> <span className="hl-word">capture</span><br />
            <span className="hl-word">vos</span>{' '}
            <span className="hl-word hl-accent hl-rotate">
              <span className="hl-sizer">souvenirs.</span>
              {ROT.map((w, i) => (
                <span key={w} className={'hl-rot-word' + (i === rot ? ' on' : i === (rot - 1 + ROT.length) % ROT.length ? ' prev' : '')}>{w}.</span>
              ))}
            </span>
          </h1>
          <p className="hero-sub">Concours, séances privées, balades sur la plage : chaque foulée, chaque regard entre toi et ton cheval, gardés pour toujours.</p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={() => scrollToId('concours')}>Voir les prochains concours <Icon name="arrow" size={18} /></button>
            <button className="hero-cta ghost" onClick={() => navigate('pricing')}>Les tarifs</button>
          </div>
        </div>
        <button className="hero-scroll" onClick={() => scrollToId('concours')} aria-label="Défiler"><Icon name="down" size={20} /></button>
        <div className="hero-dots">
          {slides.map((_, i) => <button key={i} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={'Photo ' + (i + 1)} />)}
        </div>
      </header>

      {/* CONCOURS */}
      <section className="section" id="concours">
        <Reveal className="section-head">
          <span className="eyebrow">Réservation</span>
          <h2 className="section-title">Prochains concours<br />où je serai</h2>
          <p className="section-lead">Tu y es engagé ? Réserve ta séance en deux minutes, je te repère sur le terrain et je m’occupe du reste.</p>
        </Reveal>
        <div className={isMob ? 'evt-list' : 'evt-grid'}>
          {pub.map((ev, i) => <EventCard key={ev.id} ev={ev} delay={i * 90} onBook={(id) => navigate('booking', { eventId: id })} />)}
        </div>
      </section>

      {/* À PROPOS */}
      <section className="section section-alt about" id="apropos">
        <div className={'about-grid' + (isMob ? ' m' : '')}>
          <Reveal className="about-photo-wrap">
            <Photo src={PHOTOS.mel} label="Mel, photographe" ratio="4 / 5" radius={22} className="about-photo" focus="center 26%" />
          </Reveal>
          <Reveal className="about-text" delay={120}>
            <span className="eyebrow">Qui suis-je</span>
            <h2 className="section-title">Salut, moi<br />c’est Mel.</h2>
            <p>Cavalière avant d’être photographe, je sais ce que c’est d’attendre LA photo de son passage. Alors je me poste au pied de l’obstacle, l’œil dans le viseur, pour attraper l’instant juste : la détente du saut, la complicité, le regard.</p>
            <p>Je sillonne les concours de la région. Tu réserves ici, je te shoote sur place, et tu reçois tes photos triées et retouchées. Simple, comme une story.</p>
            <div className="about-stats">
              <div><b>{concoursCount || '120+'}</b><span>concours couverts</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALERIE réalisations */}
      <section className="section gallery-sec" id="realisations">
        <Reveal className="section-head center">
          <span className="eyebrow">Portfolio</span>
          <h2 className="section-title">Mes réalisations</h2>
          <p className="section-lead" style={{ margin: '14px auto 0' }}>Saut, dressage, complet, horse-ball ou balade sur la plage : un aperçu de ce que je ramène des concours.</p>
        </Reveal>
        <Reveal className={'gallery-grid' + (isMob ? ' m' : '')}>
          {(gallery || []).map((it) => {
            const src = it.key ? PHOTOS[it.key] : it.src;
            return (
              <figure className={'ms-item ' + (it.wide ? 'wide' : 'tall')} key={it.id}>
                <Photo src={src} label="" ratio="auto" radius={0} className="ms-photo" style={{ height: '100%' }} focus="center 38%" />
              </figure>
            );
          })}
        </Reveal>
        <a className="ig-link" href={IG} target="_blank" rel="noopener noreferrer">
          <Icon name="instagram" size={20} /> Suis le reste sur Instagram <span className="mono">@melaniedubois_photography</span>
        </a>
      </section>

      {/* BANDEAU CTA */}
      <Reveal as="section" className="cta-band">
        <Photo src={PHOTOS.coeur} label="" ratio="auto" radius={0} className="cta-band-bg" focus="center 24%" />
        <div className="cta-band-grad" />
        <div className="cta-band-inner">
          <span className="eyebrow eyebrow-light">On se voit bientôt ?</span>
          <h2>Réserve ta séance<br />pour ton prochain concours.</h2>
          <Btn size="lg" variant="light" iconRight="arrow" onClick={() => scrollToId('concours')}>Choisir mon concours</Btn>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}

// ── Pied de page commun (public) ──────────────────────────────
function Footer() {
  const { navigate } = useApp();
  return (
    <footer className="foot">
      <Logo size="md" light />
      <p className="foot-tag">Photographe équestre, concours de saut, dressage &amp; complet, partout en région.</p>
      <div className="foot-links">
        <a href={IG} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={18} /> Instagram</a>
        <a href="#" onClick={(e) => e.preventDefault()}><Icon name="mail" size={18} /> Écris-moi</a>
        <button onClick={() => navigate('pricing')}><Icon name="sparkle" size={18} /> Tarifs</button>
      </div>
      <button className="foot-admin" onClick={() => navigate('admin-login')}>
        <Icon name="lock" size={13} /> Espace photographe
      </button>
    </footer>
  );
}

// ── Tarifs ────────────────────────────────────────────────────
function Pricing() {
  const { device, navigate, pricing } = useApp();
  const isMob = device === 'mobile';
  const data = pricing || DEFAULT_PRICING;
  const concours = data.concours || [];
  const shooting = data.shooting || [];

  const fromPrice = (arr) => arr.reduce((m, p) => Math.min(m, parseInt(p.price, 10) || Infinity), Infinity);

  const jump = (id) => {
    const el = document.getElementById(id);
    const root = document.querySelector('[data-scroll-root]');
    if (el && root) root.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  };

  const card = (p, i) => (
    <Reveal key={p.id || p.name} className={'price-card' + (p.tag ? ' featured' : '')} delay={i * 80}>
      {p.tag ? <span className="price-tag">{p.tag}</span> : null}
      <div className="price-head">
        <h3>{p.name}</h3>
        {p.meta ? <span className="price-meta"><Icon name="clock" size={13} />{p.meta}</span> : null}
        <p className="price-lead">{p.lead}</p>
      </div>
      <div className="price-amount"><span className="price-num">{p.price}</span><span className="price-unit">€</span></div>
      <ul className="price-feats">
        {(p.feats || []).map((f, k) => <li key={k}><Icon name="check" size={16} stroke={2.4} /><span>{f}</span></li>)}
      </ul>
      <Btn block size="lg" variant={p.tag ? 'primary' : 'soft'} iconRight="arrow"
        onClick={() => navigate('home', { scrollTo: 'concours' })}>Réserver</Btn>
    </Reveal>
  );

  const catHead = (num, eyebrow, title, lead, id) => (
    <Reveal className="price-cat-head" as="div">
      <div className="cat-title-row" id={id}>
        <span className="cat-num">{num}</span>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="cat-title">{title}</h2>
        </div>
      </div>
      <p className="section-lead">{lead}</p>
    </Reveal>
  );

  return (
    <div className="pricing-page">
      <PublicNav overHero />
      <header className="pricing-hero">
        <Photo src={PHOTOS.g8} label="" ratio="auto" radius={0} className="pricing-hero-bg" focus="center 30%" />
        <div className="pricing-hero-grad" />
        <Reveal className="pricing-hero-content">
          <span className="eyebrow eyebrow-light">Tarifs &amp; prestations</span>
          <h1>Deux façons de<br />travailler ensemble.</h1>
          <p>Sur les concours ou en séance privée, dans les deux cas le traitement, les retouches et l’envoi sont compris.</p>
        </Reveal>
      </header>

      {/* INTRO — deux prestations visibles d'un coup */}
      <section className="section presta-intro-sec">
        <div className={'presta-switch' + (isMob ? ' m' : '')}>
          <Reveal className="presta-card" as="button" onClick={() => jump('tarif-concours')}>
            <Photo src={PHOTOS.g3} label="" ratio="16 / 10" radius={0} className="presta-cover" focus="center 36%" />
            <div className="presta-body">
              <span className="presta-num">01</span>
              <h3>Sur les concours</h3>
              <p>Je te shoote en épreuve, sur le terrain.</p>
              <span className="presta-from">dès {fromPrice(concours)} €<Icon name="down" size={16} /></span>
            </div>
          </Reveal>
          <Reveal className="presta-card" as="button" delay={90} onClick={() => jump('tarif-shooting')}>
            <Photo src={PHOTOS.g6} label="" ratio="16 / 10" radius={0} className="presta-cover" focus="center 30%" />
            <div className="presta-body">
              <span className="presta-num">02</span>
              <h3>En séance privée</h3>
              <p>Un shooting rien qu’à toi et ton cheval.</p>
              <span className="presta-from">dès {fromPrice(shooting)} €<Icon name="down" size={16} /></span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONCOURS */}
      <section className="section pricing-grid-sec">
        {catHead('01', 'Sur les concours', 'Je te shoote en épreuve',
          'Je te repère sur le terrain et je capture ton passage. Tu choisis ensuite la formule qui te va.', 'tarif-concours')}
        <div className={'price-grid price-grid-4' + (isMob ? ' m' : '')}>
          {concours.map(card)}
        </div>
        <p className="price-allin"><Icon name="check" size={15} stroke={2.4} /> {data.concoursNote}</p>
      </section>

      {/* SHOOTING */}
      <section className="section section-alt pricing-grid-sec">
        {catHead('02', 'En séance privée', 'Un shooting rien qu’à vous',
          'Toi et ton cheval, le temps d’une séance dédiée : à l’écurie, en extérieur ou sur la plage.', 'tarif-shooting')}
        <div className={'price-grid' + (isMob ? ' m' : '')}>
          {shooting.map(card)}
        </div>
        <p className="price-allin"><Icon name="check" size={15} stroke={2.4} /> {data.shootingNote}</p>
      </section>

      <section className="section pricing-notes-sec">
        <Reveal className="pricing-notes">
          <div className="pnote"><Icon name="lock" size={18} /><div><b>Règlement sur place</b><span>Espèces ou virement le jour du concours. Aucun paiement en ligne.</span></div></div>
          <div className="pnote"><Icon name="sparkle" size={18} /><div><b>Cavaliers de club</b><span>Vous venez à plusieurs du même club ? Écris-moi, je fais un prix de groupe.</span></div></div>
          <div className="pnote"><Icon name="instagram" size={18} /><div><b>Une question ?</b><span>Le plus simple reste un petit message en DM, je réponds vite.</span></div></div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

// ── Réservation ───────────────────────────────────────────────
function Booking() {
  const { route, getEvent, addBooking, navigate } = useApp();
  const ev = getEvent(route.eventId);
  const [f, setF] = useState({ firstName: '', lastName: '', horse: '', slot: '', email: '', contact: '' });
  const [err, setErr] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));

  if (!ev) return <Empty onHome={() => navigate('home')} />;

  const submit = async () => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = 'Ton prénom, s’il te plaît.';
    if (!f.lastName.trim()) e.lastName = 'Et ton nom.';
    if (!f.horse.trim()) e.horse = 'Le nom de ton cheval.';
    if (!f.email.trim() && !f.contact.trim()) e.contact = 'Laisse-moi au moins un moyen de te joindre.';
    setErr(e);
    if (Object.keys(e).length) return;

    setSendError('');
    setSending(true);

    // Notifie la photographe par email via Web3Forms (tous les champs du formulaire).
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Nouvelle demande de réservation – ' + f.firstName + ' ' + f.lastName,
          from_name: 'Site Mélanie Dubois Photography',
          prenom: f.firstName,
          nom: f.lastName,
          cheval: f.horse,
          epreuve_ou_heure: f.slot,
          email: f.email,
          instagram_ou_telephone: f.contact,
          concours: ev.name,
          lieu: ev.place,
          dates: fmtDates(ev.start, ev.end),
        }),
      });
      const data = await res.json();
      if (!data || data.success !== true) {
        throw new Error(data && data.message ? data.message : 'Web3Forms: success !== true');
      }
      // Succès : on enregistre la démo locale puis on affiche la confirmation au visiteur.
      const id = addBooking({ eventId: ev.id, ...f });
      navigate('confirm', { bookingId: id });
    } catch (sendErr) {
      console.error('Échec de l’envoi de la réservation (Web3Forms) :', sendErr);
      setSending(false);
      setSendError("L’envoi n’a pas pu aboutir. Vérifie ta connexion et réessaie dans un instant — ou écris-moi directement en message privé Instagram.");
    }
  };

  return (
    <Screen title="Réservation" onBack={() => navigate('home')}>
      <div className="recap recap-photo">
        <Photo src={PHOTOS[ev.cover]} label={ev.name} ratio="16 / 9" radius={16} className="recap-cover" focus="center 36%" />
        <div className="recap-body">
          <span className="eyebrow">Concours choisi</span>
          <h2 className="recap-name">{ev.name}</h2>
          <div className="recap-meta">
            <span><Icon name="pin" size={15} />{ev.place}</span>
            <span><Icon name="calendar" size={15} />{fmtDates(ev.start, ev.end)}</span>
          </div>
        </div>
      </div>

      <form className="form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="form-row2">
          <Field label="Prénom" value={f.firstName} onChange={set('firstName')} placeholder="Camille" required error={err.firstName} autoFocus />
          <Field label="Nom" value={f.lastName} onChange={set('lastName')} placeholder="Rousseau" required error={err.lastName} />
        </div>
        <Field label="Nom du cheval" value={f.horse} onChange={set('horse')} placeholder="Vivaldi du Pré" icon="horse" required error={err.horse} />
        <Field label="Épreuve ou heure de passage" value={f.slot} onChange={set('slot')} placeholder="Épreuve 2, vers 10h30" icon="clock"
               hint="Une idée approximative suffit, je m’adapte." />
        <div className="form-div"><span>Comment te joindre&nbsp;?</span></div>
        <Field label="Email" value={f.email} onChange={set('email')} placeholder="camille@email.fr" type="email" icon="mail" />
        <Field label="Instagram ou téléphone" value={f.contact} onChange={set('contact')} placeholder="@camille.eque  ·  06 …" icon="instagram" error={err.contact} />

        {sendError && (
          <p className="field-err" style={{ textAlign: 'center', fontSize: 13.5, lineHeight: 1.5 }} role="alert">{sendError}</p>
        )}
        <Btn block size="lg" type="submit" iconRight={sending ? null : 'arrow'} disabled={sending}>
          {sending ? 'Envoi en cours…' : 'Je réserve'}
        </Btn>
        <p className="form-note"><Icon name="lock" size={14} /> Aucun paiement ici : tu règles sur place, au concours.</p>
      </form>
    </Screen>
  );
}

// ── Confirmation ──────────────────────────────────────────────
function Confirm() {
  const { route, getBooking, getEvent, navigate } = useApp();
  const b = getBooking(route.bookingId);
  if (!b) return <Empty onHome={() => navigate('home')} />;
  const ev = getEvent(b.eventId);

  return (
    <Screen onBack={() => navigate('home')} bare>
      <div className="confirm">
        <div className="confirm-badge"><Icon name="check" size={34} stroke={2.6} /></div>
        <h1 className="confirm-title">C’est réservé&nbsp;!</h1>
        <p className="confirm-lead">Merci {b.firstName}. Je note {b.horse} pour le <strong>{ev?.name}</strong>. On se voit là-bas.</p>

        <p className="confirm-hint">Mélanie te recontactera et t’enverra tes photos après le concours.</p>

        <button className="link-btn" onClick={() => navigate('home')}>Retour à l’accueil</button>
      </div>
    </Screen>
  );
}

// ── Suivi (page la plus importante) ───────────────────────────
function Track() {
  const { route, getBooking, getEvent, navigate } = useApp();
  const b = getBooking(route.bookingId);
  if (!b) return <Empty onHome={() => navigate('home')} />;
  const ev = getEvent(b.eventId);
  const cur = statusOf(b.status);
  const ready = b.status === 'sent' && b.wetransfer;

  return (
    <Screen onBack={() => navigate('home')} title="Mon suivi">
      <div className="track">
        <div className="track-head">
          <span className="eyebrow">Réservation de {b.firstName}</span>
          <h2 className="track-name">{b.horse}</h2>
          <div className="recap-meta">
            <span><Icon name="camera" size={15} />{ev?.name}</span>
            <span><Icon name="pin" size={15} />{ev?.place}</span>
          </div>
        </div>

        <div className={'track-status track-' + b.status}>
          <Stepper current={cur} />
        </div>

        {ready ? (
          <div className="track-ready">
            <div className="ready-spark"><Icon name="sparkle" size={20} /></div>
            <h3>Tes photos sont prêtes&nbsp;!</h3>
            <p>Télécharge-les avant l’expiration du lien, et n’hésite pas à m’identifier si tu les partages.</p>
            <Btn block size="lg" icon="download" variant="primary"
                 onClick={() => window.open(b.wetransfer, '_blank')}>Télécharger mes photos</Btn>
            <span className="ready-host mono">via WeTransfer</span>
          </div>
        ) : (
          <div className="track-wait">
            <Icon name="clock" size={18} />
            <p>Je te préviens dès que c’est en ligne, promis, ça vaut l’attente.</p>
          </div>
        )}

        <a className="track-dm" href={IG} target="_blank" rel="noopener noreferrer">
          <Icon name="instagram" size={18} /> Une question&nbsp;? Écris-moi en DM
        </a>
      </div>
    </Screen>
  );
}

// ── Coquilles partagées ───────────────────────────────────────
function Screen({ title, onBack, children, bare, bleed }) {
  const { device } = useApp();
  if (bleed) {
    return <div className="screen screen-bleed">{children}</div>;
  }
  return (
    <div className={'screen' + (bare ? ' screen-bare' : '')}>
      {onBack ? (
        <div className="screen-bar">
          <button className="iconbtn" onClick={onBack}><Icon name="back" size={20} /></button>
          {title && <span className="screen-bar-title">{title}</span>}
          <span style={{ width: 40 }} />
        </div>
      ) : (
        <div className="screen-safe" />
      )}
      <div className={'screen-body' + (device === 'desktop' ? ' screen-narrow' : '')}>{children}</div>
    </div>
  );
}

function Empty({ onHome }) {
  return (
    <div className="screen"><div className="screen-body" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ color: 'var(--muted)' }}>Ce lien n’existe plus.</p>
      <Btn variant="ghost" onClick={onHome}>Retour à l’accueil</Btn>
    </div></div>
  );
}

Object.assign(window, { Home, Pricing, Booking, Confirm, Track, Screen, EventCard, Footer, Empty, PublicNav, COVER_LABEL, scrollToId });
