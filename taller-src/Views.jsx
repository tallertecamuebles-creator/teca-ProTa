/* Views — Tablero (kanban), Lista, Grilla. */

/* ---- pieza compartida: meta línea ---- */
function CardMeta({ p }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12.5, lineHeight: 1.3, color: "var(--fg-2)" }}>
      {p.cliente && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}><Icon name="user" size={12} /> {p.cliente}</span>}
      {p.fechaEntrega && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}><Icon name="calendar" size={12} /> {fmtDate(p.fechaEntrega)}</span>}
    </div>
  );
}

/* ============================ TABLERO (kanban) ============================ */
function BoardView({ projects, onOpen, onMove }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))`, gap: 16, alignItems: "start", overflowX: "auto", paddingBottom: 8 }}>
      {STAGES.map((s, i) => {
        const items = projects.filter((p) => p.stageIndex === i);
        return (
          <div key={s.id} style={{ minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "0 2px 12px", borderBottom: "1px solid var(--border-hair)", marginBottom: 14 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-2)" }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-ink)", flexShrink: 0 }}>{items.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((p) => (
                <article key={p.id} onClick={() => onOpen(p)} style={kanbanCardStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hair)"; }}>
                  <h4 style={{ margin: 0, fontSize: 19, fontWeight: 400, lineHeight: 1.15 }}>{p.nombre}</h4>
                  {p.tipoPieza && <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 3 }}>{p.tipoPieza}</div>}
                  <div style={{ marginTop: 12 }}><CardMeta p={p} /></div>
                  {i === 3 && (
                    <div style={{ marginTop: 12 }}>
                      <ProgressBar value={p.tallerProgreso} height={3} />
                      <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>{p.tallerProgreso}% en taller</div>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onMove(p, -1)} disabled={i === 0} style={moveBtnStyle(i === 0)} aria-label="Etapa anterior"><Icon name="chevL" size={15} /></button>
                    <button onClick={() => onMove(p, +1)} disabled={i === STAGES.length - 1} style={moveBtnStyle(i === STAGES.length - 1)} aria-label="Avanzar etapa"><Icon name="chevR" size={15} /></button>
                  </div>
                </article>
              ))}
              {items.length === 0 && <div style={emptyColStyle}>—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ LISTA ============================ */
const LIST_COLS = [
  { key: "nombre",  label: "Proyecto" },
  { key: "cliente", label: "Cliente" },
  { key: "etapa",   label: "Etapa" },
  { key: "entrega", label: "Entrega" },
  { key: "avance",  label: "Avance", right: true },
];
const LIST_CMP = {
  nombre:  (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  cliente: (a, b) => (a.cliente || "").localeCompare(b.cliente || "", "es"),
  etapa:   (a, b) => a.stageIndex - b.stageIndex,
  entrega: (a, b) => (a.fechaEntrega || "9999-99-99").localeCompare(b.fechaEntrega || "9999-99-99"),
  avance:  (a, b) => projectPercent(a) - projectPercent(b),
};

function ListView({ projects, onOpen }) {
  const [sortBy, setSortBy] = React.useState("etapa");
  const [dir, setDir] = React.useState("asc");
  const clickSort = (key) => {
    if (key === sortBy) setDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setDir("asc"); }
  };
  const sorted = [...projects].sort((a, b) => LIST_CMP[sortBy](a, b) * (dir === "asc" ? 1 : -1));

  return (
    <div style={{ border: "1px solid var(--border-hair)", background: "rgba(244,236,223,0.45)" }}>
      <div style={{ ...listRowStyle, color: "var(--fg-3)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: "1px solid var(--border-hair)", background: "rgba(234,222,208,0.6)" }}>
        {LIST_COLS.map((c) => {
          const active = sortBy === c.key;
          return (
            <button key={c.key} onClick={() => clickSort(c.key)} style={{
              ...sortHeadStyle,
              justifyContent: c.right ? "flex-end" : "flex-start",
              color: active ? "var(--c-ink)" : "var(--fg-3)",
            }}>
              <span>{c.label}</span>
              <Icon name="chevDown" size={13} style={{
                opacity: active ? 1 : 0.28,
                transform: active && dir === "asc" ? "rotate(180deg)" : "none",
                transition: "transform var(--dur-fast) var(--ease-out)",
              }} />
            </button>
          );
        })}
      </div>
      {sorted.map((p, idx) => {
        const pct = projectPercent(p);
        return (
          <div key={p.id} onClick={() => onOpen(p)} style={{
            ...listRowStyle,
            borderBottom: idx < sorted.length - 1 ? "1px solid var(--border-hair)" : "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, display: "block", lineHeight: 1.2 }}>{p.nombre}</span>
              <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{p.tipoPieza || "—"}</span>
            </span>
            <span style={listCell}>{p.cliente || "—"}</span>
            <span style={listCell}><Badge tone={p.stageIndex === STAGES.length - 1 ? "moss" : "ink"}>{STAGES[p.stageIndex].short}</Badge></span>
            <span style={listCell}>{fmtDate(p.fechaEntrega)}</span>
            <span style={{ ...listCell, justifySelf: "stretch" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ProgressBar value={pct} height={4} />
                <span style={{ fontSize: 13, width: 38, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
              </div>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ GRILLA ============================ */
function GridView({ projects, onOpen }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
      {projects.map((p) => {
        const pct = projectPercent(p);
        const ms = materialsSummary(p);
        return (
          <article key={p.id} onClick={() => onOpen(p)} style={gridCardStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hair)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <Badge tone="moss">{p.tipoPieza || "Proyecto"}</Badge>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1 }}>{pct}%</span>
            </div>
            <h4 style={{ margin: "16px 0 0", fontSize: 23, fontWeight: 400, lineHeight: 1.1 }}>{p.nombre}</h4>
            <div style={{ marginTop: 6, marginBottom: 16 }}><CardMeta p={p} /></div>
            <StageDots stageIndex={p.stageIndex} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "var(--fg-2)" }}>
              <span>{STAGES[p.stageIndex].label}</span>
              {ms.total > 0 && <span style={{ color: "var(--fg-3)" }}>{ms.faltan} a comprar</span>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

const kanbanCardStyle = {
  background: "var(--bg-2)", border: "1px solid var(--border-hair)", borderRadius: 0,
  padding: 16, cursor: "pointer",
  transition: "border-color var(--dur-fast) var(--ease-out)",
};
const gridCardStyle = {
  background: "var(--bg-2)", border: "1px solid var(--border-hair)", borderRadius: 0,
  padding: 24, cursor: "pointer",
  transition: "border-color var(--dur-fast) var(--ease-out)",
};
const emptyColStyle = { textAlign: "center", color: "var(--fg-3)", padding: "20px 0", fontSize: 14, border: "1px dashed var(--border-hair)" };
const moveBtnStyle = (disabled) => ({
  background: "transparent", border: "1px solid var(--border-hair)", borderRadius: 0,
  width: 30, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1, color: "var(--c-ink)", padding: 0,
});
const listRowStyle = {
  display: "grid", gridTemplateColumns: "2.4fr 1.3fr 1fr 1.2fr 1.4fr",
  gap: 20, alignItems: "center", padding: "14px 20px",
  transition: "background var(--dur-fast) var(--ease-out)",
};
const listCell = { fontSize: 14, color: "var(--fg-2)", display: "flex", alignItems: "center" };
const sortHeadStyle = {
  display: "flex", alignItems: "center", gap: 5,
  background: "transparent", border: 0, padding: 0, cursor: "pointer",
  font: "inherit", letterSpacing: "inherit", textTransform: "inherit",
};

Object.assign(window, { BoardView, ListView, GridView });
