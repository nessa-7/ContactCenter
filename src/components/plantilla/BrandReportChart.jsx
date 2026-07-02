import { Bar } from "react-chartjs-2";
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

export default function BrandReportChart({ data }) {
  // Extrae de forma segura la base de casos del parser
  const casos = data?.baseCasos || [];
  const brandCount = {};
  const brandCumplidos = {};

  // Contabiliza los casos totales y los cumplidos recorriendo la columna "Marca" o "MARCA"
  casos.forEach((item) => {
    const rawMarca = item.Marca || item.MARCA;

    // Normaliza el texto para limpiar espacios en blanco
    const marca = rawMarca ? String(rawMarca).trim() : "";

    // FILTRO: Excluye si está vacío, o si explícitamente dice "sin marca"
    if (!marca || marca.toLowerCase() === "sin marca") {
      return; // Salta esta iteración y no lo cuenta
    }

    // Contabiliza casos totales
    brandCount[marca] = (brandCount[marca] || 0) + 1;

    // Contabiliza casos cumplidos (con Fecha fin)
    const fechaFin = item["Fecha fin"] || item["FECHA FIN"];
    if (fechaFin && String(fechaFin).trim() !== "") {
      brandCumplidos[marca] = (brandCumplidos[marca] || 0) + 1;
    }
  });

  // Ordena de mayor a menor volumen de casos y toma las 15 principales
  const sortedBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const chartData = {
    labels: sortedBrands.map((item) => item[0]),
    datasets: [
      {
        label: "Casos Cumplidos",
        data: sortedBrands.map((item) => {
          const cumplidos = brandCumplidos[item[0]];
          return cumplidos && cumplidos > 0 ? cumplidos : null;
        }),
        backgroundColor: "#24a9cb",
        borderRadius: 6,
      },
      {
        label: "Casos Pendientes",
        data: sortedBrands.map((item) => item[1] - (brandCumplidos[item[0]] || 0)),
        backgroundColor: "#c8b2ca",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: { size: 12, family: "sans-serif" }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw} u.`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Volumen de Casos",
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="report-header">
        <h3>Distribución de Casos por Marca</h3>
      </div>

      <div className="chart-container" style={{ height: "380px", position: "relative" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
