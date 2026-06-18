/* ProjectDetail — ficha completa del proyecto. */
const { useState: useStateD } = React;

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
}

function ProjectDetail({ project, onClose, onUpdate, onEdit, onDelete, onBlockedAdvance }) {
  const p = project;
  const pct = projectPercent(p);
  const stage = STAGES[p.stageIndex];
  const patch = (changes) => onUpdate({ ...p, ...changes, updatedAt: nowISO() });
  const goStage = (i) => patch({ stageIndex: Math.max(0, Math.min(STAGES.length - 1, i)) });
  /* avanzar etapa con bloqueo taller -> entrega si no está al 100% */
  const tryAdvance = () => {
    if (p.stageIndex === 3 && p.tallerProgreso < 100) { onBlockedAdvance && onBlockedAdvance(p); return; }
    goStage(p.stageIndex + 1);
  };

  /* materiales */
  const [matSel, setMatSel] = useStateD(MATERIAL_OPCIONES[0]);
  const [matCustom, setMatCustom] = useStateD("");
  const [matCant, setMatCant] = useStateD("");
  const isOtro = matSel === "Otro (escribir)";
  const addMaterial = (estado) => {
    const nombre = (isOtro ? matCustom : matSel).trim();
    if (!nombre) return;
    patch({ materiales: [...p.materiales, { id: uid(), nombre, cantidad: matCant.trim(), estado }] });
    setMatCustom(""); setMatCant(""); setMatSel(MATERIAL_OPCIONES[0]);
  };
  const toggleMaterial = (id) => patch({ materiales: p.materiales.map((m) => m.id === id ? { ...m, estado: m.estado === "tengo" ? "comprar" : "tengo" } : m) });
  const removeMaterial = (id) => patch({ materiales: p.materiales.filter((m) => m.id !== id) });
  const ms = materialsSummary(p);

  /* notas (bullets) */
  const [notaInput, setNotaInput] = useStateD("");
  const addNota = () => {
    const texto = notaInput.trim();
    if (!texto) return;
    patch({ notasList: [...p.notasList, { id: uid(), texto, done: false }] });
    setNotaInput("");
  };
  const toggleNota = (id) => patch({ notasList: p.notasList.map((n) => n.id === id ? { ...n, done: !n.done } : n) });
  const removeNota = (id) => patch({ notasList: p.notasList.filter((n) => n.id !== id) });

  /* responsable de la etapa actual */
  const setResp = (val) => patch({ responsables: { ...p.responsables, [stage.id]: val } });

  const tramoText = p.tramos.length
    ? p.tramos.map((t) => {
        const dims = t.medida || [t.ancho, t.largo, t.profundo].filter(Boolean).join(" × ");
        return [t.nombre, dims && `${dims} cm`].filter(Boolean).join(": ");
      }).join("  ·  ")
    : "—";

  return (
    <div style={overlayStyle} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyleD}>
        {/* head */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ minWidth: 0 }}>
            {p.tipoPieza && <div style={{ marginBottom: 12 }}><Badge tone="moss">{p.tipoPieza}</Badge></div>}
            <h3 style={{ margin: 0, fontSize: 38, lineHeight: 1.05 }}>{p.nombre}</h3>
            <div style={{ marginTop: 10, color: "var(--fg-2)", fontSize: 14, display: "flex", flexWrap: "wrap", gap: "4px 18px" }}>
              {p.cliente && <span style={metaItem}><Icon name="user" size={14} /> {p.cliente}</span>}
              {p.ubicacion && <span style={metaItem}><Icon name="pin" size={14} /> {p.ubicacion}</span>}
              {p.fechaEntrega && <span style={metaItem}><Icon name="calendar" size={14} /> {fmtDate(p.fechaEntrega)}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => onEdit(p)} style={iconBtnStyle} aria-label="Editar"><Icon name="edit" size={19} /></button>
            <button onClick={onClose} style={iconBtnStyle} aria-label="Cerrar"><Icon name="x" size={22} /></button>
          </div>
        </div>

        {/* progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, lineHeight: 1 }}>{pct}%</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--fg-2)" }}>{stage.label}</span>
              <span style={{ fontSize: 12, color: "var(--fg-3)" }}>etapa {p.stageIndex + 1} de {STAGES.length}</span>
            </div>
            <ProgressBar value={pct} height={5} />
          </div>
        </div>

        {/* stage tracker */}
        <div style={trackerStyle}>
          {STAGES.map((s, i) => {
            const done = i < p.stageIndex, active = i === p.stageIndex;
            const resp = p.responsables[s.id];
            return (
              <button key={s.id} onClick={() => goStage(i)} style={{
                ...stageCellStyle,
                background: active ? "var(--c-ink)" : done ? "var(--c-sage)" : "transparent",
                color: active ? "var(--c-almond)" : "var(--c-ink)",
                borderColor: active || done ? "transparent" : "var(--border-hair)",
                opacity: i > p.stageIndex ? 0.55 : 1,
              }}>
                <span style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>{i + 1}</span>
                <span style={{ fontSize: 13 }}>{s.short}</span>
                {resp && <span style={{ fontSize: 10.5, opacity: 0.8, fontStyle: "italic" }}>{resp}</span>}
              </button>
            );
          })}
        </div>

        {/* responsable de la etapa actual */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, padding: "12px 14px", border: "1px solid var(--border-hair)", background: "rgba(172,176,135,0.14)" }}>
          <Icon name="user" size={16} style={{ color: "var(--c-moss)" }} />
          <span style={{ fontSize: 12.5, color: "var(--fg-2)", flexShrink: 0 }}>Responsable de <strong style={{ fontWeight: 500 }}>{stage.short}</strong>:</span>
          <input value={p.responsables[stage.id] || ""} onChange={(e) => setResp(e.target.value)}
            placeholder="Nombre…" style={{ ...lineInputD, flex: 1, fontSize: 15 }} />
        </div>

        {/* body grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
          {/* LEFT */}
          <div>
            <h5 style={sectionTitle}>Ficha</h5>
            <dl style={{ margin: 0 }}>
              <DLRow icon="box"   label="Material" value={p.materialTipo} />
              <DLRow icon="ruler" label="Medidas"  value={tramoText} />
              <DLRow icon="image" label="Acabado"  value={p.acabado !== "—" ? p.acabado : ""} />
              <DLRow icon="truck" label="Envío"    value={p.envio} />
              <DLRow icon="tool"  label="Herrajes" value={p.herrajes === "Sí" ? `Sí · ${p.herrajesPuertas} · ${p.herrajesCajones}` : "No"} />
              <DLRow icon="layers2" label="Fondo" value={p.fondo} />
              <DLRow icon="layers2" label="Patas reg." value={p.patasRegulables} />
              <DLRow icon="layers2" label="Zócalos" value={p.zocalos} />
            </dl>

            {p.fotosPrevias.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <h5 style={sectionTitle}>Fotos de referencia</h5>
                <PhotoUpload photos={p.fotosPrevias} onChange={(v) => patch({ fotosPrevias: v })} size={72} ctaLabel="Subir" />
              </div>
            )}

            {/* NOTAS — agregar (izq) + lista (der) */}
            <div style={{ marginTop: 24 }}>
              <h5 style={sectionTitle}>Notas</h5>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 0.8fr) 1.2fr", gap: 20, alignItems: "start" }}>
                {/* IZQUIERDA — agregar nota */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input value={notaInput} onChange={(e) => setNotaInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNota(); } }}
                    placeholder="Agregar nota…" style={{ ...lineInputD, width: "100%" }} />
                  <Button size="sm" variant="secondary" onClick={addNota}><Icon name="plus" size={13} /> Agregar</Button>
                </div>
                {/* DERECHA — lista de notas */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {p.notasList.map((n) => (
                    <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 0" }}>
                      <span style={{ color: "var(--c-moss)", marginTop: 7, flexShrink: 0, lineHeight: 1 }}>•</span>
                      <span onClick={() => toggleNota(n.id)} style={{
                        flex: 1, fontSize: 14.5, cursor: "pointer", lineHeight: 1.5,
                        color: n.done ? "var(--fg-3)" : "var(--fg-1)",
                        textDecoration: n.done ? "line-through" : "none",
                      }}>{n.texto}</span>
                    </div>
                  ))}
                  {p.notasList.length === 0 && <p style={hintD}>Sin notas todavía.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* MATERIALES */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h5 style={sectionTitle}>Materiales</h5>
              <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{ms.total ? `${ms.tengo} listos · ${ms.faltan} a comprar` : "sin items"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
              {p.materiales.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                  <button onClick={() => toggleMaterial(m.id)} style={{
                    ...matCheckStyle,
                    background: m.estado === "tengo" ? "var(--c-moss)" : "transparent",
                    borderColor: m.estado === "tengo" ? "var(--c-moss)" : "var(--border-strong)",
                    color: "var(--c-almond)",
                  }} aria-label="Cambiar estado">{m.estado === "tengo" && <Icon name="check" size={13} stroke={2} />}</button>
                  <span style={{ flex: 1, fontSize: 14.5, color: m.estado === "tengo" ? "var(--fg-3)" : "var(--fg-1)", textDecoration: m.estado === "tengo" ? "line-through" : "none" }}>
                    {m.nombre}{m.cantidad ? <span style={{ color: "var(--fg-3)" }}> · {m.cantidad}</span> : null}
                  </span>
                  {m.estado === "comprar" && <span style={buyTagStyle}><Icon name="cart" size={12} /> comprar</span>}
                  <button onClick={() => removeMaterial(m.id)} style={{ ...iconBtnStyle, padding: 2, color: "var(--fg-3)" }} aria-label="Quitar"><Icon name="x" size={14} /></button>
                </div>
              ))}
              {p.materiales.length === 0 && <p style={hintD}>Todavía no cargaste materiales.</p>}
            </div>
            {/* alta de material */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: "1px solid var(--border-hair)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 2 }}><Select label="Material" value={matSel} onChange={(e) => setMatSel(e.target.value)} options={MATERIAL_OPCIONES} /></div>
                <div style={{ flex: 1 }}>
                  <span style={fieldLabelStyle}>Cantidad</span>
                  <input value={matCant} onChange={(e) => setMatCant(e.target.value)} placeholder="ej. 3" style={{ ...lineInputD, fontSize: 17 }} />
                </div>
              </div>
              {isOtro && (
                <input value={matCustom} onChange={(e) => setMatCustom(e.target.value)} placeholder="Escribí el material…" style={{ ...lineInputD, fontSize: 16 }} autoFocus />
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button size="sm" variant="ghost" onClick={() => addMaterial("tengo")}>Lo tengo</Button>
                <Button size="sm" variant="secondary" onClick={() => addMaterial("comprar")}>A comprar</Button>
              </div>
            </div>

            {/* TALLER */}
            <div style={{ marginTop: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h5 style={sectionTitle}>Avance en el taller</h5>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{p.tallerProgreso}%</span>
              </div>
              {p.stageIndex === 3 ? (
                <input type="range" min="0" max="100" step="5" value={p.tallerProgreso}
                  onChange={(e) => patch({ tallerProgreso: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: "var(--c-moss)", cursor: "pointer" }} />
              ) : (
                <div style={{ padding: "9px 0" }}>
                  <ProgressBar value={p.tallerProgreso} height={5} />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
                <span>Sin empezar</span><span>Terminado</span>
              </div>
              {p.stageIndex !== 3 && (
                <p style={{ margin: "8px 0 0", fontSize: 11.5, fontStyle: "italic", color: "var(--fg-3)" }}>
                  {p.stageIndex < 3
                    ? "El avance se edita cuando el proyecto entra a la etapa de taller."
                    : "Proyecto entregado · avance cerrado."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PLANOS — notas + foto, al final de la ficha */}
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--border-hair)" }}>
          <h5 style={sectionTitle}>Planos</h5>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
            <textarea value={p.planosNotas} onChange={(e) => patch({ planosNotas: e.target.value })}
              placeholder="Estado de planos, optimización de corte, aprobaciones…" rows={4} style={inlineTextareaStyle} />
            <div>
              <span style={{ ...fieldLabelStyle, marginBottom: 10 }}>Foto del plano</span>
              <PhotoUpload photos={p.planoFotos} onChange={(v) => patch({ planoFotos: v })} ctaLabel="Plano" />
            </div>
          </div>
        </div>

        {/* OBSERVACIONES ADICIONALES */}
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--border-hair)" }}>
          <h5 style={sectionTitle}>Observaciones adicionales</h5>
          <textarea value={p.observaciones || ""}
            onChange={(e) => patch({ observaciones: e.target.value.length ? e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) : e.target.value })}
            placeholder="Detalles, pedidos especiales, notas del cliente…" rows={3} style={inlineTextareaStyle} />
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border-hair)" }}>
          <button onClick={() => onDelete(p)} style={{ ...iconBtnStyle, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-3)" }}>
            <Icon name="trash" size={15} /> Eliminar
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="ghost" onClick={() => goStage(p.stageIndex - 1)} disabled={p.stageIndex === 0}><Icon name="chevL" size={15} /> Etapa anterior</Button>
            <Button variant="primary" onClick={tryAdvance} disabled={p.stageIndex === STAGES.length - 1}>Avanzar etapa <Icon name="chevR" size={15} /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DLRow({ icon, label, value }) {
  const has = value && value !== "—";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border-hair)" }}>
      <span style={{ color: "var(--fg-3)", width: 96, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Icon name={icon} size={13} /> {label}
      </span>
      <span style={{ fontSize: 15.5, color: has ? "var(--fg-1)" : "var(--fg-3)", fontFamily: "var(--font-display)" }}>{has ? value : "—"}</span>
    </div>
  );
}

const modalStyleD = {
  background: "var(--bg-2)", border: "1px solid var(--border-hair)",
  boxShadow: "var(--shadow-overlay)", width: "100%", maxWidth: 920,
  padding: "36px 44px 40px", borderRadius: 0,
};
const metaItem = { display: "inline-flex", alignItems: "center", gap: 5 };
const trackerStyle = { display: "grid", gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 4, marginTop: 20 };
const stageCellStyle = {
  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
  padding: "10px 12px", border: "1px solid", borderRadius: 0, cursor: "pointer", textAlign: "left",
  fontFamily: "var(--font-sans)", minHeight: 58,
  transition: "background var(--dur-base) var(--ease-out), opacity var(--dur-base) var(--ease-out)",
};
const sectionTitle = { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-3)", margin: "0 0 12px", fontFamily: "var(--font-sans)", fontWeight: 500 };
const matCheckStyle = { width: 20, height: 20, border: "1px solid", borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 };
const buyTagStyle = { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-earth-deep)" };
const lineInputD = { background: "transparent", border: 0, borderBottom: "1px solid var(--border-strong)", borderRadius: 0, padding: "8px 0", fontFamily: "var(--font-display)", fontSize: 16, color: "var(--c-ink)", outline: "none", boxSizing: "border-box" };
const hintD = { fontSize: 13.5, color: "var(--fg-3)", fontStyle: "italic", margin: "4px 0 0" };
const inlineTextareaStyle = { width: "100%", boxSizing: "border-box", background: "transparent", border: "1px solid var(--border-hair)", borderRadius: 0, padding: 12, fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: 14, color: "var(--c-ink)", lineHeight: 1.6, resize: "vertical", outline: "none" };

Object.assign(window, { ProjectDetail, fmtDate });
