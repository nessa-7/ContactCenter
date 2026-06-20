import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import "./Charts.css";

function RespuestaClienteChart({ data }) {
  if (!data?.campañas) return null;

  const respuestas = data.campañas;

  const normalize = (r) =>
    String(r || "")
      .trim()
      .toLowerCase();

  const sinRespuesta = respuestas.filter((x) => {
    const r = normalize(x.respuesta);
    return r === "sin respuesta";
  }).length;

  const gestionProceso = respuestas.filter((x) => {
    const r = normalize(x.respuesta);
    return r === "gestion en proceso";
  }).length;

  const errorSistema = respuestas.filter((x) => {
    const r = normalize(x.respuesta);
    return r.includes("error en el sistema");
  }).length;

  const noValidas = [
    "sin respuesta",
    "chat abierto",
    "escribio nuevamente",
    "escribió nuevamente",
  ];

  const clienteRespondio = respuestas.filter((x) => {
    const r = normalize(x.respuesta);

    if (!r) return false;
    if (r.includes("error en el sistema")) return false;
    if (noValidas.includes(r)) return false;

    return true;
  }).length;

  const chartData = [
    {
      tipo: "Total",
      valor: respuestas.length,
    },
    {
      tipo: "Respondió",
      valor: clienteRespondio,
    },
    {
      tipo: "Sin respuesta",
      valor: sinRespuesta,
    },
    {
      tipo: "En proceso",
      valor: gestionProceso,
    },
    {
      tipo: "Error sistema",
      valor: errorSistema,
    },
  ];

  return (
    <div className="chart-card">
      <h3>Respuesta del Cliente a Campañas</h3>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="tipo" />
          <YAxis allowDecimals={false} />
          <Tooltip />

          <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.tipo === "Respondió"
                    ? "#22c55e"
                    : entry.tipo === "Sin respuesta"
                    ? "#ef4444"
                    : entry.tipo === "En proceso"
                    ? "#f59e0b"
                    : entry.tipo === "Error sistema"
                    ? "#6366f1"
                    : "#94a3b8"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RespuestaClienteChart;