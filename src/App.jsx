import { useEffect, useRef, useState } from "react";
import "./App.css";
import { parseExcel } from "./utils/parseExcel";

import Header from "./components/Header";
import KPICards from "./components/KPICards";
import Filters from "./components/Filters";
import BrandChart from "./components/BrandChart";
import StatusChart from "./components/StatusChart";
import ProductChart from "./components/ProductChart";
import DateChart from "./components/DateChart";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function App() {
  const [data, setData] =
    useState([]);

  const [filteredData,
    setFilteredData,
  ] = useState([]);

  const [filters,
    setFilters,
  ] = useState({
    estado: "Todos",
    marca: "Todas",
    sede: "Todas",
  });

  const dashboardRef =
    useRef();

  const handleFile =
    async (e) => {
      const file =
        e.target.files[0];

      if (!file) return;

      const json =
        await parseExcel(
          file
        );

      setData(json);
      setFilteredData(
        json
      );
    };

  useEffect(() => {
    let filtered =
      [...data];

    // Estado
    if (
      filters.estado !==
      "Todos"
    ) {
      filtered =
        filtered.filter(
          (item) =>
            String(
              item.ESTADONOMB
            )
              .toUpperCase()
              .trim() ===
            filters.estado
        );
    }

    // Marca
    if (
      filters.marca !==
      "Todas"
    ) {
      filtered =
        filtered.filter(
          (item) =>
            item.MARCA ===
            filters.marca
        );
    }

    // Sede
    if (
      filters.sede !==
      "Todas"
    ) {
      filtered =
        filtered.filter(
          (item) =>
            item.CCOSTO ===
            filters.sede
        );
    }

    setFilteredData(
      filtered
    );
  }, [filters, data]);

    const exportPDF = async () => {
    const input = dashboardRef.current;

    // Captura el contenido con html2canvas
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true, // Evita problemas con imágenes externas si las hay
    });

    const imgData = canvas.toDataURL("image/png");

    // Configuración del PDF en formato A4
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calcular la altura proporcional de la imagen en el PDF
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Primera página
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Generar páginas adicionales si el contenido es más largo que un A4
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // Mueve la posición de renderizado hacia arriba
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Obtener la fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    const fechaFormateada = hoy.toISOString().split('T')[0];

    // Guardar el PDF con la fecha en el nombre
    pdf.save(`reporte_contact_center_${fechaFormateada}.pdf`);
  };

  return (
    <div className="app">

      <Header
        handleFile={
          handleFile
        }
        exportPDF={
          exportPDF
        }
      />

      <main
        className="dashboard"
        ref={dashboardRef}
      >
        <KPICards
          data={
            filteredData
          }
        />

        <Filters
          filters={
            filters
          }
          setFilters={
            setFilters
          }
          data={data}
        />

        <div className="top-grid">
          <BrandChart
            data={
              filteredData
            }
          />

          <StatusChart
            data={
              filteredData
            }
          />
        </div>

        <ProductChart
          data={
            filteredData
          }
        />

        <DateChart
          data={
            filteredData
          }
        />

      </main>

      <footer className="footer">
        Dashboard Contact Center © 2025
      </footer>
    </div>
  );
}

export default App;