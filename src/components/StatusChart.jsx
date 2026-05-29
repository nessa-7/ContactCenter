import {
  Doughnut,
} from "react-chartjs-2";

export default function StatusChart({
  data,
}) {
  const pendientes =
    data.filter(
      (item) =>
        String(
          item.ESTADONOMB
        )
          .toUpperCase()
          .trim() ===
        "PENDIENTE"
    ).length;

  const cerradas =
    data.filter(
      (item) =>
        String(
          item.ESTADONOMB
        )
          .toUpperCase()
          .trim() ===
        "CERRADO"
    ).length;

  const chartData =
    {
      labels: [
        "Pendientes",
        "Cerradas",
      ],

      datasets: [
        {
          data: [
            pendientes,
            cerradas,
          ],

          backgroundColor:
            [
              "#2563eb",
              "#f59e0b",
            ],

          borderWidth:
            0,
        },
      ],
    };

  return (
    <div className="chart-card">
      <h3>
        Estado de
        Órdenes
      </h3>

      <Doughnut
        data={
          chartData
        }
      />
    </div>
  );
}