import { Bar } from "react-chartjs-2";

export default function PendingCasesChart({ data }) {
  const casos = data?.baseCasos || [];
  const counts = {};

  casos.forEach((item) => {
    const marca = String(item.Marca || item.MARCA || "").trim();
    if (!marca || marca.toLowerCase() === "sin marca") return;

    const pendiente = !item["Fecha fin"];
    if (pendiente) counts[marca] = (counts[marca] || 0) + 1;
  });

  const labels = Object.keys(counts);

  return (
    <div className="chart-card">
      <h3>Casos pendientes por marca</h3>
      <div className="chart-container" style={{ height: "380px", position: "relative" }}>
        <Bar
          data={{
            labels,
            datasets: [{
              label: "Casos pendientes",
              data: labels.map((marca) => counts[marca]),
              backgroundColor: "#c8b2ca",
              borderRadius: 6,
            }],
          }}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
}