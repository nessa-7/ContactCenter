import { useState } from "react";
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
  const [selectedMonth, setSelectedMonth] = useState("Todos");

  const casos = data?.baseCasos || [];
  const ventas = data?.ventas || [];
  const brandCount = {};
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

  const parseDate = (value) => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value || "").trim())) {
      const serial = Number(value);
      if (!serial) return null;
      const utcDate = new Date((serial - 25569) * 86400 * 1000);
      const date = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
      );
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const text = String(value || "").trim();
    const dateOnlyMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getVentaDate = (item) => {
    const dateKey = Object.keys(item || {}).find((key) => /fecha|date/i.test(key));
    return dateKey ? parseDate(item[dateKey]) : null;
  };

  const getMonthKey = (date) =>
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "";

  const formatDate = (date) =>
    date?.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) || "Sin fecha";

  const getFirstAndLastDate = (items, getDate) => {
    const validDates = items.map(getDate).filter(Boolean);
    if (!validDates.length) return { first: null, last: null };

    return {
      first: new Date(Math.min(...validDates.map((date) => date.getTime()))),
      last: new Date(Math.max(...validDates.map((date) => date.getTime()))),
    };
  };

  const monthOptions = [...new Set([
    ...casos.map((item) => getMonthKey(parseDate(getValue(item, ["Fecha ingreso"])))).filter(Boolean),
    ...ventas.map((item) => getMonthKey(getVentaDate(item))).filter(Boolean),
  ])].sort();

  const filteredCasos = casos.filter((item) => {
    const date = parseDate(getValue(item, ["Fecha ingreso"]));
    return selectedMonth === "Todos" || getMonthKey(date) === selectedMonth;
  });
  const filteredVentas = ventas.filter((item) => {
    const date = getVentaDate(item);
    return selectedMonth === "Todos" || getMonthKey(date) === selectedMonth;
  });

  filteredCasos.forEach((item) => {
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

  });

  filteredVentas.forEach((item) => {
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
        label: "Total de garantías",
        data: sortedBrands.map((brand) => brandCount[brand]),
        backgroundColor: "#2563eb",
        borderRadius: 6,
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
          if (context.datasetIndex === 0) return "#2563eb";
          if (context.datasetIndex === 1) return "#267a3c";
          if (context.datasetIndex === 2) return "#c65d2c";
          return "#333";
        },
        font: (context) => ({
          weight: "600",
          size: context.datasetIndex === 2 ? 9 : 11,
        }),
        backgroundColor: (context) =>
          context.datasetIndex === 0 ? "transparent" : "rgba(255, 255, 255, 0.9)",
        borderRadius: 3,
        padding: 3,
        clip: false,
          display: (context) => context.datasetIndex === 0 || context.datasetIndex === 1 || context.datasetIndex === 2,
        formatter: (value, context) => {
          const brand = sortedBrands[context.dataIndex];
          if (context.datasetIndex === 0) return `${brandCount[brand] || 0}`;
          if (context.datasetIndex === 1) return `${salesByBrand[brand]}`;
          if (context.datasetIndex === 2) return `${Number(value).toFixed(1)}%`;
          return "";
        },
        anchor: (context) => context.datasetIndex === 2 ? "center" : "end",
        align: "top",
        offset: (context) => {
          if (context.datasetIndex === 2) return 8;
          return 4;
        },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
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

  const casesRange = getFirstAndLastDate(filteredCasos, (item) =>
    parseDate(getValue(item, ["Fecha ingreso"]))
  );
  const salesRange = getFirstAndLastDate(filteredVentas, getVentaDate);
  const periodText = `Casos: ${formatDate(casesRange.first)} - ${formatDate(casesRange.last)} | Ventas: ${formatDate(salesRange.first)} - ${formatDate(salesRange.last)}`;

  return (
    <div className="chart-card">
      <div className="report-header">
        <h3>Distribución de Casos por Marca vs Ventas</h3>
        <span className="chart-period">{periodText}</span>
        <select
          className="month-filter"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          aria-label="Filtrar por mes"
        >
          <option value="Todos">Todos los meses</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month.slice(5, 7)}/{month.slice(0, 4)}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-container" style={{ height: "380px", position: "relative" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
