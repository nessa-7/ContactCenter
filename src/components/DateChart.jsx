import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function DateChart({ data }) {
  const dateCount = {};

  const excelDateToJSDate = (excelDate) => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  };

  data.forEach((item) => {
    let fecha = item.FECHA;

    if (!fecha) return;

    let date;

    if (!isNaN(fecha)) {
      date = excelDateToJSDate(Number(fecha));
    } else {
      date = new Date(fecha);
    }

    if (isNaN(date.getTime())) return;

    const fechaKey = date.toISOString().split("T")[0];

    dateCount[fechaKey] = (dateCount[fechaKey] || 0) + 1;
  });

  const sorted = Object.entries(dateCount).sort(
    (a, b) => new Date(a[0]) - new Date(b[0])
  );

  const chartData = {
    labels: sorted.map(([fecha]) => {
      const d = new Date(fecha);

      return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Cantidad de Órdenes",
        data: sorted.map(([, cantidad]) => cantidad),
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  return (
    <div
      className="chart-card date-chart"
      style={{ height: "350px", width: "100%" }}
    >
      <h3>Órdenes por Fecha de Ingreso</h3>

      <div className="chart-container">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: true,
            },

            tooltip: {
              callbacks: {
                title: (context) =>
                  `Fecha: ${context[0].label}`,
                label: (context) =>
                  `Cantidad: ${context.raw} órdenes`,
              },
            },

            datalabels: {
              display: false,
            },
          },

          scales: {
            x: {
              ticks: {
                maxTicksLimit: 15,
              },
            },

            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        }}
      />
      </div>
    </div>
  );
}