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

  const opciones = [
    { key: "autogestion", name: "autogestión del cliente", color: "#65bdf4" },
    { key: "contact", name: "apoyo del contact", color: "#75d932" },
    { key: "asesor", name: "apoyo de asesor", color: "#f3a154" },
    { key: "auxiliar sc punto", name: "apoyo auxiliar servicio al cliente", color: "#e3da2d" },
    { key: "ya no requiere el servicio", name: "ya no requiere el servicio", color: "#94989e" },
  ];

  const getCategoria = (caso) => {
    const generadaPor = getGeneradaPor(caso);

    if (generadaPor === "cliente" || generadaPor === "cliente no la comparte") {
      return "autogestion";
    }

    return generadaPor;
  };

  const chartData = opciones.map(({ key, name, color }) => ({
    name,
    color,
    value: data.baseCasos.filter((caso) => getCategoria(caso) === key).length,
  }));

  return (
    <div className="chart-card">
      <h3>
        Distribución de generación de orden de servicio
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