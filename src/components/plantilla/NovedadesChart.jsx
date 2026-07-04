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

  const COLORS = ["#7fb7ff", "#ffb86b", "#8bd39e", "#ffd56b", "#f28b82"];

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

          <Bar dataKey="pendientes" name="Pendientes" fill="#ec9cea" radius={[0, 18, 18, 0]} barSize={22}>
            <LabelList dataKey="pendientes" position="insideLeft" formatter={(val) => val} fill="#db2bcf" />
          </Bar>
          <Bar dataKey="solucionados" name="Solucionados" fill="#92e485" radius={[0, 18, 18, 0]} barSize={22}>
            <LabelList dataKey="solucionados" position="insideRight" formatter={(val) => val} fill="#0fa21e" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
    </div>
  );
}

export default NovedadesChart;