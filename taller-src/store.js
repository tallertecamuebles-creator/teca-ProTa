/* ------------------------------------------------------------------ *
 *  TECA · ProTa — modelo de datos + persistencia (guardado local)      *
 * ------------------------------------------------------------------ */

const STAGES = [
  { id: "nuevo",      label: "Sin comenzar",          short: "Sin comenzar", desc: "Datos del encargo: cliente, pieza, medidas y materiales base." },
  { id: "planos",     label: "Planos y Optimización", short: "Planos",       desc: "Dibujo, planos y optimización del corte antes de empezar." },
  { id: "materiales", label: "Compra de materiales",  short: "Materiales",   desc: "Lista de lo que se necesita, con lo que ya tenés y lo que hay que comprar." },
  { id: "taller",     label: "Taller",                short: "Taller",       desc: "El proyecto en construcción. Cuánto falta para terminarlo." },
  { id: "entrega",    label: "Entrega",               short: "Entrega",      desc: "Pieza terminada. Coordinar la entrega." },
];

/* Tipo de material (alta de proyecto) */
const MATERIAL_TIPOS = ["Aglomerado o MDF", "Madera maciza"];

/* Opciones de material para la lista de la ficha */
const MATERIAL_OPCIONES = [
  "MDF blanco",
  "Aglomerado blanco",
  "MDF paraíso",
  "Aglomerado paraíso",
  "MDF Crudo",
  "MDF Negro",
  "MDF Enchapado paraíso",
  "MDF Camelia",
  "Tablero Finger 20mm",
  "Tablero Finger 30mm",
  "Tablero Finger 40mm",
  "Otro (escribir)",
];

const ACABADOS = ["—", "Laca", "Barniz (a color)"];
const ENVIO_OPTS = ["Con envío", "Sin envío"];
const HERRAJE_PUERTAS = ["Codo 0", "Codo 9", "Codo 18"];
const HERRAJE_CAJONES = ["Tradicional", "Cierre suave", "Push open"];
const FONDOS = ["Blanco", "Crudo"];

const STORAGE_KEY = "teca_taller_proyectos_v1";

/* ---- utilidades ---- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function nowISO() { return new Date().toISOString(); }

/* Convierte un File de imagen en dataURL escalado (para guardar liviano). */
function fileToDataURL(file, max = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/* Proyecto vacío para el alta. */
function emptyProject() {
  return {
    id: uid(),
    nombre: "",
    cliente: "",
    ubicacion: "",
    tipoPieza: "",
    materialTipo: "Aglomerado o MDF",
    tramos: [],                 // [{id, nombre, medida}]
    fechaEntrega: "",
    envio: "Con envío",
    herrajes: "No",
    herrajesPuertas: "Codo 0",
    herrajesCajones: "Tradicional",
    fondo: "Blanco",
    patasRegulables: "No",
    zocalos: "No",
    acabado: "—",
    fotosPrevias: [],           // [dataURL]
    // ficha:
    responsables: {},           // { stageId: "Nombre" }
    notasList: [],              // [{id, texto, done}]
    materiales: [],             // [{id, nombre, cantidad, estado}]
    planosNotas: "",
    planoFotos: [],             // [dataURL]
    observaciones: "",
    tallerProgreso: 0,
    stageIndex: 0,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

/* Rellena defaults para datos viejos (migración suave, conserva lo cargado). */
function normalize(p) {
  const base = emptyProject();
  const out = { ...base, ...p };
  out.tramos = p.tramos || [];
  out.fotosPrevias = p.fotosPrevias || [];
  out.planoFotos = p.planoFotos || [];
  out.responsables = p.responsables || {};
  out.materiales = (p.materiales || []).map((m) => ({ cantidad: "", ...m }));
  out.notasList = p.notasList || (p.notas ? [{ id: uid(), texto: p.notas, done: false }] : []);
  out.id = p.id || base.id;
  out.createdAt = p.createdAt || base.createdAt;
  return out;
}

/* ---- progreso global (0–100) ---- */
function projectPercent(p) {
  const n = STAGES.length;
  const per = 100 / n;
  if (p.stageIndex >= n - 1) return 100;
  let pct = p.stageIndex * per;
  if (p.stageIndex === 3) pct += (p.tallerProgreso / 100) * per;
  return Math.round(pct);
}

function materialsSummary(p) {
  const total = p.materiales.length;
  const tengo = p.materiales.filter((m) => m.estado === "tengo").length;
  return { total, tengo, faltan: total - tengo };
}

/* ---- persistencia ---- */
function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw).map(normalize);
  } catch (e) { console.warn("No se pudo leer:", e); }
  return seedProjects();
}
function saveProjects(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { console.warn("No se pudo guardar (¿almacenamiento lleno?):", e); }
}

/* ---- datos de ejemplo ---- */
function seedProjects() {
  const mk = (over) => normalize({ ...emptyProject(), id: uid(), ...over });
  return [
    mk({
      nombre: "Mesa de comedor La Calandria", cliente: "Familia Ferreyra", ubicacion: "City Bell",
      tipoPieza: "Mesa de comedor", materialTipo: "Madera maciza",
      tramos: [{ id: uid(), nombre: "Tapa", ancho: "240", largo: "100", profundo: "" }, { id: uid(), nombre: "Alto total", ancho: "", largo: "", profundo: "76" }],
      fechaEntrega: "2026-07-18", envio: "Con envío", herrajes: "No", fondo: "Crudo",
      patasRegulables: "No", zocalos: "No", acabado: "Barniz (a color)",
      responsables: { nuevo: "Mariano", planos: "Mariano", taller: "Juan" },
      notasList: [
        { id: uid(), texto: "Tapa de una sola pieza", done: true },
        { id: uid(), texto: "Patas en H", done: false },
        { id: uid(), texto: "Confirmar grosor de tapa con el cliente", done: false },
      ],
      planosNotas: "Optimización de corte lista.",
      materiales: [
        { id: uid(), nombre: "Tablero Finger 40mm", cantidad: "2", estado: "tengo" },
        { id: uid(), nombre: "Tornillería patas", cantidad: "1 set", estado: "comprar" },
      ],
      tallerProgreso: 45, stageIndex: 3,
    }),
    mk({
      nombre: "Vestidor dormitorio principal", cliente: "Lucía Mendizábal", ubicacion: "Gonnet",
      tipoPieza: "Vestidor a medida", materialTipo: "Aglomerado o MDF",
      tramos: [{ id: uid(), nombre: "Módulo izq.", ancho: "120", largo: "240", profundo: "60" }, { id: uid(), nombre: "Módulo der.", ancho: "200", largo: "240", profundo: "60" }],
      fechaEntrega: "2026-08-05", envio: "Con envío", herrajes: "Sí", herrajesPuertas: "Codo 18", herrajesCajones: "Cierre suave", fondo: "Blanco",
      patasRegulables: "Sí", zocalos: "Sí", acabado: "Laca",
      responsables: { nuevo: "Mariano" },
      notasList: [{ id: uid(), texto: "Cajones con guías de extracción total", done: false }, { id: uid(), texto: "Barral central", done: false }],
      materiales: [
        { id: uid(), nombre: "MDF Enchapado paraíso", cantidad: "5", estado: "comprar" },
        { id: uid(), nombre: "Guías telescópicas", cantidad: "8", estado: "comprar" },
      ],
      tallerProgreso: 0, stageIndex: 2,
    }),
    mk({
      nombre: "Rack de TV flotante", cliente: "Diego Sosa", ubicacion: "La Plata centro",
      tipoPieza: "Rack de TV", materialTipo: "Madera maciza",
      tramos: [{ id: uid(), nombre: "Cuerpo", ancho: "180", largo: "35", profundo: "30" }],
      fechaEntrega: "2026-06-20", envio: "Con envío", herrajes: "No", fondo: "Crudo",
      patasRegulables: "No", zocalos: "No", acabado: "Barniz (a color)",
      responsables: { nuevo: "Mariano", planos: "Mariano", materiales: "Juan", taller: "Juan", entrega: "Mariano" },
      notasList: [{ id: uid(), texto: "Fijación oculta a pared", done: true }, { id: uid(), texto: "Coordinar entrega sábado", done: false }],
      planosNotas: "Planos cerrados y aprobados por el cliente.",
      materiales: [{ id: uid(), nombre: "Tablero Finger 30mm", cantidad: "1", estado: "tengo" }],
      tallerProgreso: 100, stageIndex: 4,
    }),
    mk({
      nombre: "Escritorio a medida", cliente: "Estudio Paredes", ubicacion: "Tolosa",
      tipoPieza: "Escritorio", materialTipo: "Aglomerado o MDF",
      tramos: [{ id: uid(), nombre: "Tabla", ancho: "160", largo: "70", profundo: "" }],
      fechaEntrega: "2026-09-01", envio: "Sin envío", herrajes: "Sí", herrajesPuertas: "Codo 0", herrajesCajones: "Tradicional", fondo: "Blanco",
      patasRegulables: "No", zocalos: "No", acabado: "Laca",
      notasList: [{ id: uid(), texto: "Pasacables integrado", done: false }],
      tallerProgreso: 0, stageIndex: 0,
    }),
  ];
}

Object.assign(window, {
  STAGES, MATERIAL_TIPOS, MATERIAL_OPCIONES, ACABADOS, ENVIO_OPTS,
  HERRAJE_PUERTAS, HERRAJE_CAJONES, FONDOS,
  uid, nowISO, fileToDataURL, emptyProject, normalize,
  projectPercent, materialsSummary, loadProjects, saveProjects,
});
