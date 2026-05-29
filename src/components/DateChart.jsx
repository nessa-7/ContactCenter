import {
  Line,
} from "react-chartjs-2";

export default function DateChart({
  data,
}) {
  const dateCount =
    {};

  data.forEach(
    (item) => {
      const fecha =
        item.FECHA ||
        "Sin fecha";

      dateCount[
        fecha
      ] =
        (dateCount[
          fecha
        ] || 0) + 1;
    }
  );

  const sorted =
    Object.entries(
      dateCount
    ).sort();

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
            "Órdenes",

          data:
            sorted.map(
              (
                item
              ) =>
                item[1]
            ),

          borderColor:
            "#16a34a",

          backgroundColor:
            "#16a34a",

          tension:
            0.3,
        },
      ],
    };

  return (
    <div className="chart-card date-chart">
      <h3>
        Órdenes por
        Fecha de
        Ingreso
      </h3>

      <Line
        data={
          chartData
        }
      />
    </div>
  );
}