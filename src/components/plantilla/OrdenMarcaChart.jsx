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

  const normalizeValue = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const getGeneradaPor = (caso) => {
    const key = Object.keys(caso).find(
      (itemKey) => normalizeValue(itemKey) === "generada por"
    );

    return key ? normalizeValue(caso[key]) : "";
  };

  // Solo clientes que tienen teléfono
  const clientesValidos =
    data.baseCasos.filter((x) =>
      String(x.Telefono || x.Teléfono || "").trim()
    );

  const opciones = [
    { name: "asesor", color: "#ffb875" },
    { name: "auxiliar sc punto", color: "#e7df47" },
    { name: "cliente", color: "#89d2ff" },
    { name: "cliente no la comparte", color: "#ee6565" },
    { name: "contact", color: "#83e144" },
  ];

  const chartData = opciones.map(({ name, color }) => ({
    name,
    color,
    value: clientesValidos.filter(
      (caso) => getGeneradaPor(caso) === name
    ).length,
  }));

  return (
    <div className="chart-card">
      <h3>
        Distribucion de generacion Orden de servicio
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
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
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