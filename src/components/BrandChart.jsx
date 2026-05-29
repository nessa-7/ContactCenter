import {
  Bar,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function BrandChart({
  data,
}) {
  const brandCount =
    {};

  data.forEach(
    (item) => {
      const marca =
        item.MARCA ||
        "Sin marca";

      brandCount[
        marca
      ] =
        (brandCount[
          marca
        ] || 0) + 1;
    }
  );

  const sorted =
    Object.entries(
      brandCount
    )
      .sort(
        (
          a,
          b
        ) =>
          b[1] -
          a[1]
      )
      .slice(0, 15);

  const chartData =
    {
      labels:
        sorted.map(
          (
            item
          ) =>
            item[0]
        ),

      datasets: [
        {
          label:
            "Casos",

          data:
            sorted.map(
              (
                item
              ) =>
                item[1]
            ),

          backgroundColor:
            "#2563eb",

          borderRadius:
            8,
        },
      ],
    };

  return (
    <div className="chart-card">
      <h3>
        Casos por
        Marca
      </h3>

      <Bar
        data={
          chartData
        }
        options={{
          responsive:
            true,

          plugins: {
            legend: {
              position:
                "top",
            },
          },
        }}
      />
    </div>
  );
}