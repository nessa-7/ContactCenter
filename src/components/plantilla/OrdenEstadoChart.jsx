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

function OrdenEstadoChart({ data }) {
  if (!data?.baseCasos) return null;

  const normalizeValue = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const getField = (caso, fieldName) => {
    const key = Object.keys(caso).find(
      (itemKey) => normalizeValue(itemKey) === normalizeValue(fieldName)
    );

    return key ? caso[key] : "";
  };

  const getCategoria = (caso) => {
    const generadaPor = normalizeValue(getField(caso, "Generada por"));

    if (generadaPor === "cliente" || generadaPor === "cliente no la comparte") {
      return "Autogestión del cliente";
    }

    const labels = {
      contact: "Apoyo del contact",
      asesor: "personal de punto",
      "auxiliar sc punto": "personal de punto",
      "ya no requiere el servicio": "Ya no requiere el servicio",
    };

    return labels[generadaPor] || null;
  };

  const categories = [
    { name: "Autogestión del cliente", color: "#89d2ff" },
    { name: "Apoyo del contact", color: "#83e144" },
    { name: "Personal de punto", color: "#ffb875" },
  ];

  const darkenColor = (hex, amount = 0.3) => {
    const value = parseInt(hex.slice(1), 16);
    const channels = [value >> 16, (value >> 8) & 255, value & 255]
      .map((channel) => Math.round(channel * (1 - amount)));

    return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  };

  const chartData = categories.map(({ name, color }) => {
    const casos = data.baseCasos.filter((caso) => getCategoria(caso) === name);
    const cerrados = casos.filter((caso) => String(getField(caso, "Fecha fin") || "").trim()).length;

    return {
      tipo: name,
      cerrados,
      pendientes: casos.length - cerrados,
      color,
      closedColor: darkenColor(color),
    };
  });

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const values = payload[0].payload;

    return (
      <div style={{ background: "#fff", border: "1px solid #d1d5db", padding: "8px 10px", color: "#111827" }}>
        <div style={{ marginBottom: 6 }}>{label}</div>
        <div>Pendientes : {values.pendientes}</div>
        <div>Cerrados : {values.cerrados}</div>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <h3>Estado de órdenes </h3>

      <ResponsiveContainer width="100%" height={430}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          barCategoryGap={20}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="tipo" type="category" width={205} />
          <Tooltip content={renderTooltip} />
          <Legend
            content={() => (
              <div style={{ display: "flex", justifyContent: "center", gap: 18, paddingTop: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, backgroundColor: "#93d5e0", display: "inline-block" }} />
                  Pendientes
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, backgroundColor: "#4f8ca0", display: "inline-block" }} />
                  Cerrados
                </span>
              </div>
            )}
          />
          <Bar dataKey="pendientes" name="Pendientes" radius={[0, 18, 18, 0]} barSize={18}>
            {chartData.map((entry) => (
              <Cell key={`pending-${entry.tipo}`} fill={entry.color} />
            ))}
            <LabelList dataKey="pendientes" position="right" />
          </Bar>
          <Bar dataKey="cerrados" name="Cerrados" radius={[0, 18, 18, 0]} barSize={18}>
            {chartData.map((entry) => (
              <Cell key={`closed-${entry.tipo}`} fill={entry.closedColor} />
            ))}
            <LabelList dataKey="cerrados" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OrdenEstadoChart;