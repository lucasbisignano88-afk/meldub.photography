// admin.jsx — côté photographe : Connexion, Dashboard, Concours, Nouveau concours
// Exporte vers window: AdminLogin, AdminDash, AdminEvent, AdminNew
const { useState, useRef } = React;

const ADMIN_STATUS = [
  { key: 'confirmed', short: 'Reçue', tone: 'neutral' },
  { key: 'working',   short: 'Je m’en occupe', tone: 'work' },
  { key: 'sent',      short: 'Envoyées', tone: 'done' },
];

// ── Mot de passe de l'espace photographe ──────────────────────
// Par défaut "bouboule" ; remplacé par celui enregistré dans localStorage
// dès que la photographe le change depuis son tableau de bord.
const ADMIN_PW_KEY = 'mel-admin-pw';
const DEFAULT_ADMIN_PW = 'bouboule';
const getAdminPw = () => {
  try { return localStorage.getItem(ADMIN_PW_KEY) || DEFAULT_ADMIN_PW; }
  catch (e) { return DEFAULT_ADMIN_PW; }
};
const setAdminPw = (v) => {
  try { localStorage.setItem(ADMIN_PW_KEY, v); } catch (e) {}
};

// ── Mode d'emploi (guide privé pour la photographe) ───────────
// Adresse en ligne du site + email de contact affiché en bas du guide.
const GUIDE_SITE_URL = '[COLLE TON URL ICI]';
const GUIDE_CONTACT = 'melaniedubois@live.fr';

// ── Connexion ─────────────────────────────────────────────────
function AdminLogin() {
  const { setAuth, navigate } = useApp();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (pw.trim().length === 0) { setErr('Entre ton mot de passe.'); return; }
    if (pw !== getAdminPw()) { setErr('Mot de passe incorrect.'); return; }
    setAuth(true);
    navigate('admin-dash');
  };
  return (
    <Screen onBack={() => navigate('home')} bare>
      <div className="login">
        <div className="login-mark"><Icon name="lock" size={26} /></div>
        <h1 className="login-title">Espace photographe</h1>
        <p className="login-lead">Ton studio de pilotage. Réservations, statuts, envois : tout au même endroit.</p>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="form">
          <Field label="Mot de passe" value={pw} onChange={(v) => { setPw(v); setErr(''); }}
                 type="password" placeholder="••••••••" icon="lock" error={err} autoFocus />
          <Btn block size="lg" type="submit" iconRight="arrow">Me connecter</Btn>
        </form>
      </div>
    </Screen>
  );
}

// ── Changer le mot de passe (visible une fois connectée) ──────
function ChangePassword() {
  const [pw, setPw] = useState('');
  const [saved, setSaved] = useState(false);
  const save = () => {
    const v = pw.trim();
    if (!v) return;
    setAdminPw(v);
    setPw('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };
  return (
    <div className="pedit-card">
      <Field label="Nouveau mot de passe" value={pw} onChange={(v) => { setPw(v); setSaved(false); }}
             type="password" placeholder="••••••••" icon="lock"
             hint="Tu l’utiliseras à ta prochaine connexion." />
      <Btn block icon={saved ? 'check' : 'lock'} onClick={save} disabled={!pw.trim()}>
        {saved ? 'Mot de passe enregistré' : 'Enregistrer le mot de passe'}
      </Btn>
      {saved && <span className="pedit-saved"><Icon name="check" size={14} /> Mot de passe mis à jour</span>}
    </div>
  );
}

// ── Tableau de bord ───────────────────────────────────────────
function AdminDash() {
  const { events, bookingsFor, navigate, setAuth, resetDemo, concoursCount, setConcoursCount } = useApp();
  const active = events.filter(e => !e.archived);
  const archived = events.filter(e => e.archived);
  const totalTodo = active.reduce((n, ev) => n + bookingsFor(ev.id).filter(b => b.status !== 'sent').length, 0);

  const eventCard = (ev) => {
    const bs = bookingsFor(ev.id);
    const sent = bs.filter(b => b.status === 'sent').length;
    const todo = bs.filter(b => b.status !== 'sent').length;
    return (
      <button className={'dash-card' + (ev.archived ? ' is-archived' : '')} key={ev.id} onClick={() => navigate('admin-event', { eventId: ev.id })}>
        <Photo src={PHOTOS[ev.cover]} label={ev.name} ratio="1 / 1" radius={14} className="dash-thumb" focus="center 36%" />
        <div className="dash-info">
          <h3>{ev.name}</h3>
          <span className="dash-sub"><Icon name="calendar" size={14} />{fmtDates(ev.start, ev.end)}</span>
          <div className="dash-stats">
            <Tag tone="neutral" icon="user">{`${bs.length} réservation${bs.length > 1 ? 's' : ''}`}</Tag>
            {ev.archived
              ? <Tag tone="done" icon="check">Clôturé</Tag>
              : <React.Fragment>
                  {todo > 0 && <Tag tone="work">{`${todo} à traiter`}</Tag>}
                  {sent > 0 && <Tag tone="done" icon="check">{`${sent} envoyée${sent > 1 ? 's' : ''}`}</Tag>}
                </React.Fragment>}
          </div>
        </div>
        <Icon name="chev" size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
      </button>
    );
  };

  return (
    <Screen bleed>
      <div className="admin-hero">
        <Photo src={PHOTOS.mel} label="" ratio="auto" radius={0} className="admin-hero-bg" focus="center 24%" />
        <div className="admin-hero-grad" />
        <button className="iconbtn admin-logout" title="Se déconnecter" onClick={() => { setAuth(false); navigate('home'); }}>
          <Icon name="logout" size={19} />
        </button>
        <div className="admin-hero-in">
          <span className="eyebrow eyebrow-light">Espace photographe</span>
          <h1 className="admin-hero-h1">Bonjour Mel 👋</h1>
          <p className="admin-hero-sub">{`${active.length} concours en ligne · ${totalTodo} photo${totalTodo > 1 ? 's' : ''} à traiter`}</p>
        </div>
      </div>

      <div className="dash-body">
        <Btn block size="lg" icon="plus" onClick={() => navigate('admin-new')}>Créer un concours</Btn>
        <div className="dash-actions">
          <Btn block size="lg" variant="soft" icon="sparkle" onClick={() => navigate('admin-pricing')}>Mes tarifs</Btn>
          <Btn block size="lg" variant="soft" icon="grid" onClick={() => navigate('admin-gallery')}>Mes photos</Btn>
        </div>
        <Btn block size="lg" variant="ghost" onClick={() => navigate('admin-guide')}>📖 Mode d’emploi</Btn>
        <p className="dash-hint"><Icon name="sparkle" size={14} /> Publie le concours où tu seras, il apparaît aussitôt sur ton site, prêt à recevoir des réservations.</p>

        <div className="dash-sectitle"><span>Ma présentation</span><i></i></div>
        <div className="pedit-card">
          <Field label="Concours couverts" value={concoursCount ?? '120+'} onChange={setConcoursCount}
                 placeholder="120+" icon="camera" hint="Le chiffre affiché dans « à propos » sur ta page d’accueil." />
        </div>

        <div className="dash-sectitle"><span>En ligne</span><i></i></div>
        <div className="dash-list">
          {active.length === 0
            ? <p className="empty-note">Aucun concours en ligne pour le moment.</p>
            : active.map(eventCard)}
        </div>

        {archived.length > 0 && (
          <React.Fragment>
            <div className="dash-sectitle"><span>Clôturés</span><i></i></div>
            <div className="dash-list">{archived.map(eventCard)}</div>
          </React.Fragment>
        )}

        <div className="dash-sectitle"><span>Sécurité</span><i></i></div>
        <ChangePassword />

        <button className="foot-admin" style={{ margin: '8px auto 0' }} onClick={resetDemo}>Réinitialiser la démo</button>
      </div>
    </Screen>
  );
}

// ── Mode d'emploi (guide privé, derrière la connexion) ────────
function AdminGuide() {
  const { navigate } = useApp();
  const txt = { margin: 0, color: 'var(--ink)', fontSize: 14.5, lineHeight: 1.65 };
  const muted = { margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 };
  const isLink = /^https?:\/\//i.test(GUIDE_SITE_URL);
  return (
    <Screen title="Mode d’emploi" onBack={() => navigate('admin-dash')}>
      <div className="pedit-intro">
        <span className="eyebrow">Rien que pour toi</span>
        <h2 className="recap-name">Mode d’emploi de ton site 📸</h2>
        <p className="pedit-lead">Bienvenue ! Voici comment ton site fonctionne, en deux minutes.</p>
      </div>

      <div className="dash-sectitle"><span>1 · Comment tu reçois tes réservations</span><i></i></div>
      <div className="pedit-card">
        <p style={txt}>Quand quelqu’un remplit le formulaire de réservation, tu reçois automatiquement un email sur <a href="mailto:melaniedubois@live.fr">melaniedubois@live.fr</a> avec toutes les infos de la demande (nom, cheval, concours, contact…). Ta boîte mail centralise tout : tu ne rates aucune demande. De son côté, la personne voit un message «&nbsp;C’est réservé&nbsp;!&nbsp;» qui confirme l’envoi.</p>
      </div>

      <div className="dash-sectitle"><span>2 · Ton espace photographe</span><i></i></div>
      <div className="pedit-card">
        <p style={txt}>C’est ici même, l’espace privé de ton site (accessible tout en bas de la page d’accueil).</p>
        <ul style={{ margin: '2px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li style={txt}>Mot de passe : <strong>bouboule</strong></li>
          <li style={txt}>Tu peux le changer quand tu veux, dans la section «&nbsp;Sécurité&nbsp;».</li>
        </ul>
        <p style={muted}>Astuce : ce mot de passe est mémorisé sur l’appareil que tu utilises ; sur un autre ordinateur ou téléphone, il te sera redemandé.</p>
      </div>

      <div className="dash-sectitle"><span>3 · Modifier tes infos (photos, présentation, tarifs, numéro…)</span><i></i></div>
      <div className="pedit-card">
        <p style={txt}>Pour modifier une info (photo, présentation, tarifs, numéro), contacte la personne qui gère ton site — c’est fait rapidement.</p>
      </div>

      <div className="dash-sectitle"><span>4 · L’adresse de ton site</span><i></i></div>
      <div className="pedit-card">
        <p style={txt}>Ton site est en ligne ici : {isLink
          ? <a href={GUIDE_SITE_URL} target="_blank" rel="noopener noreferrer">{GUIDE_SITE_URL}</a>
          : <strong>{GUIDE_SITE_URL}</strong>}</p>
        <p style={txt}>Si tu veux une adresse à ton nom (par ex. melaniedubois.photo), dis-le moi, je m’en charge.</p>
      </div>

      <div className="pedit-card" style={{ marginTop: 4 }}>
        <p style={txt}>Une question ? Le contact de ton site :</p>
        <p style={txt}><a href={'mailto:' + GUIDE_CONTACT}>{GUIDE_CONTACT}</a></p>
      </div>
    </Screen>
  );
}

// ── Contrôle de statut segmenté ───────────────────────────────
function StatusToggle({ value, onChange }) {
  return (
    <div className="seg" role="group">
      {ADMIN_STATUS.map(s => (
        <button key={s.key}
          className={'seg-btn' + (value === s.key ? ' seg-on seg-' + s.tone : '')}
          onClick={() => onChange(s.key)}>
          {value === s.key && <Icon name={s.key === 'sent' ? 'check' : s.key === 'working' ? 'camera' : 'user'} size={14} />}
          {s.short}
        </button>
      ))}
    </div>
  );
}

// ── Ligne de réservation (admin) ──────────────────────────────
function BookingRow({ b }) {
  const { setBookingStatus, setBookingWetransfer } = useApp();
  const isContactPhone = /\d/.test(b.contact) && !b.contact.includes('@');
  return (
    <div className={'brow brow-' + b.status}>
      <div className="brow-head">
        <div className="brow-id">
          <div className="brow-avatar">{b.firstName[0]}{b.lastName[0]}</div>
          <div>
            <div className="brow-name">{b.firstName} {b.lastName}</div>
            <div className="brow-horse"><Icon name="horse" size={14} />{b.horse}</div>
          </div>
        </div>
      </div>
      <div className="brow-meta">
        {b.slot && <span><Icon name="clock" size={14} />{b.slot}</span>}
        {b.email && <a href={'mailto:' + b.email}><Icon name="mail" size={14} />{b.email}</a>}
        {b.contact && <span><Icon name={isContactPhone ? 'phone' : 'instagram'} size={14} />{b.contact}</span>}
      </div>
      <StatusToggle value={b.status} onChange={(s) => setBookingStatus(b.id, s)} />
      {b.status === 'sent' && (
        <label className="brow-wt">
          <Icon name="link" size={16} />
          <input className="brow-wt-input mono" placeholder="Colle le lien WeTransfer…"
            value={b.wetransfer} onChange={(e) => setBookingWetransfer(b.id, e.target.value)} />
          {b.wetransfer ? <span className="brow-wt-ok"><Icon name="check" size={15} /></span> : null}
        </label>
      )}
    </div>
  );
}

// ── Page d'un concours (admin) ────────────────────────────────
function AdminEvent() {
  const { route, getEvent, bookingsFor, bulkStatus, closeEvent, reopenEvent, deleteEvent, navigate } = useApp();
  const ev = getEvent(route.eventId);
  const [confirmDel, setConfirmDel] = useState(false);
  if (!ev) return <Empty onHome={() => navigate('admin-dash')} />;
  const bs = bookingsFor(ev.id);
  const todo = bs.filter(b => b.status === 'confirmed').length;
  const allSent = bs.length > 0 && bs.every(b => b.status === 'sent');

  const doDelete = () => { deleteEvent(ev.id); navigate('admin-dash'); };

  return (
    <Screen title="Concours" onBack={() => navigate('admin-dash')}>
      <div className="recap recap-admin">
        {ev.archived && <span className="recap-archived"><Icon name="check" size={13} stroke={2.6} /> Concours clôturé</span>}
        <h2 className="recap-name">{ev.name}</h2>
        <div className="recap-meta">
          <span><Icon name="pin" size={15} />{ev.place}</span>
          <span><Icon name="calendar" size={15} />{fmtDates(ev.start, ev.end)}</span>
        </div>
        <div className="recap-count"><Icon name="user" size={15} /><span>{`${bs.length} réservation${bs.length > 1 ? 's' : ''}`}</span></div>
      </div>

      {!ev.archived && bs.length > 1 && (
        <button className="bulk" disabled={todo === 0} onClick={() => bulkStatus(ev.id, 'working')}>
          <Icon name="camera" size={16} />
          Tout marquer «&nbsp;je m’en occupe&nbsp;»
          {todo > 0 && <span className="bulk-badge">{todo}</span>}
        </button>
      )}

      <div className="brow-list">
        {bs.length === 0
          ? <p className="empty-note">Pas encore de réservation pour ce concours.</p>
          : bs.map(b => <BookingRow key={b.id} b={b} />)}
      </div>

      {/* Gestion du concours */}
      <div className="evt-manage">
        <div className="evt-manage-title"><Icon name="lock" size={14} /> Gérer ce concours</div>
        {ev.archived ? (
          <p className="evt-manage-note">Ce concours est clôturé : il n’apparaît plus sur ton site et ne reçoit plus de réservations.</p>
        ) : (
          <p className="evt-manage-note">
            {allSent
              ? 'Toutes les photos sont envoyées 🎉 Tu peux clôturer ce concours.'
              : 'Une fois toutes les photos envoyées, clôture-le pour le retirer de ton site.'}
          </p>
        )}
        <div className="evt-manage-actions">
          {ev.archived ? (
            <Btn variant="soft" icon="arrow" onClick={() => reopenEvent(ev.id)}>Rouvrir le concours</Btn>
          ) : (
            <Btn variant={allSent ? 'primary' : 'soft'} icon="check" onClick={() => { closeEvent(ev.id); }}>Clôturer le concours</Btn>
          )}
          {confirmDel ? (
            <div className="del-confirm">
              <span>Supprimer définitivement&nbsp;? Les {bs.length} réservation{bs.length > 1 ? 's' : ''} seront perdues.</span>
              <div className="del-confirm-row">
                <button className="del-yes" onClick={doDelete}>Oui, supprimer</button>
                <button className="del-no" onClick={() => setConfirmDel(false)}>Annuler</button>
              </div>
            </div>
          ) : (
            <button className="btn-danger" onClick={() => setConfirmDel(true)}>
              <Icon name="logout" size={16} /> Supprimer le concours
            </button>
          )}
        </div>
      </div>
    </Screen>
  );
}

// ── Éditeur de tarifs (admin) ─────────────────────────────────
function AdminPricing() {
  const { pricing, updatePricing, resetPricing, navigate } = useApp();
  const [saved, setSaved] = useState(false);

  const setItem = (cat, id, key, val) => {
    updatePricing(p => ({
      ...p,
      [cat]: p[cat].map(it => it.id === id ? { ...it, [key]: val } : it),
    }));
    setSaved(false);
  };
  const setFeats = (cat, id, text) => {
    const feats = text.split('\n').map(s => s.trim()).filter(Boolean);
    setItem(cat, id, 'feats', feats);
  };
  const setNote = (key, val) => { updatePricing(p => ({ ...p, [key]: val })); setSaved(false); };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const itemEditor = (cat) => (it) => (
    <div className="pedit-card" key={it.id}>
      <div className="pedit-row2">
        <Field label="Nom de la formule" value={it.name} onChange={(v) => setItem(cat, it.id, 'name', v)} />
        <Field label="Prix (€)" value={it.price} onChange={(v) => setItem(cat, it.id, 'price', v.replace(/[^0-9]/g, ''))} type="text" icon="sparkle" />
      </div>
      {cat === 'shooting' && (
        <Field label="Durée / détail" value={it.meta || ''} onChange={(v) => setItem(cat, it.id, 'meta', v)} placeholder="30 min de shooting" icon="clock" />
      )}
      <Field label="Accroche" value={it.lead} onChange={(v) => setItem(cat, it.id, 'lead', v)} />
      <Field label="Badge (vide = aucun)" value={it.tag || ''} onChange={(v) => setItem(cat, it.id, 'tag', v)} placeholder="Le plus choisi" hint="Met une formule en avant" />
      <label className="field">
        <span className="field-label">Ce qui est inclus <i className="req">·</i> une ligne par élément</span>
        <textarea className="input pedit-textarea" rows={Math.max(3, (it.feats || []).length)}
          value={(it.feats || []).join('\n')} onChange={(e) => setFeats(cat, it.id, e.target.value)} />
      </label>
    </div>
  );

  return (
    <Screen title="Mes tarifs" onBack={() => navigate('admin-dash')}>
      <div className="pedit-intro">
        <span className="eyebrow">Modifier mes prestations</span>
        <h2 className="recap-name">Tes tarifs, à jour en un instant</h2>
        <p className="pedit-lead">Tes changements s’appliquent aussitôt sur la page Tarifs de ton site. Aucune sauvegarde à faire.</p>
      </div>

      <div className="dash-sectitle"><span>01 · Sur les concours</span><i></i></div>
      {(pricing?.concours || []).map(itemEditor('concours'))}
      <Field label="Note sous les tarifs concours" value={pricing?.concoursNote || ''} onChange={(v) => setNote('concoursNote', v)} />

      <div className="dash-sectitle" style={{ marginTop: 22 }}><span>02 · En séance privée</span><i></i></div>
      {(pricing?.shooting || []).map(itemEditor('shooting'))}
      <Field label="Note sous les tarifs shooting" value={pricing?.shootingNote || ''} onChange={(v) => setNote('shootingNote', v)} />

      <div className="pedit-foot">
        <Btn block size="lg" icon={saved ? 'check' : 'sparkle'} onClick={() => { flash(); navigate('pricing'); }}>
          Voir le résultat sur mon site
        </Btn>
        {saved && <span className="pedit-saved"><Icon name="check" size={14} /> Enregistré</span>}
        <button className="foot-admin" style={{ margin: '6px auto 0' }} onClick={resetPricing}>Réinitialiser les tarifs par défaut</button>
      </div>
    </Screen>
  );
}

// ── Éditeur de réalisations (admin) ───────────────────────────
async function processUpload(file) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result); r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = dataUrl;
  });
  const max = 1400;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  const src = c.toDataURL('image/jpeg', 0.82);
  return { src, wide: img.width >= img.height };
}

function AdminGallery() {
  const { gallery, addGalleryItem, removeGalleryItem, moveGalleryItem, resetGallery,
          hero, addHeroItem, removeHeroItem, moveHeroItem, resetHero, navigate } = useApp();
  const items = gallery || [];
  const heroItems = hero || [];
  const [busy, setBusy] = useState(false);
  const [busyHero, setBusyHero] = useState(false);
  const fileRef = useRef(null);
  const heroFileRef = useRef(null);
  const usedKeys = items.filter(i => i.key).map(i => i.key);
  const pool = GALLERY_POOL.filter(k => !usedKeys.includes(k));
  const heroUsed = heroItems.filter(i => i.key).map(i => i.key);
  const heroPool = GALLERY_POOL.filter(k => !heroUsed.includes(k));

  const onFiles = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const { src, wide } = await processUpload(f);
        addGalleryItem({ src, wide });
      }
    } catch (e) {}
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onHeroFiles = async (files) => {
    if (!files || !files.length) return;
    setBusyHero(true);
    try {
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const { src } = await processUpload(f);
        addHeroItem({ src, focus: 'center 42%' });
      }
    } catch (e) {}
    setBusyHero(false);
    if (heroFileRef.current) heroFileRef.current.value = '';
  };

  return (
    <Screen title="Mes photos" onBack={() => navigate('admin-dash')}>
      <div className="pedit-intro">
        <span className="eyebrow">Carrousel &amp; portfolio</span>
        <h2 className="recap-name">Les photos de mon site</h2>
        <p className="pedit-lead">Gère les images qui défilent en haut de ta page d’accueil et celles de ton portfolio. Tout se met à jour aussitôt.</p>
      </div>

      {/* ── CARROUSEL D'ACCUEIL ── */}
      <div className="dash-sectitle"><span>Carrousel d’accueil</span><i></i></div>
      <p className="pedit-sub"><Icon name="image" size={14} /> Les grandes photos qui défilent derrière ton titre. Idéalement des paysages.</p>
      <input ref={heroFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={(e) => onHeroFiles([...e.target.files])} />
      <button className="gal-upload sm" onClick={() => heroFileRef.current && heroFileRef.current.click()} disabled={busyHero}>
        <Icon name={busyHero ? 'sparkle' : 'image'} size={20} />
        <b>{busyHero ? 'Import en cours…' : 'Importer une photo pour le carrousel'}</b>
      </button>
      <div className="gal-edit-list">
        {heroItems.map((it, i) => {
          const src = it.key ? PHOTOS[it.key] : it.src;
          return (
            <div className="gal-row" key={it.id}>
              <Photo src={src} label="" ratio="16 / 10" radius={11} className="gal-row-thumb wide-thumb" focus={it.focus || 'center 42%'} />
              <div className="gal-row-main">
                <span className="gal-row-pos mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="gal-row-fmt">{it.key ? 'Photo du site' : 'Importée'}</span>
              </div>
              <div className="gal-row-actions">
                <button className="gal-ord" disabled={i === 0} onClick={() => moveHeroItem(it.id, -1)} title="Monter"><Icon name="up" size={17} /></button>
                <button className="gal-ord" disabled={i === heroItems.length - 1} onClick={() => moveHeroItem(it.id, 1)} title="Descendre"><Icon name="down" size={17} /></button>
                <button className="gal-del" disabled={heroItems.length <= 1} onClick={() => removeHeroItem(it.id)} title={heroItems.length <= 1 ? 'Garde au moins une photo' : 'Retirer'}><Icon name="trash" size={17} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {heroPool.length > 0 && (
        <React.Fragment>
          <p className="pedit-sub" style={{ marginTop: 14 }}>Ajouter depuis ma banque&nbsp;:</p>
          <div className="gal-pool">
            {heroPool.map(k => (
              <button className="gal-pool-item" key={k} onClick={() => addHeroItem({ key: k, focus: LANDSCAPE.includes(k) ? 'center 42%' : 'center 30%' })}>
                <Photo src={PHOTOS[k]} label="" ratio="1 / 1" radius={12} focus="center 40%" />
                <span className="gal-pool-add"><Icon name="plus" size={16} stroke={2.4} /></span>
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
      <button className="foot-admin" style={{ margin: '12px auto 4px' }} onClick={resetHero}>Réinitialiser le carrousel</button>

      {/* ── PORTFOLIO ── */}
      <div className="dash-sectitle" style={{ marginTop: 24 }}><span>Mes réalisations</span><i></i></div>
      <p className="pedit-sub"><Icon name="grid" size={14} /> La mosaïque de ton portfolio. {items.length} photo{items.length > 1 ? 's' : ''} en ligne.</p>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={(e) => onFiles([...e.target.files])} />
      <button className="gal-upload sm" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>
        <Icon name={busy ? 'sparkle' : 'image'} size={20} />
        <b>{busy ? 'Import en cours…' : 'Importer mes photos'}</b>
      </button>
      <div className="gal-edit-list">
        {items.length === 0 && <p className="empty-note">Ta galerie est vide. Ajoute des photos ci-dessous.</p>}
        {items.map((it, i) => {
          const src = it.key ? PHOTOS[it.key] : it.src;
          return (
            <div className="gal-row" key={it.id}>
              <Photo src={src} label="" ratio="1 / 1" radius={11} className="gal-row-thumb" focus="center 40%" />
              <div className="gal-row-main">
                <span className="gal-row-pos mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="gal-row-fmt">{it.wide ? 'Paysage' : 'Portrait'}{it.key ? '' : ' · importée'}</span>
              </div>
              <div className="gal-row-actions">
                <button className="gal-ord" disabled={i === 0} onClick={() => moveGalleryItem(it.id, -1)} title="Monter"><Icon name="up" size={17} /></button>
                <button className="gal-ord" disabled={i === items.length - 1} onClick={() => moveGalleryItem(it.id, 1)} title="Descendre"><Icon name="down" size={17} /></button>
                <button className="gal-del" onClick={() => removeGalleryItem(it.id)} title="Retirer"><Icon name="trash" size={17} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {pool.length > 0 && (
        <React.Fragment>
          <p className="pedit-sub" style={{ marginTop: 14 }}>Ajouter depuis ma banque&nbsp;:</p>
          <div className="gal-pool">
            {pool.map(k => (
              <button className="gal-pool-item" key={k} onClick={() => addGalleryItem({ key: k, wide: LANDSCAPE.includes(k) })}>
                <Photo src={PHOTOS[k]} label="" ratio="1 / 1" radius={12} focus="center 40%" />
                <span className="gal-pool-add"><Icon name="plus" size={16} stroke={2.4} /></span>
              </button>
            ))}
          </div>
        </React.Fragment>
      )}

      <div className="pedit-foot">
        <Btn block size="lg" icon="arrow" onClick={() => navigate('home')}>Voir le résultat sur mon site</Btn>
        <button className="foot-admin" style={{ margin: '6px auto 0' }} onClick={resetGallery}>Réinitialiser le portfolio par défaut</button>
      </div>
    </Screen>
  );
}

// ── Nouveau concours ──────────────────────────────────────────
function AdminNew() {
  const { addEvent, navigate } = useApp();
  const [f, setF] = useState({ name: '', place: '', start: '', end: '', cover: 'g7' });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(null); // id du concours publié
  const set = (k) => (v) => setF(s => ({ ...s, [k]: v }));

  const publish = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Donne un nom au concours.';
    if (!f.place.trim()) e.place = 'Et un lieu.';
    if (!f.start) e.start = 'Au moins une date de début.';
    setErr(e);
    if (Object.keys(e).length) return;
    const id = addEvent({ ...f, end: f.end || f.start });
    setDone(id);
  };

  if (done) {
    return (
      <Screen onBack={() => navigate('admin-dash')} bare>
        <div className="published">
          <div className="published-card">
            <Photo src={PHOTOS[f.cover]} label={f.name} ratio="16 / 9" radius={0} className="published-cover" focus="center 36%" />
            <div className="published-live"><i className="live-dot"></i>En ligne</div>
            <div className="published-body">
              <h3>{f.name}</h3>
              <span className="dash-sub"><Icon name="pin" size={14} />{f.place}</span>
              <span className="dash-sub"><Icon name="calendar" size={14} />{fmtDates(f.start, f.end || f.start)}</span>
            </div>
          </div>
          <div className="confirm-badge sm"><Icon name="check" size={26} stroke={2.6} /></div>
          <h1 className="published-title">C’est publié&nbsp;!</h1>
          <p className="published-lead">Ton concours est désormais visible sur ton site. Les cavaliers peuvent déjà réserver leur séance.</p>
          <Btn block size="lg" iconRight="arrow" onClick={() => navigate('admin-event', { eventId: done })}>Voir les réservations</Btn>
          <button className="link-btn" onClick={() => navigate('home')}>Aperçu côté client</button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Nouveau concours" onBack={() => navigate('admin-dash')}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); publish(); }}>
        <Field label="Nom du concours" value={f.name} onChange={set('name')} placeholder="CSO de Fontainebleau" required error={err.name} autoFocus />
        <Field label="Lieu" value={f.place} onChange={set('place')} placeholder="Grand Parquet, Fontainebleau" icon="pin" required error={err.place} />
        <div className="form-row2">
          <Field label="Début" value={f.start} onChange={set('start')} type="date" required error={err.start} />
          <Field label="Fin" value={f.end} onChange={set('end')} type="date" hint="Optionnel" />
        </div>

        <div className="form-div"><span>Photo de couverture</span></div>
        <div className="cover-pick">
          <div className="cover-preview-wrap">
            <Photo src={PHOTOS[f.cover]} label={f.name || 'couverture'} ratio="16 / 9" radius={16} className="cover-preview" focus="center 36%" />
            <span className="cover-preview-tag mono">aperçu</span>
          </div>
          <span className="cover-pick-label"><Icon name="camera" size={15} /> Choisis une photo, ou glisse la tienne&nbsp;:</span>
          <div className="cover-thumbs">
            {['g7', 'g1', 'g3', 'g8', 'g4', 'g5'].map(c => (
              <button key={c} type="button" className={'cover-thumb' + (f.cover === c ? ' on' : '')} onClick={() => set('cover')(c)}>
                <Photo src={PHOTOS[c]} label="" ratio="1 / 1" radius={11} focus="center 40%" />
                {f.cover === c && <span className="cover-thumb-check"><Icon name="check" size={13} stroke={3} /></span>}
              </button>
            ))}
            <button type="button" className="cover-thumb upload" onClick={() => {}}>
              <Icon name="plus" size={20} />
              <span>Importer</span>
            </button>
          </div>
        </div>

        <Btn block size="lg" type="submit" icon="check">Publier le concours</Btn>
        <p className="form-note"><Icon name="sparkle" size={14} /> Il apparaîtra aussitôt sur ta page d’accueil, prêt à recevoir des réservations.</p>
      </form>
    </Screen>
  );
}

Object.assign(window, { AdminLogin, AdminDash, AdminEvent, AdminNew, AdminPricing, AdminGallery, AdminGuide, StatusToggle, BookingRow, ADMIN_STATUS });
