import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import "./Charts.css";

function RespuestaClienteChart({
  data,
}) {
  if (!data?.campañas)
    return null;

  const respuestas =
    data.campañas;

  const sinRespuesta =
    respuestas.filter(
      (x) =>
        x.respuesta
          ?.trim()
          .toLowerCase() ===
        "sin respuesta"
    ).length;

  const gestionProceso =
    respuestas.filter(
      (x) =>
        x.respuesta
          ?.trim()
          .toLowerCase() ===
        "gestion en proceso"
    ).length;

  const errorSistema =
    respuestas.filter(
      (x) =>
        x.respuesta
          ?.trim()
          .toLowerCase()
          .includes(
            "error en el sistema"
          )
    ).length;

  const respuestaPositiva =
    respuestas.filter((x) => {
      const r =
        x.respuesta
          ?.trim()
          .toLowerCase();

      return (
        r &&
        r !==
          "sin respuesta" &&
        r !==
          "gestion en proceso" &&
        !r.includes(
          "error en el sistema"
        )
      );
    }).length;

  const respuestaNegativa = 0;

  const total = respuestas.length - 1;

  const chartData = [
    {
      tipo: "Total",
      valor: total,
    },
    {
      tipo: "Sin respuesta",
      valor: sinRespuesta,
    },
    {
      tipo:
        "Gestión en proceso",
      valor: gestionProceso,
    },
    {
      tipo:
        "Error sistema",
      valor: errorSistema,
    },
    
  ];

  return (
    <div className="chart-card">
      <h3>
        Respuesta del Cliente a Campañas
      </h3>

      <ResponsiveContainer
        width="100%"
        height={420}
      >
        <BarChart
          data={chartData}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="tipo" />

          <YAxis
            allowDecimals={
              false
            }
          />

          <Tooltip />

          <Bar
            dataKey="valor"
            radius={[
              6, 6, 0, 0,
            ]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RespuestaClienteChart;