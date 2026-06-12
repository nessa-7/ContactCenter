import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./Charts.css";

function CampaignChart({ data }) {
  const grouped = {};

const validCampaigns = data.campañas.filter(
  ({ fecha }) => fecha && fecha.trim() !== ""
);

validCampaigns.forEach(({ fecha, tipo }) => {
  if (!grouped[fecha]) {
    grouped[fecha] = {
      fecha,
      seguimiento: 0,
      retomar: 0,
      segundo: 0,
      tercero: 0,
      cuarto: 0,
      quinto: 0,
    };
  }

    if (
      tipo ===
      "Retomar Garantia"
    )
      grouped[
        fecha
      ].retomar++;


    if (
      tipo ===
      "Seguimiento de garantia"
    )
      grouped[
        fecha
      ].seguimiento++;

    
    if (
      tipo ===
      "Segundo seguimiento"
    )
      grouped[
        fecha
      ].segundo++;

    if (
      tipo ===
      "Tercer seguimiento"
    )
      grouped[
        fecha
      ].tercero++;

    if (
      tipo ===
      "Cuarto seguimiento"
    )
      grouped[
        fecha
      ].cuarto++;

    if (
      tipo ===
      "Quinto seguimiento"
    )
      grouped[
        fecha
      ].quinto++;
  }
);

const chartData =
  Object.values(grouped);

  return (
    <div className="chart-card">
      <h3>Tipos de Campaña</h3>

      <ResponsiveContainer
  width="100%"
  height={400}
>
  <BarChart data={chartData}>
    <XAxis dataKey="fecha" />
    <YAxis />
    <Tooltip />
    <Legend />

    <Bar
      dataKey="retomar"
      fill="#c8c8c8"
      name="Retomar"
    />

    <Bar
      dataKey="seguimiento"
      fill="#c672fa"
      name="1° Seguimiento"
    />

    <Bar
      dataKey="segundo"
      fill="#22c55e"
      name="2° Seguimiento"
    />

    <Bar
      dataKey="tercero"
      fill="#e9f410"
      name="3° Seguimiento"
    />

    <Bar
      dataKey="cuarto"
      fill="#ff98ee"
      name="4° Seguimiento"
    />

    <Bar
      dataKey="quinto"
      fill="#f59e0b"
      name="5° Seguimiento"
    />
  </BarChart>
</ResponsiveContainer>
    </div>
  );
}

export default CampaignChart;