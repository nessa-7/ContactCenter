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
  const manejadoMaria = (left.filter((x) => matchAny(x, ["maria elena", "manejado por maria elena"]) ).length) + (right.filter((x) => matchAny(x, ["maria elena", "manejado por maria elena"]) ).length);
  const escalado = (left.filter((x) => matchAny(x, ["escalado a lina", "escalado a la lina"]) ).length) + (right.filter((x) => matchAny(x, ["escalado a lina", "escalado a la lina"]) ).length);
  const garantia = right.length;

  // Calcular solucionados (solo tabla izquierda)
  const isSolved = (x) => {
    const estado = normalize(x.estado || "");
    const note = normalize(x.nota || "");
    const obs = normalize(x.observacion || "");
    return estado.includes("solucionado") || note.includes("solucionado") || obs.includes("solucionado");
  };

  const noCompletoSol = left.filter((x) => matchAny(x, ["no completo", "no completo el flujo"]) && isSolved(x)).length;
  const cedulaSol = left.filter((x) => matchAny(x, ["cedula", "cédula"]) && isSolved(x)).length;
  const manejadoMariaSol = left.filter((x) => matchAny(x, ["maria elena", "manejado por maria elena"]) && isSolved(x)).length;
  const escaladoSol = left.filter((x) => matchAny(x, ["escalado a lina", "escalado a la lina"]) && isSolved(x)).length;

  const chartData = [
    { tipo: "No completó flujo", total: noCompleto, solucionados: noCompletoSol, pendientes: Math.max(0, noCompleto - noCompletoSol) },
    { tipo: "Cédula errónea", total: cedula, solucionados: cedulaSol, pendientes: Math.max(0, cedula - cedulaSol) },
    { tipo: "Cambio/Devolución", total: manejadoMaria, solucionados: manejadoMariaSol, pendientes: Math.max(0, manejadoMaria - manejadoMariaSol) },
    { tipo: "PQRS", total: escalado, solucionados: escaladoSol, pendientes: Math.max(0, escalado - escaladoSol) },
  ];

  const COLORS = {
    "No completó flujo": "#87dae8",
    "Cédula errónea": "#b082d5",
    "Cambio/Devolución": "#efd054",
    PQRS: "#dda05f",
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
    Object.entries(COLORS).map(([tipo, color]) => [tipo, darkenColor(color)])
  );

  const renderBarLabel = ({ x, y, width, height, value, dataKey, payload }) => {
    const entryType = payload?.tipo;
    const baseColor = dataKey === "pendientes"
      ? COLORS[entryType]
      : SOLVED_COLORS[entryType];
    const textColor = baseColor || (dataKey === "pendientes" ? "#2f2f2f7e" : "#26262698");
    const isRight = dataKey === "solucionados";

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
          <Tooltip />
          <Legend />

          <Bar dataKey="pendientes" name="Pendientes" radius={[0, 18, 18, 0]} barSize={22}>
            {chartData.map((entry, index) => (
              <Cell key={`pending-${index}`} fill={COLORS[entry.tipo] || "#ec9cea"} />
            ))}
            <LabelList dataKey="pendientes" content={renderBarLabel} />
          </Bar>
          <Bar dataKey="solucionados" name="Solucionados" radius={[0, 18, 18, 0]} barSize={22}>
            {chartData.map((entry, index) => (
              <Cell key={`solved-${index}`} fill={SOLVED_COLORS[entry.tipo] || "#5fbf5f"} />
            ))}
            <LabelList dataKey="solucionados" content={renderBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
    </div>
  );
}

export default NovedadesChart;