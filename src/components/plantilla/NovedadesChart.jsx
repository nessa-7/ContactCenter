import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Charts.css";

function NovedadesChart({
  data,
}) {
  if (!data) return null;

  console.log(data.noCompletoFlujo);
  console.log(data.fueraGarantia);

  const noCompleto =
    data.noCompletoFlujo.filter(
      (x) =>
        x.observacion ===
        "No completo el flujo"
    ).length;

  const cedula =
    data.noCompletoFlujo.filter(
      (x) =>
        x.observacion ===
        "Cedula erronea"
    ).length;

  const garantia =
    data.fueraGarantia.length;

  const chartData = [
    {
      tipo:
        "No completó",
      valor: noCompleto,
    },
    {
      tipo:
        "Cédula errónea",
      valor: cedula,
    },
    {
      tipo:
        "Fuera garantía",
      valor: garantia,
    },
  ];

  return (
    <div className="chart-card">
      <h3>Novedades</h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart
          data={chartData}
        >
          <XAxis dataKey="tipo" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="valor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default NovedadesChart;