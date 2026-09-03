import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Tooltip,
  Legend
);

ChartJS.register(ChartDataLabels);

export default function BrandReportChart({ data }) {
  // Extrae de forma segura la base de casos del parser
  const casos = data?.baseCasos || [];
  const brandCount = {};
  const brandCumplidos = {};
  const salesByBrand = {};

  const normalizeKey = (value) => String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const getExistingBrand = (value, brands) => {
    const normalizedBrand = normalizeKey(value);
    return brands.find((brand) => normalizeKey(brand) === normalizedBrand);
  };
  const getValue = (item, keys) => {
    const normalizedKeys = keys.map(normalizeKey);
    const itemKeys = Object.keys(item || {});
    const exactKey = itemKeys.find((itemKey) => normalizedKeys.includes(normalizeKey(itemKey)));
    if (exactKey) return item[exactKey];

    const key = itemKeys.find((itemKey) => {
      const normalizedItemKey = normalizeKey(itemKey);
      return normalizedKeys.some((target) =>
        normalizedItemKey === target || normalizedItemKey.includes(target)
      );
    });
    return key ? item[key] : "";
  };
  // Contabiliza los casos totales y los cumplidos recorriendo la columna "Marca" o "MARCA"
  casos.forEach((item) => {
    const rawMarca = getValue(item, ["Marca"]);

    // Normaliza el texto para limpiar espacios en blanco
    const marca = rawMarca ? String(rawMarca).trim() : "";

    // FILTRO: Excluye si está vacío, o si explícitamente dice "sin marca"
    if (!marca || marca.toLowerCase() === "sin marca") {
      return; // Salta esta iteración y no lo cuenta
    }

    // Contabiliza casos totales
    const brandKey = getExistingBrand(marca, Object.keys(brandCount)) || marca;
    brandCount[brandKey] = (brandCount[brandKey] || 0) + 1;

    // Contabiliza casos cumplidos (con Fecha fin)
    const fechaFin = getValue(item, ["Fecha fin"]);
    if (fechaFin && String(fechaFin).trim() !== "") {
      brandCumplidos[brandKey] = (brandCumplidos[brandKey] || 0) + 1;
    }
  });

  (data?.ventas || []).forEach((item) => {
    const marca = String(getValue(item, ["Marca", "MARCA"]) || "").trim();
    if (!marca || marca.toLowerCase() === "sin marca") return;
    const brandKey = getExistingBrand(marca, Object.keys(salesByBrand).concat(Object.keys(brandCount))) || marca;
    salesByBrand[brandKey] = (salesByBrand[brandKey] || 0) + 1;
  });

  // Usa todas las marcas del Excel de ventas y las ordena por cantidad de ventas.
  const sortedBrands = Object.keys(salesByBrand)
    .filter((brand) => brandCount[brand])
    .sort((a, b) => salesByBrand[b] - salesByBrand[a]);

  const chartData = {
    labels: sortedBrands,
    datasets: [
      {
        label: "Casos Cumplidos",
        data: sortedBrands.map((brand) => {
          const cumplidos = brandCumplidos[brand];
          return cumplidos && cumplidos > 0 ? cumplidos : null;
        }),
        backgroundColor: "#24a9cb",
        borderRadius: 6,
        stack: "garantias",
      },
      {
        label: "Casos Pendientes",
        data: sortedBrands.map((brand) => Math.max((brandCount[brand] || 0) - (brandCumplidos[brand] || 0), 0)),
        backgroundColor: "#c8b2ca",
        borderRadius: 6,
        stack: "garantias",
      },
      {
        label: "No. Ventas",
        data: sortedBrands.map((brand) => salesByBrand[brand]),
        backgroundColor: "#86d68b",
        borderRadius: 6,
        stack: "ventas",
        order: 1,
      },
      {
        type: "line",
        label: "% de garantías",
        data: sortedBrands.map((brand) => {
          const ventas = salesByBrand[brand] || 0;
          const garantias = brandCount[brand] || 0;
          return ventas ? (garantias / ventas) * 100 : null;
        }),
        borderColor: "#f2a078",
        backgroundColor: "#f2a078",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#d65f28",
        pointRadius: 4,
        tension: 0.25,
        yAxisID: "percentage",
        order: 0,
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
          label: (context) => {
            const suffix = context.dataset.yAxisID === "percentage" ? "%" : " u.";
            return ` ${context.dataset.label}: ${Number(context.raw).toLocaleString("es-CO", { maximumFractionDigits: 2 })}${suffix}`;
          },
        },
      },
      datalabels: {
        color: (context) => {
          if (context.datasetIndex === 1) return "#2563eb";
          if (context.datasetIndex === 2) return "#267a3c";
          if (context.datasetIndex === 3) return "#c65d2c";
          return "#333";
        },
        font: { weight: "600", size: 11 },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 3,
        padding: 3,
        clip: false,
        display: (context) => context.datasetIndex === 2 || context.datasetIndex === 3 || (context.datasetIndex === 1 && brandCount[sortedBrands[context.dataIndex]] > 0),
        formatter: (value, context) => {
          const brand = sortedBrands[context.dataIndex];
          if (context.datasetIndex === 2) return `${salesByBrand[brand]}`;
          if (context.datasetIndex === 1) return `${brandCount[brand] || 0}`;
          if (context.datasetIndex === 3) return `${Number(value).toFixed(1)}%`;
          return "";
        },
        anchor: "end",
        align: "top",
        offset: 4,
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Volumen de Casos",
        },
      },
      percentage: {
        position: "right",
        beginAtZero: true,
        suggestedMax: 100,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "% de garantías" },
        ticks: { callback: (value) => `${value}%` },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="report-header">
        <h3>Distribución de Casos por Marca vs Ventas</h3>
      </div>

      <div className="chart-container" style={{ height: "380px", position: "relative" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
