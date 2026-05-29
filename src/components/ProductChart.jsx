import { Bar } from "react-chartjs-2";

export default function ProductChart({
  data,
}) {
  const productCount = {};

  const getCategory = (
    producto
  ) => {
    const text =
      String(producto || "")
        .toUpperCase();

    if (
      text.includes(
        "LAVADORA"
      )
    )
      return "Lavadoras";

    if (
      text.includes(
        "NEVERA"
      ) ||
      text.includes(
        "CONGELADOR"
      ) ||
      text.includes(
        "VITRINA"
      )
    )
      return "Refrigeración";

    if (
      text.includes(
        "TELEVISOR"
      ) ||
      text.includes("TV")
    )
      return "Televisores";

    if (
      text.includes(
        "ESTUFA"
      ) ||
      text.includes(
        "COCINA"
      )
    )
      return "Estufas";

    if (
      text.includes(
        "FREIDORA"
      )
    )
      return "Freidoras";

    if (
      text.includes(
        "COLCHON"
      )
    )
      return "Colchones";

    if (
      text.includes(
        "CELULAR"
      )
    )
      return "Celulares";

    if (
      text.includes(
        "CABINA"
      ) ||
      text.includes(
        "PARLANTE"
      )
    )
      return "Audio";

    return "Otros";
  };

  data.forEach(
    (item) => {
      const category =
        getCategory(
          item.PRODUCTO
        );

      productCount[
        category
      ] =
        (productCount[
          category
        ] || 0) + 1;
    }
  );

  const sorted =
    Object.entries(
      productCount
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );

  const chartData = {
    labels:
      sorted.map(
        (item) =>
          item[0]
      ),

    datasets: [
      {
        label:
          "Cantidad",

        data:
          sorted.map(
            (item) =>
              item[1]
          ),

        backgroundColor:
          "#9333ea",

        borderRadius:
          10,
      },
    ],
  };

  return (
    <div className="chart-card product-chart">
      <h3>
        Productos Más
        Reportados
      </h3>

      <Bar
        data={chartData}
        options={{
          indexAxis: "y",

          responsive:
            true,

          maintainAspectRatio:
            false,

          plugins: {
            legend: {
              display:
                false,
            },
          },

          scales: {
            x: {
              beginAtZero:
                true,
            },
          },
        }}
      />
    </div>
  );
}