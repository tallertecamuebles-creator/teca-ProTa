/* App — composición del sistema interno del taller. */
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const VIEW_OPTS = [
  { id: "grilla",  label: "Grilla",  icon: "grid" },
  { id: "tablero", label: "Tablero", icon: "columns" },
  { id: "lista",   label: "Lista",   icon: "list" },
];

function App() {
  const [projects, setProjects] = useStateA(() => loadProjects());
  const [view, setView] = useStateA("grilla");
  const [query, setQuery] = useStateA("");
  const [openId, setOpenId] = useStateA(null);
  const [formState, setFormState] = useStateA(null); // null | {mode, project}
  const [confirmDelete, setConfirmDelete] = useStateA(null); // null | project
  const [confirmAdvance, setConfirmAdvance] = useStateA(null); // null | project (bloqueo taller->entrega)

  useEffectA(() => { saveProjects(projects); }, [projects]);
  useEffectA(() => { localStorage.setItem("teca_taller_view", view); }, [view]);

  const filtered = useMemoA(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (!q) return true;
      return [p.nombre, p.cliente, p.tipoPieza, p.materialTipo, p.ubicacion]
        .some((f) => (f || "").toLowerCase().includes(q));
    });
  }, [projects, query]);


  const openProject = openId ? projects.find((p) => p.id === openId) : null;

  /* ---- acciones ---- */
  const upsert = (proj) => {
    setProjects((list) => {
      const i = list.findIndex((p) => p.id === proj.id);
      if (i === -1) return [proj, ...list];
      const copy = [...list]; copy[i] = proj; return copy;
    });
  };
  const handleSaveForm = (proj) => { upsert(proj); setFormState(null); };
  const handleDelete = (proj) => { setConfirmDelete(proj); };
  const confirmDeleteNow = () => {
    const proj = confirmDelete;
    if (!proj) return;
    setProjects((list) => list.filter((p) => p.id !== proj.id));
    setConfirmDelete(null);
    setOpenId(null);
  };
  const moveStage = (proj, dir) => {
    if (dir > 0 && proj.stageIndex === 3 && proj.tallerProgreso < 100) { setConfirmAdvance(proj); return; }
    const stageIndex = Math.max(0, Math.min(STAGES.length - 1, proj.stageIndex + dir));
    upsert({ ...proj, stageIndex, updatedAt: nowISO() });
  };

  /* ---- métricas para el encabezado ---- */
  const stats = useMemoA(() => {
    const activos = projects.filter((p) => p.stageIndex < STAGES.length - 1).length;
    const enTaller = projects.filter((p) => p.stageIndex === 3).length;
    const porComprar = projects.reduce((acc, p) => acc + materialsSummary(p).faltan, 0);
    return { total: projects.length, activos, enTaller, porComprar };
  }, [projects]);

  return (
    <div>
      {/* HEADER */}
      <header style={headerStyle}>
        <div style={wordmarkBlockStyle}>
          <span style={wordmarkStyle}>TECA</span>
          <span style={wordmarkSubStyle}>~ carpintería de diseño ~</span>
        </div>
        <Button variant="primary" onClick={() => setFormState({ project: emptyProject() })}
          style={{ background: "var(--c-sand)", borderColor: "var(--c-sand)", color: "var(--c-ink)" }}>
          <Icon name="plus" size={15} /> Nuevo proyecto
        </Button>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 32px 80px" }}>
        {/* título + stats */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: "clamp(52px, 11vw, 88px)", margin: "0", letterSpacing: "0.01em" }}>ProTa</h1>
          <p style={{ margin: "0", color: "var(--fg-2)", fontStyle: "italic", fontFamily: "var(--font-display)", fontSize: 19 }}>Proyectos del taller</p>
        </div>

        {/* toolbar */}
        <div style={toolbarStyle}>
          <div style={searchBarStyle}>
            <Icon name="search" size={16} style={{ color: "var(--fg-2)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar proyecto, cliente, material…"
              style={{ flex: 1, border: 0, background: "transparent", outline: "none", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--c-ink)" }} />
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* view toggle */}
            <div style={segStyle}>
              {VIEW_OPTS.map((v) => (
                <button key={v.id} onClick={() => setView(v.id)} style={{ ...segBtnStyle(view === v.id), display: "inline-flex", alignItems: "center", gap: 6 }} title={v.label}>
                  <Icon name={v.icon} size={15} /> <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* vista */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--fg-3)" }}>
            <Tick height={36} style={{ marginBottom: 20 }} />
            <p style={{ margin: "0 auto", maxWidth: 380, fontStyle: "italic" }}>
              {projects.length === 0 ? "Todavía no hay proyectos. Cargá el primero." : "Ningún proyecto coincide con la búsqueda."}
            </p>
          </div>
        ) : (
          <>
            {view === "tablero" && <BoardView projects={filtered} onOpen={(p) => setOpenId(p.id)} onMove={moveStage} />}
            {view === "lista"   && <ListView  projects={filtered} onOpen={(p) => setOpenId(p.id)} />}
            {view === "grilla"  && <GridView  projects={filtered} onOpen={(p) => setOpenId(p.id)} />}
          </>
        )}
      </main>

      {/* footer nota */}
      <footer style={{ borderTop: "1px solid var(--border-hair)", padding: "20px 32px", textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", maxWidth: "none", fontFamily: "var(--font-wordmark)", fontWeight: 400, fontSize: 14, letterSpacing: "0.14em", textIndent: "0.14em", textTransform: "uppercase", textAlign: "center", color: "var(--c-ink)" }}>Aplicativo de gestión interna</p>
        <small style={{ color: "var(--fg-3)" }}>Los datos se guardan en este dispositivo · TECA Muebles · Gonnet, La Plata</small>
      </footer>

      {/* MODALES */}
      {formState && (
        <ProjectForm
          initial={formState.project}
          onSave={handleSaveForm}
          onClose={() => setFormState(null)}
        />
      )}
      {openProject && !formState && (
        <ProjectDetail
          project={openProject}
          onClose={() => setOpenId(null)}
          onUpdate={upsert}
          onEdit={(p) => setFormState({ project: p })}
          onDelete={handleDelete}
          onBlockedAdvance={(proj) => setConfirmAdvance(proj)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar proyecto"
          message={`¿Estás seguro de que querés eliminar “${confirmDelete.nombre}”? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          confirmIcon="trash"
          cancelLabel="Cancelar"
          onConfirm={confirmDeleteNow}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmAdvance && (
        <ConfirmDialog
          title="Falta terminar el taller"
          message={`Este proyecto está al ${confirmAdvance.tallerProgreso}% en el taller. Para pasarlo a Entrega, el avance tiene que estar al 100%.`}
          confirmLabel="Entendido"
          icon="warn"
          filled
          single
          onConfirm={() => setConfirmAdvance(null)}
          onCancel={() => setConfirmAdvance(null)}
        />
      )}
    </div>
  );
}

function Stat({ n, label, last }) {
  return (
    <div style={{ padding: "12px 22px", borderRight: last ? "none" : "1px solid var(--border-hair)" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 300, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)", marginTop: 5, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

const headerStyle = {
  position: "sticky", top: 0, zIndex: 50,
  minHeight: "var(--header-h)", padding: "16px 32px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  flexWrap: "wrap", gap: 14,
  background: "linear-gradient(180deg, rgba(238,228,214,0.7) 0%, rgba(228,214,194,0.42) 100%)",
  backdropFilter: "blur(14px) saturate(1.08)", WebkitBackdropFilter: "blur(14px) saturate(1.08)",
  borderBottom: "1px solid var(--border-hair)",
  boxShadow: "var(--shadow-rest)",
};
const wordmarkBlockStyle = {
  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
};
const wordmarkStyle = {
  fontFamily: "var(--font-wordmark)", fontWeight: 400,
  fontSize: 34, lineHeight: 1, color: "var(--c-ink)",
  letterSpacing: "var(--tracking-mark)", textIndent: "var(--tracking-mark)",
};
const wordmarkSubStyle = {
  fontFamily: "var(--font-sans)", fontWeight: 400,
  fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase",
  color: "var(--c-ink)", opacity: 0.85, whiteSpace: "nowrap",
};
const statsRowStyle = {
  display: "inline-flex", flexWrap: "wrap",
  border: "1px solid var(--border-hair)", background: "rgba(244,236,223,0.5)",
  marginBottom: 28,
};
const toolbarStyle = {
  display: "flex", alignItems: "flex-end", justifyContent: "space-between",
  gap: 20, flexWrap: "wrap", marginBottom: 28,
};
const searchBarStyle = {
  display: "flex", alignItems: "center", gap: 10,
  flex: 1, minWidth: 200, maxWidth: 360,
  background: "var(--c-almond-light)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 14px",
};
const segStyle = { display: "flex", border: "1px solid var(--border-hair)" };
const segBtnStyle = (active) => ({
  background: active ? "var(--c-sand)" : "transparent",
  color: "var(--c-ink)",
  border: 0, borderRadius: 0, cursor: "pointer",
  fontFamily: "var(--font-sans)", fontSize: 12.5, letterSpacing: "0.04em",
  padding: "9px 14px",
  opacity: active ? 1 : 0.6,
  transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out)",
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
