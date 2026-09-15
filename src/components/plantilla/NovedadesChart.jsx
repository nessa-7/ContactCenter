import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
  Cell,
} from "recharts";

import "./Charts.css";

function NovedadesChart({ data }) {
  if (!data) return null;

  const left = data.noCompletoFlujo || [];
  const right = data.fueraGarantia || [];

  const normalize = (s) => String(s || "").toLowerCase();
  const matchAny = (item, keywords) => {
    const txt = normalize(item.observacion) + " " + normalize(item.nota);
    return keywords.some((kw) => txt.includes(kw));
  };

  const noCompleto = left.filter((x) => matchAny(x, ["no completo", "no completo el flujo"]) ).length;
  const cedula = (left.filter((x) => matchAny(x, ["cedula", "cédula"]) ).length) + (right.filter((x) => matchAny(x, ["cedula", "cédula"]) ).length);
  const cambioDevolucion = (left.filter((x) => matchAny(x, ["cambio", "devolucion", "devolución"]) ).length) + (right.filter((x) => matchAny(x, ["cambio", "devolucion", "devolución"]) ).length);
  const pqr = (left.filter((x) => matchAny(x, ["pqr"]) ).length) + (right.filter((x) => matchAny(x, ["pqr"]) ).length);
  const garantia = right.length;

  // Calcular cerrados (solo tabla izquierda)
  const isClosed = (x) => {
    const estado = normalize(x.estado || "");
    const nota = normalize(x.nota || "");
    const observacion = normalize(x.observacion || "");
    return `${estado} ${nota} ${observacion}`.includes("cerrad");
  };

  const noCompletoSol = left.filter((x) => matchAny(x, ["no completo", "no completo el flujo"]) && isClosed(x)).length;
  const cedulaSol = left.filter((x) => matchAny(x, ["cedula", "cédula"]) && isClosed(x)).length;
  const cambioDevolucionSol = left.filter((x) => matchAny(x, ["cambio", "devolucion", "devolución"]) && isClosed(x)).length;
  const pqrSol = left.filter((x) => matchAny(x, ["pqr"]) && isClosed(x)).length;

  const chartData = [
    { tipo: "No completó flujo", total: noCompleto, cerrados: noCompletoSol, pendientes: Math.max(0, noCompleto - noCompletoSol) },
    { tipo: "Cédula errónea", total: cedula, cerrados: cedulaSol, pendientes: Math.max(0, cedula - cedulaSol) },
    { tipo: "Cambio/Devolución", total: cambioDevolucion, cerrados: cambioDevolucionSol, pendientes: Math.max(0, cambioDevolucion - cambioDevolucionSol) },
    { tipo: "PQR", total: pqr, cerrados: pqrSol, pendientes: Math.max(0, pqr - pqrSol) },
  ];

  const COLORS = {
    "No completó flujo": "#87dae8",
    "Cédula errónea": "#b082d5",
    "Cambio/Devolución": "#efd054",
    PQR: "#dda05f",
  };

  const darkenColor = (hex, amount = 0.18) => {
    const normalized = hex.replace("#", "");
    const color = normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;

    const value = parseInt(color, 16);
    let r = (value >> 16) & 255;
    let g = (value >> 8) & 255;
    let b = value & 255;

    const apply = (channel) => Math.max(0, Math.round(channel * (1 - amount)));

    return `#${[r, g, b]
      .map(apply)
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const SOLVED_COLORS = Object.fromEntries(
    Object.entries(COLORS).map(([tipo, color]) => [tipo, darkenColor(color, 0.35)] )
  );

  const renderBarLabel = ({ x, y, width, height, value, dataKey, payload }) => {
    const entryType = payload?.tipo;
    const baseColor = dataKey === "pendientes"
      ? COLORS[entryType]
      : SOLVED_COLORS[entryType];
    const textColor = baseColor || (dataKey === "pendientes" ? "#2f2f2f7e" : "#26262698");
    const isRight = dataKey === "cerrados";

    return (
      <text
        x={isRight ? x + width - 6 : x + 6}
        y={y + height / 2}
        textAnchor={isRight ? "end" : "start"}
        dominantBaseline="middle"
        fill={textColor}
        fontSize={12}
        fontWeight={600}
      >
        {value}
      </text>
    );
  };

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const values = payload[0].payload;

    return (
      <div style={{ background: "#fff", border: "1px solid #d1d5db", padding: "8px 10px", color: "#374151" }}>
        <div style={{ marginBottom: 6 }}>{label}</div>
        <div style={{ color: COLORS[label] || "#87dae8" }}>Pendientes: {values.pendientes}</div>
        <div style={{ color: SOLVED_COLORS[label] || "#4f8ca0" }}>Cerrados: {values.cerrados}</div>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <h3>Novedades</h3>

      <ResponsiveContainer width="100%" height={430}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
          barCategoryGap={20}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="tipo" type="category" width={160} />
          <Tooltip content={renderTooltip} />
          <Legend
            content={() => (
              <div style={{ display: "flex", justifyContent: "center", gap: 18, paddingTop: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, backgroundColor: "#93d5e0", display: "inline-block" }} />
                  Pendientes
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, backgroundColor: "#4f8ca0", display: "inline-block" }} />
                  Cerrados
                </span>
              </div>
            )}
          />

          <Bar dataKey="pendientes" name="Pendientes" fill="#a2e2ed" radius={[0, 18, 18, 0]} barSize={18}>
            {chartData.map((entry, index) => (
              <Cell key={`pending-${index}`} fill={COLORS[entry.tipo] || "#ec9cea"} />
            ))}
            <LabelList dataKey="pendientes" content={renderBarLabel} />
          </Bar>
          <Bar dataKey="cerrados" name="Cerrados" fill="#4b5563" radius={[0, 18, 18, 0]} barSize={18}>
            {chartData.map((entry, index) => (
              <Cell key={`solved-${index}`} fill={SOLVED_COLORS[entry.tipo] || "#5fbf5f"} />
            ))}
            <LabelList dataKey="cerrados" content={renderBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
    </div>
  );
}

export default NovedadesChart;