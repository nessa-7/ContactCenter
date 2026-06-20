import { Doughnut } from "react-chartjs-2";

export default function ProductDonutChart({ data }) {
  const productCount = {};

  const getCategory = (producto) => {
    const text = String(producto || "").toUpperCase();

    if (text.includes("LAVADORA"))
      return "Lavadoras";

    if (
      text.includes("NEVERA") ||
      text.includes("REFRIGERADOR") ||
      text.includes("CONGELADOR") ||
      text.includes("VITRINA")
    )
      return "Refrigeración";

    if (
      text.includes("TELEVISOR") ||
      text.includes("TV")
    )
      return "Televisores";

    if (
      text.includes("ESTUFA") ||
      text.includes("COCINA")
    )
      return "Estufas";

    if (text.includes("FREIDORA"))
      return "Freidoras";

    if (text.includes("COLCHON"))
      return "Colchones";

    if (text.includes("CELULAR"))
      return "Celulares";

    if (
      text.includes("CABINA") ||
      text.includes("PARLANTE")
    )
      return "Audio";

    return null;
  };

  data.baseCasos.forEach((item) => {
    const category = getCategory(
      item.Producto
    );

    if (!category) return;

    productCount[category] =
      (productCount[category] || 0) + 1;
  });

  const sorted = Object.entries(
    productCount
  ).sort((a, b) => b[1] - a[1]);

  const chartData = {
    labels: sorted.map(
      ([name]) => name
    ),
    datasets: [
      {
        data: sorted.map(
          ([, count]) => count
        ),
        backgroundColor: [
          "#8ef4f2",
          "#89df60",
          "#f199e8",
          "#ffb300",
          "#d38ce0",
          "#faff60",
          "#00BCD4",
          "#795548",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-card relative h-[400px] w-full">
      <h3>
        Distribución de Casos por Tipo de Producto
      </h3>

      <div className="chart-container">
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",
            plugins: {
              legend: {
                position: "right",
              },
            },
          }}
        />
      </div>
    </div>
  );
}