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
  const excelDateToJSDate = (excelDate) => {
    return new Date((excelDate - 25569) * 86400 * 1000);
  };

  // Días del mes (1 al 31)
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);

  // Matriz para almacenar los datos por mes y día
  const mesesData = Array.from({ length: 12 }, () =>
    Array(31).fill(0)
  );

  // Procesar datos
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

    const mes = date.getMonth();
    const dia = date.getDate();

    mesesData[mes][dia - 1]++;
  });

  const colores = {
    0: "#3b82f6", // Enero
    1: "#ef4444", // Febrero
    2: "#22c55e", // Marzo
    3: "#f59e0b", // Abril
    4: "#8b5cf6", // Mayo
    5: "#06b6d4", // Junio
    6: "#ec4899", // Julio
    7: "#84cc16", // Agosto
    8: "#f97316", // Septiembre
    9: "#6366f1", // Octubre
    10: "#14b8a6", // Noviembre
    11: "#dc2626", // Diciembre
  };

  const datasets = [];

  for (let mes = 0; mes < 12; mes++) {
    if (mesesData[mes].some((x) => x > 0)) {
      datasets.push({
        label: new Date(2025, mes).toLocaleString("es-CO", {
          month: "long",
        }),
        data: mesesData[mes],
        borderColor: colores[mes],
        backgroundColor: colores[mes],
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 3,
      });
    }
  }

  const chartData = {
    labels: dias,
    datasets,
  };

  return (
    <div
      className="chart-card date-chart"
      style={{ height: "350px", width: "100%" }}
    >
      <h3>Órdenes por Día del Mes</h3>

      <div className="chart-container">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                display: true,
                position: "bottom",
              },

              tooltip: {
                callbacks: {
                  title: (context) =>
                    `Día ${context[0].label}`,

                  label: (context) =>
                    `${context.dataset.label}: ${context.raw} órdenes`,
                },
              },

              datalabels: {
                display: false,
              },
            },

            elements: {
              point: {
                radius: 0,
                hoverRadius: 5,
              },
            },

            scales: {
              x: {
                title: {
                  display: true,
                  text: "Día del Mes",
                },
                ticks: {
                  stepSize: 1,
                },
              },

              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Cantidad de Órdenes",
                },
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