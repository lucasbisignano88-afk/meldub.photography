// ui.jsx — composants partagés + iconographie
// Exporte vers window: Icon, Btn, Field, TextArea, Photo, Logo, Tag, Stepper, CopyRow, useToast, Toast
const { useState, useEffect, useCallback, useRef } = React;

// ── Icônes (ligne, 1.6 stroke) ────────────────────────────────
function Icon({ name, size = 20, stroke = 1.7, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'back':     return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'arrow':    return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'down':     return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'check':    return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>;
    case 'plus':     return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'pin':      return <svg {...p}><path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'clock':    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'horse':    return <svg {...p}><path d="M5 21c0-4 2-6 4-7M4 9l2-1 1-3 3 2h4c3 0 5 2 5 6 0 3-2 5-2 8"/><path d="M9 21c0-3 1-4 3-5"/></svg>;
    case 'camera':   return <svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.2"/></svg>;
    case 'instagram':return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor"/></svg>;
    case 'copy':     return <svg {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></svg>;
    case 'link':     return <svg {...p}><path d="M10 13a4 4 0 005.66 0l2.34-2.34a4 4 0 00-5.66-5.66L11 6.34"/><path d="M14 11a4 4 0 00-5.66 0L6 13.34a4 4 0 005.66 5.66L13 17.66"/></svg>;
    case 'download': return <svg {...p}><path d="M12 4v11M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>;
    case 'mail':     return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>;
    case 'phone':    return <svg {...p}><path d="M5 4h4l1.5 5-2 1.5a12 12 0 005 5l1.5-2 5 1.5v4a1.5 1.5 0 01-1.6 1.5C11 25 3 17 3 6.6 3 5.7 3.7 4 5 4z"/></svg>;
    case 'lock':     return <svg {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/></svg>;
    case 'user':     return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5"/></svg>;
    case 'sparkle':  return <svg {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/></svg>;
    case 'logout':   return <svg {...p}><path d="M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'chev':     return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'up':       return <svg {...p}><path d="M6 15l6-6 6 6"/></svg>;
    case 'trash':    return <svg {...p}><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1.5 1.5 0 001.5 1.4h7A1.5 1.5 0 0017 20L18 7"/></svg>;
    case 'image':    return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
    case 'grid':     return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    default:         return null;
  }
}

// ── Bouton ────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', block, icon, iconRight, onClick, type, disabled, style }) {
  const cls = ['btn', `btn-${variant}`, `btn-${size}`, block ? 'btn-block' : ''].join(' ');
  return (
    <button className={cls} type={type || 'button'} onClick={onClick} disabled={disabled} style={style}>
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 18} />}
    </button>
  );
}

// ── Champ de formulaire ───────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', icon, hint, error, required, autoFocus }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <i className="req"> *</i>}</span>
      <div className={'field-wrap' + (error ? ' is-error' : '')}>
        {icon && <span className="field-icon"><Icon name={icon} size={18} /></span>}
        <input
          className="input" type={type} value={value} placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          style={icon ? { paddingLeft: 44 } : null}
        />
      </div>
      {error ? <span className="field-err">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

// ── Placeholder photo rayé OU vraie image ─────────────────────
function Photo({ label = 'photo', ratio = '4 / 3', radius = 18, className = '', style, dark, children, src, focus, kenburns, flow }) {
  const r = { aspectRatio: ratio === 'auto' ? 'auto' : ratio, borderRadius: radius, ...style };
  if (src) {
    return (
      <div className={'photo ' + (flow ? 'photo-flow ' : '') + className} style={r}>
        <img src={src} alt={label || ''} loading="lazy" draggable="false"
          className={'photo-img' + (kenburns ? ' kenburns' : '')} style={{ objectPosition: focus || 'center' }} />
        {children}
      </div>
    );
  }
  return (
    <div className={'photo-ph ' + className} style={r} data-dark={dark ? '1' : undefined}>
      <div className="photo-ph-chip">
        <Icon name="camera" size={15} />
        <span className="mono">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ── Reveal au scroll (IntersectionObserver) ───────────────────
function Reveal({ children, as = 'div', className = '', delay = 0, style, onClick }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest('[data-scroll-root]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } });
    }, { root: root || null, threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    const fb = setTimeout(() => setVis(true), 1400); // filet de sécurité
    return () => { io.disconnect(); clearTimeout(fb); };
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} onClick={onClick} className={'reveal ' + (vis ? 'in ' : '') + className} style={{ transitionDelay: (delay || 0) + 'ms', ...style }}>
      {children}
    </Tag>
  );
}

// ── Logo (signature texte, sans pastille) ─────────────────────
function Logo({ size = 'md', light }) {
  return (
    <span className={'logo logo-' + size + (light ? ' logo-light' : '')}>
      <span className="logo-word">Mélanie Dubois</span>
      <span className="logo-tag">Photography</span>
    </span>
  );
}

// ── Étiquette / pastille ──────────────────────────────────────
function Tag({ children, tone = 'neutral', icon }) {
  return <span className={'tag tag-' + tone}>{icon && <Icon name={icon} size={13} />}{children}</span>;
}

// ── Barre de progression du suivi (le cœur rassurant) ─────────
function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo';
        return (
          <div className={'step step-' + state} key={s.key}>
            <div className="step-rail">
              <span className="step-node">
                {state === 'done' ? <Icon name="check" size={16} stroke={2.4} /> : <i className="step-dot" />}
                {state === 'active' && <i className="step-pulse" />}
              </span>
              {i < STEPS.length - 1 && <span className="step-line" />}
            </div>
            <div className="step-body">
              <div className="step-label">{s.label}</div>
              <div className="step-sub">{state === 'done' ? 'Fait' : s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Ligne copiable (lien unique) ──────────────────────────────
function CopyRow({ value, display }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(value); } catch (e) {}
    setDone(true); setTimeout(() => setDone(false), 1600);
  };
  return (
    <button className="copyrow" onClick={copy}>
      <Icon name="link" size={16} />
      <span className="copyrow-val">{display || value}</span>
      <span className={'copyrow-btn' + (done ? ' done' : '')}>
        <Icon name={done ? 'check' : 'copy'} size={16} />
        {done ? 'Copié' : 'Copier'}
      </span>
    </button>
  );
}

// ── Toast léger ───────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(null), 2200); }, []);
  const node = msg ? <div className="toast">{<Icon name="check" size={16} />}{msg}</div> : null;
  return [node, show];
}

Object.assign(window, { Icon, Btn, Field, Photo, Reveal, Logo, Tag, Stepper, CopyRow, useToast });
