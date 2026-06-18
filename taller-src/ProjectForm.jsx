/* ProjectForm — alta y edición de un proyecto. Modal sobre crema. */
const { useState: useStateF } = React;

function ProjectForm({ initial, onSave, onClose }) {
  const [p, setP] = useStateF(initial);
  const capFirst = (s) => (s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const setCap = (k) => (e) => setP({ ...p, [k]: capFirst(e.target.value) });
  const setV = (k) => (v) => setP({ ...p, [k]: v });

  /* ---- tramos (medidas) ---- */
  const addTramo = () => setP({ ...p, tramos: [...p.tramos, { id: uid(), nombre: "", ancho: "", largo: "", profundo: "" }] });
  const setTramo = (id, field, val) =>
    setP({ ...p, tramos: p.tramos.map((t) => t.id === id ? { ...t, [field]: field === "nombre" ? (val && val.length ? val.charAt(0).toUpperCase() + val.slice(1) : val) : val } : t) });
  const delTramo = (id) => setP({ ...p, tramos: p.tramos.filter((t) => t.id !== id) });

  const submit = (e) => {
    e.preventDefault();
    if (!p.nombre.trim()) return;
    onSave({ ...p, updatedAt: nowISO() });
  };
  const isEdit = !!initial.nombre;

  return (
    <div style={overlayStyle} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={submit} style={modalStyle}>
        <div style={modalHeadStyle}>
          <div>
            <Eyebrow>{isEdit ? "Editar encargo" : "Nuevo encargo"}</Eyebrow>
            <h3 style={{ margin: "8px 0 0", fontSize: 34 }}>{isEdit ? "Editar proyecto" : "Cargar un proyecto"}</h3>
          </div>
          <button type="button" onClick={onClose} style={iconBtnStyle} aria-label="Cerrar"><Icon name="x" size={22} /></button>
        </div>

        {/* DATOS BASE */}
        <div style={formGrid}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Nombre del proyecto" value={p.nombre} onChange={setCap("nombre")} placeholder="Mesa de comedor, vestidor…" />
          </div>
          <Field label="Cliente" value={p.cliente} onChange={setCap("cliente")} placeholder="Nombre o familia" />
          <Field label="Ubicación" value={p.ubicacion} onChange={setCap("ubicacion")} placeholder="Barrio, ciudad y calle" />
          <Field label="Tipo de pieza" value={p.tipoPieza} onChange={setCap("tipoPieza")} placeholder="Mesa, vestidor, rack…" />
          <Select label="Material" value={p.materialTipo} onChange={set("materialTipo")} options={MATERIAL_TIPOS} />
          <Field label="Fecha de entrega" type="date" value={p.fechaEntrega} onChange={set("fechaEntrega")} />
          <LabeledToggle label="Envío" value={p.envio} onChange={setV("envio")} options={ENVIO_OPTS} />
        </div>

        {/* MEDIDAS POR TRAMO */}
        <div style={blockStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={fieldLabelStyle}>Medidas por tramo</span>
            <Button size="sm" variant="ghost" onClick={addTramo}><Icon name="plus" size={13} /> Agregar tramo</Button>
          </div>
          {p.tramos.length === 0 && <p style={hintStyle}>Agregá uno o más tramos con sus medidas (ancho, largo, profundo en cm).</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.tramos.map((t, i) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.8fr auto", gap: 10, alignItems: "center" }}>
                <input value={t.nombre} onChange={(e) => setTramo(t.id, "nombre", e.target.value)}
                  placeholder={`Tramo ${i + 1}`} style={lineInputStyle} />
                <input value={t.ancho} onChange={(e) => setTramo(t.id, "ancho", e.target.value)} placeholder="Ancho" style={lineInputStyle} />
                <input value={t.largo} onChange={(e) => setTramo(t.id, "largo", e.target.value)} placeholder="Largo" style={lineInputStyle} />
                <input value={t.profundo} onChange={(e) => setTramo(t.id, "profundo", e.target.value)} placeholder="Prof." style={lineInputStyle} />
                <button type="button" onClick={() => delTramo(t.id)} style={{ ...iconBtnStyle, color: "var(--fg-3)" }} aria-label="Quitar tramo"><Icon name="x" size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* OPCIONES CONSTRUCTIVAS */}
        <div style={blockStyle}>
          <span style={{ ...fieldLabelStyle, marginBottom: 14 }}>Detalles del mueble</span>
          <div style={formGrid}>
            <LabeledToggle label="¿Herrajes?" value={p.herrajes} onChange={setV("herrajes")} />
            <Select label="Acabado" value={p.acabado} onChange={set("acabado")} options={ACABADOS} />
            {p.herrajes === "Sí" && (
              <>
                <Select label="Puertas (codo)" value={p.herrajesPuertas} onChange={set("herrajesPuertas")} options={HERRAJE_PUERTAS} />
                <Select label="Cajón (tipo)" value={p.herrajesCajones} onChange={set("herrajesCajones")} options={HERRAJE_CAJONES} />
              </>
            )}
            <Select label="Fondo" value={p.fondo} onChange={set("fondo")} options={FONDOS} />
            <LabeledToggle label="¿Patas regulables?" value={p.patasRegulables} onChange={setV("patasRegulables")} />
            <LabeledToggle label="¿El lugar tiene zócalos?" value={p.zocalos} onChange={setV("zocalos")} />
          </div>
        </div>

        {/* FOTOS PREVIAS */}
        <div style={blockStyle}>
          <span style={{ ...fieldLabelStyle, marginBottom: 12 }}>Fotos del proyecto / referencia</span>
          <PhotoUpload photos={p.fotosPrevias} onChange={setV("fotosPrevias")} ctaLabel="Subir" />
        </div>

        {/* OBSERVACIONES */}
        <div style={blockStyle}>
          <Field label="Observaciones adicionales" textarea rows={4}
            value={p.observaciones || ""} onChange={setCap("observaciones")}
            placeholder="Detalles, pedidos especiales, notas del cliente…" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={!p.nombre.trim()}>{isEdit ? "Guardar cambios" : "Crear proyecto"}</Button>
        </div>
      </form>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 100,
  background: "rgba(46,34,24,0.38)",
  backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
  display: "flex", alignItems: "flex-start", justifyContent: "center",
  padding: "48px 24px", overflowY: "auto",
  animation: "tecaFade var(--dur-base) var(--ease-out)",
};
const modalStyle = {
  background: "var(--bg-2)", border: "1px solid var(--border-hair)",
  boxShadow: "var(--shadow-overlay)", width: "100%", maxWidth: 720,
  padding: "40px 44px 44px", borderRadius: 0,
};
const modalHeadStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 };
const iconBtnStyle = { background: "transparent", border: 0, cursor: "pointer", color: "var(--fg-2)", padding: 6, lineHeight: 0, borderRadius: 0 };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 32px" };
const blockStyle = { marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border-hair)" };
const hintStyle = { fontSize: 13, color: "var(--fg-3)", fontStyle: "italic", margin: "0 0 10px" };
const lineInputStyle = {
  width: "100%", boxSizing: "border-box", background: "transparent",
  border: 0, borderBottom: "1px solid var(--border-strong)", borderRadius: 0,
  padding: "9px 0", fontFamily: "var(--font-display)", fontSize: 17, color: "var(--c-ink)", outline: "none",
};

Object.assign(window, { ProjectForm, overlayStyle, iconBtnStyle });
