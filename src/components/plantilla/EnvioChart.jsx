import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "./Charts.css";

function EnvioChart({ data }) {
  const noCompleto =
    data.noCompletoFlujo?.filter(
      (x) =>
        x.observacion === "No completo el flujo"
    ).length || 0;

  const cedulaErronea =
    data.noCompletoFlujo?.filter(
      (x) =>
        x.observacion === "cedula erronea"
    ).length || 0;

  const fueraGarantia =
    data.fueraGarantia?.length || 0;

  const chartData = [
    {
      name: "No completó el flujo",
      value: noCompleto,
    },
    {
      name: "Cédula errónea",
      value: cedulaErronea,
    },
    {
      name: "Fuera garantía",
      value: fueraGarantia,
    },
  ];

  return (
    <div className="chart-card">
      <h3>Novedades de flujo</h3>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={chartData} dataKey="value" label>
            <Cell fill="#a48a7d" />
            <Cell fill="#b082d5" />
            <Cell fill="#e56464" />
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EnvioChart;
