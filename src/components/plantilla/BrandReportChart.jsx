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

  // Contabiliza los casos recorriendo la columna "Marca" o "MARCA"
  casos.forEach((item) => {
    const rawMarca = item.Marca || item.MARCA;
    
    // Normaliza el texto para limpiar espacios en blanco
    const marca = rawMarca ? String(rawMarca).trim() : "";

    // FILTRO: Excluye si está vacío, o si explícitamente dice "sin marca"
    if (!marca || marca.toLowerCase() === "sin marca") {
      return; // Salta esta iteración y no lo cuenta
    }

    brandCount[marca] = (brandCount[marca] || 0) + 1;
  });

  // Ordena de mayor a menor volumen de casos y toma las 15 principales
  const sortedBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const chartData = {
    labels: sortedBrands.map((item) => item[0]),
    datasets: [
      {
        label: "Cantidad de Casos",
        data: sortedBrands.map((item) => item[1]),
        backgroundColor: "#c1a3c3", 
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
      y: {
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
