import { useEffect, useRef, useState } from "react";
import "../App.css";

import { parseExcel } from "../utils/parseExcel";

import Header from "../components/manager/Header";
import KPICards from "../components/manager/KPICards";
import Filters from "../components/manager/Filters";
import BrandChart from "../components/manager/BrandChart";
import StatusChart from "../components/manager/StatusChart";
import ProductChart from "../components/manager/ProductChart";
import DateChart from "../components/manager/DateChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Dashboard() {

    const [data, setData] =
    useState([]);

  const [filteredData,
    setFilteredData,
  ] = useState([]);

  const [filters, setFilters] = useState({
    estado: "Todos",
    marca: "Todas",
    sede: "Todas",
    mes: "Todos",
  });


  const dashboardRef =
    useRef();
  const kpiRef = useRef();
  const filtersRef = useRef();
  const chartsRef = useRef();
  const productRef = useRef();
  const dateRef = useRef();

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


    if (filters.mes !== "Todos") {
      filtered = filtered.filter((item) => {
        let fecha = item.FECHA;

        if (!fecha) return false;

        let date;

        if (!isNaN(fecha)) {
          date = new Date((fecha - 25569) * 86400 * 1000);
        } else {
          date = new Date(fecha);
        }

        return (
          date.toLocaleString("es-CO", {
            month: "long",
          }).toLowerCase() ===
          filters.mes.toLowerCase()
        );
      });
    }

  
    setFilteredData(
      filtered
    );

  }, [filters, data]);


  


const exportPDF = async () => {
  const actions = document.querySelector(".header-actions");

  if (actions) {
    actions.style.display = "none";
  }

  const pdf = new jsPDF("p", "mm", "letter");

  pdf.setFontSize(20);
  pdf.text("Contact Center", 15, 15);

  pdf.setFontSize(10);
  pdf.text("Análisis de órdenes de servicio", 15, 22);

  const fecha = new Date().toLocaleDateString("es-CO");
  pdf.text(`Generado en: ${fecha}`, 15, 28);

  const sections = [
    kpiRef.current,
    filtersRef.current,
    chartsRef.current,
    productRef.current,
    dateRef.current,
  ];

  let currentY = 35;

  for (const section of sections) {
    const canvas = await html2canvas(section, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    // Si no cabe completo, nueva página
    if (
      currentY + imgHeight >
      pdfHeight - 10
    ) {
      pdf.addPage();
      currentY = 10;
    }

    pdf.addImage(
      imgData,
      "PNG",
      10,
      currentY,
      imgWidth,
      imgHeight
    );

    currentY += imgHeight + 10;
  }

  if (actions) {
    actions.style.display = "flex";
  }

  const fechaFormateada =
    new Date().toISOString().split("T")[0];

  pdf.save(
    `reporte_contact_center_${fechaFormateada}.pdf`
  );
};

  return (
    <div className="app" >

      <Header
        handleFile={
          handleFile
        }
        exportPDF={
          exportPDF
        }
      />

      <main className="dashboard">

        <div ref={kpiRef}>
          <KPICards data={filteredData} />
        </div>

        <div ref={filtersRef}>
          <Filters
            filters={filters}
            setFilters={setFilters}
            data={data}
          />
        </div>

        <div ref={chartsRef}>
          <div className="top-grid">
            <BrandChart data={filteredData} />
            <StatusChart data={filteredData} />
          </div>
        </div>

        <div ref={productRef}>
          <ProductChart data={filteredData} />
        </div>

        <div ref={dateRef}>
          <DateChart data={filteredData} />
        </div>

      </main>

      <footer className="footer">
        Dashboard Contact Center © 2025
      </footer>
    </div>
  );
}

export default Dashboard;