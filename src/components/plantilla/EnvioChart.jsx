import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Charts.css";

function EnvioChart({ data }) {
  const enviados =
    data.campañas.filter(
      (x) =>
        String(x.enviado)
          .toUpperCase()
          .trim() === "SI"
    ).length;

  const noEnviados =
    data.campañas.filter(
      (x) =>
        String(x.enviado)
          .toUpperCase()
          .trim() === "NO"
    ).length;

  const chartData = [
    {
      name: "Enviado",
      value: enviados,
    },
    {
      name: "No enviado",
      value: noEnviados,
    },
  ];

  return (
    <div className="chart-card">
      <h3>Estado Envíos de Campañas</h3>

      <ResponsiveContainer
        width="100%"
        height={400}
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            label
          >
            <Cell fill="#22c55e" />
            <Cell fill="#ef4444" />
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EnvioChart;