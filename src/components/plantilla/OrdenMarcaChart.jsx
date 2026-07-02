import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "./Charts.css";

function OrdenMarcaChart({ data }) {
  if (!data?.baseCasos) return null;

  // Solo clientes que tienen teléfono
  const clientesValidos =
    data.baseCasos.filter((x) =>
      String(x.Telefono || x.Teléfono || "").trim()
    );

  const conOrden =
    clientesValidos.filter((x) =>
      String(
        x["Orden Marca"] || ""
      ).trim()
    ).length;

  const sinOrden =
    clientesValidos.length -
    conOrden;

  const chartData = [
    {
      name: "Compartió orden",
      value: conOrden,
    },
    {
      name: "Sin orden",
      value: sinOrden,
    },
  ];

  return (
    <div className="chart-card">
      <h3>
        Órdenes de Servicio Compartidas
      </h3>

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
            <Cell fill="#54de3f" />
            <Cell fill="#ef4483" />
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

export default OrdenMarcaChart;