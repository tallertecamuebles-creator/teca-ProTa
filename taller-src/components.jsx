/* TECA · Sistema del taller — átomos compartidos.
   Exports a window: Button, Field, Select, Icon, Tick, Eyebrow,
   Badge, ProgressBar, StageDots, Confirm. */

const { useState: useStateC, useEffect: useEffectC } = React;

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */
function Button({ children, variant = "primary", onClick, type = "button", size = "md", disabled, style = {}, ...rest }) {
  const sizes = {
    sm: { padding: "8px 14px", fontSize: 11 },
    md: { padding: "13px 24px", fontSize: 12 },
  };
  const base = {
    fontFamily: "var(--font-sans)",
    fontWeight: 400,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    borderRadius: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid var(--c-ink)",
    opacity: disabled ? 0.4 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    whiteSpace: "nowrap",
    transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
    ...sizes[size],
  };
  const variants = {
    primary:   { background: "var(--c-ink)", color: "var(--c-almond)" },
    secondary: { background: "transparent", color: "var(--c-ink)" },
    accent:    { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--c-almond)" },
    ghost:     { background: "transparent", borderColor: "var(--border-hair)", color: "var(--c-ink)" },
  };
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.985)"; }}
      onMouseUp={(e)   => { if (!disabled) e.currentTarget.style.transform = "scale(1)"; }}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Field — underline text / textarea                                  */
/* ------------------------------------------------------------------ */
function Field({ label, type = "text", textarea, value, onChange, placeholder, name, rows = 3 }) {
  const [focused, setFocused] = useStateC(false);
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    background: "transparent",
    border: 0,
    borderBottom: `1px solid ${focused ? "var(--accent)" : "var(--border-strong)"}`,
    borderRadius: 0,
    padding: "10px 0",
    fontFamily: "var(--font-display)",
    fontSize: 19,
    fontWeight: 400,
    color: "var(--c-ink)",
    outline: "none",
    transition: "border-color var(--dur-fast) var(--ease-out)",
    resize: "none",
  };
  return (
    <label style={{ display: "block" }}>
      <span style={fieldLabelStyle}>{label}</span>
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            rows={rows} style={{ ...inputStyle, minHeight: 60, lineHeight: 1.5 }} />
        : <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle} />}
    </label>
  );
}

const fieldLabelStyle = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--fg-3)",
  marginBottom: 4,
};

/* ------------------------------------------------------------------ */
/*  Select — same underline language                                   */
/* ------------------------------------------------------------------ */
function Select({ label, value, onChange, options, name }) {
  const [focused, setFocused] = useStateC(false);
  return (
    <label style={{ display: "block" }}>
      <span style={fieldLabelStyle}>{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "transparent",
          border: 0,
          borderBottom: `1px solid ${focused ? "var(--accent)" : "var(--border-strong)"}`,
          borderRadius: 0,
          padding: "10px 0",
          fontFamily: "var(--font-display)",
          fontSize: 19,
          fontWeight: 400,
          fontVariantNumeric: "lining-nums",
          fontFeatureSettings: "'lnum' 1, 'tnum' 0",
          color: "var(--c-ink)",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%232E2218' stroke-width='1.25'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 2px center",
        }}
      >
        {options.map((o) => {
          const val = typeof o === "string" ? o : o.value;
          const lab = typeof o === "string" ? o : o.label;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon — Lucide-style hairline set, stroke 1.25                      */
/* ------------------------------------------------------------------ */
function Icon({ name, size = 20, stroke = 1.5, style = {} }) {
  const paths = {
    plus:     <path d="M12 5v14M5 12h14"/>,
    x:        <path d="M18 6L6 18M6 6l12 12"/>,
    check:    <path d="M20 6L9 17l-5-5"/>,
    arrowR:   <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrowL:   <><path d="M19 12H5M11 5l-7 7 7 7"/></>,
    chevR:    <path d="M9 6l6 6-6 6"/>,
    chevDown: <path d="M6 9l6 6 6-6"/>,
    chevL:    <path d="M15 6l-6 6 6 6"/>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:    <><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></>,
    pin:      <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    ruler:    <><path d="M21.3 8.7L8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="1"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    money:    <><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6.5C17 4.6 14.8 4 12 4S7 4.6 7 6.5 9.2 9 12 9.5s5 1.1 5 3-2.2 2.5-5 2.5-5-.6-5-2.5"/></>,
    box:      <><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></>,
    layers:   <><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></>,
    list:     <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    grid:     <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    columns:  <><rect x="3" y="4" width="5" height="16"/><rect x="10" y="4" width="5" height="16"/><rect x="17" y="4" width="4" height="16"/></>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    cart:     <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></>,
    camera:   <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    image:    <><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>,
    truck:    <><rect x="1" y="6" width="14" height="11"/><path d="M15 9h4l3 3v5h-7zM5.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></>,
    tool:     <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18l3 3 6.4-6.3a4 4 0 0 0 5.3-5.4l-2.3 2.3-2.6-.7-.7-2.6z"/></>,
    layers2:  <><path d="M4 4h16v6H4zM4 14h16v6H4z"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
    warn:     <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      {paths[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tick / Eyebrow                                                     */
/* ------------------------------------------------------------------ */
function Tick({ height = 28, style = {} }) {
  return <span aria-hidden="true" style={{
    display: "block", width: 1, height,
    background: "var(--c-ink)", opacity: 0.85, margin: "0 auto", ...style,
  }} />;
}

function Eyebrow({ children, style = {} }) {
  return <div style={{
    fontFamily: "var(--font-sans)", fontStyle: "italic", fontWeight: 300,
    fontSize: 14, letterSpacing: "0.04em", color: "var(--c-ink)", ...style,
  }}>— {children} —</div>;
}

/* ------------------------------------------------------------------ */
/*  Badge — línea tag / estado                                         */
/* ------------------------------------------------------------------ */
function Badge({ children, tone = "ink", style = {} }) {
  const tones = {
    ink:    { background: "transparent", color: "var(--fg-2)", borderColor: "var(--border-hair)" },
    earth:  { background: "transparent", color: "var(--c-earth-deep)", borderColor: "var(--c-earth)" },
    moss:   { background: "transparent", color: "var(--c-moss)", borderColor: "var(--c-moss)" },
    solid:  { background: "var(--c-ink)", color: "var(--c-almond)", borderColor: "var(--c-ink)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "var(--font-sans)", fontSize: 10.5, fontWeight: 400,
      letterSpacing: "0.12em", textTransform: "uppercase",
      padding: "3px 9px", border: "1px solid", borderRadius: 0,
      ...tones[tone], ...style,
    }}>{children}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  ProgressBar — thin, square                                         */
/* ------------------------------------------------------------------ */
function ProgressBar({ value = 0, height = 4, style = {} }) {
  return (
    <div style={{ background: "var(--border-hair)", height, width: "100%", ...style }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        height: "100%",
        background: value >= 100 ? "var(--c-moss)" : "var(--accent)",
        transition: "width var(--dur-base) var(--ease-out)",
      }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StageDots — 5 marcas de etapa horizontales                         */
/* ------------------------------------------------------------------ */
function StageDots({ stageIndex, style = {} }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", ...style }}>
      {STAGES.map((s, i) => (
        <span key={s.id} title={s.label} style={{
          height: 3, flex: 1,
          background: i <= stageIndex ? "var(--accent)" : "var(--border-hair)",
          transition: "background var(--dur-base) var(--ease-out)",
        }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle — segmented control (Sí/No, opciones cortas)                */
/* ------------------------------------------------------------------ */
function Toggle({ value, onChange, options = ["Sí", "No"] }) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid var(--border-hair)" }}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} style={{
          background: value === o ? "var(--c-ink)" : "transparent",
          color: value === o ? "var(--c-almond)" : "var(--fg-2)",
          border: 0, borderRadius: 0, cursor: "pointer",
          fontFamily: "var(--font-sans)", fontSize: 13, padding: "9px 18px", whiteSpace: "nowrap",
          transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
        }}>{o}</button>
      ))}
    </div>
  );
}

/* LabeledToggle — Toggle con etiqueta arriba, para formularios */
function LabeledToggle({ label, value, onChange, options }) {
  return (
    <div>
      <span style={fieldLabelStyle}>{label}</span>
      <div style={{ paddingTop: 2 }}><Toggle value={value} onChange={onChange} options={options} /></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PhotoUpload — adjuntar imágenes (escaladas, guardadas como dataURL) */
/* ------------------------------------------------------------------ */
function PhotoUpload({ photos = [], onChange, multiple = true, size = 84, ctaLabel = "Foto" }) {
  const inputRef = React.useRef(null);
  const [busy, setBusy] = useStateC(false);
  const [zoom, setZoom] = useStateC(null);
  useEffectC(() => {
    if (!zoom) return;
    const onKey = (e) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);
  const handle = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    setBusy(true);
    const urls = [];
    for (const f of files) { try { urls.push(await fileToDataURL(f)); } catch (_) {} }
    onChange([...photos, ...urls]);
    setBusy(false);
    e.target.value = "";
  };
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {photos.map((src, i) => (
        <div key={i} style={{ position: "relative", width: size, height: size }}>
          <img src={src} alt="" onClick={() => setZoom(src)} title="Ampliar"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", border: "1px solid var(--border-hair)", cursor: "zoom-in" }} />
          <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))}
            style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: 0, background: "var(--c-ink)", color: "var(--c-almond)", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            aria-label="Quitar foto"><Icon name="x" size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={() => inputRef.current && inputRef.current.click()}
        style={{ width: size, height: size, border: "1px dashed var(--border-strong)", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--fg-2)" }}>
        <Icon name={busy ? "clock" : "camera"} size={18} />
        <span style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{busy ? "…" : ctaLabel}</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} onChange={handle} style={{ display: "none" }} />
      {zoom && (
        <div onMouseDown={() => setZoom(null)} style={{
          position: "fixed", inset: 0, zIndex: 300, background: "rgba(46,34,24,0.82)",
          backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
          cursor: "zoom-out", animation: "tecaFade var(--dur-base) var(--ease-out)",
        }}>
          <img src={zoom} alt="" style={{ maxWidth: "92vw", maxHeight: "90vh", objectFit: "contain", boxShadow: "var(--shadow-overlay)", border: "1px solid rgba(234,222,208,0.25)" }} />
          <button type="button" onClick={() => setZoom(null)} aria-label="Cerrar"
            style={{ position: "fixed", top: 20, right: 24, width: 40, height: 40, borderRadius: 0, background: "transparent", border: "1px solid rgba(234,222,208,0.5)", color: "var(--c-almond)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ConfirmDialog — cartel de advertencia antes de una acción          */
/* ------------------------------------------------------------------ */
function ConfirmDialog({ title = "¿Estás seguro?", message, confirmLabel = "Eliminar", cancelLabel = "Cancelar", onConfirm, onCancel, icon = "trash", confirmIcon, single = false, filled = false }) {
  useEffectC(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div style={{ ...overlayStyle, alignItems: "center", zIndex: 200 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={confirmModalStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42,
            border: filled ? "none" : "1px solid var(--c-earth)",
            background: filled ? "var(--c-earth-deep)" : "transparent",
            color: filled ? "var(--c-almond)" : "var(--c-earth-deep)", flexShrink: 0 }}>
            <Icon name={icon} size={20} stroke={filled ? 2 : 1.5} />
          </span>
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 26, color: "var(--c-ink)" }}>{title}</h3>
        </div>
        {message && <p style={{ margin: "0 0 28px", color: "var(--fg-2)", fontSize: 15, lineHeight: 1.6 }}>{message}</p>}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          {!single && <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>}
          <Button variant="accent" onClick={onConfirm}>{confirmIcon && <Icon name={confirmIcon} size={14} />} {confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

const confirmModalStyle = {
  background: "var(--bg-2)", border: "1px solid var(--border-hair)",
  boxShadow: "var(--shadow-overlay)", width: "100%", maxWidth: 440,
  padding: "32px 36px 32px", borderRadius: 0,
  animation: "tecaFade var(--dur-base) var(--ease-out)",
};

Object.assign(window, {
  Button, Field, Select, Icon, Tick, Eyebrow, Badge, ProgressBar, StageDots, fieldLabelStyle,
  Toggle, LabeledToggle, PhotoUpload, ConfirmDialog,
});
