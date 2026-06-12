import { useState, useRef } from "react";
import { parseContactCenter } from "../utils/parseContactCenter";
import "../App.css";

import ContactKPICards from "../components/plantilla/ContactKPICards";
import CampaignChart from "../components/plantilla/CampaignChart";
import ResponseChart from "../components/plantilla/ResponseChart";
import NovedadesChart from "../components/plantilla/NovedadesChart";
import EnvioChart from "../components/plantilla/EnvioChart";
import SummaryTable from "../components/plantilla/SummaryTable";
import Header from "../components/plantilla/HeaderPlantilla";
import RespuestaClienteChart from "../components/plantilla/RespuestaClienteChart";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "../components/plantilla/Charts.css";

function Reportes() {
  const [data, setData] = useState(null);

  const reportRef = useRef();

 const exportPDF = async () => {
  try {
    if (!reportRef.current) return;

    const actions = document.querySelector(
      ".header-actions"
    );

    if (actions) {
      actions.style.display = "none";
    }

    const canvas = await html2canvas(
      reportRef.current,
      {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      }
    );

    if (actions) {
      actions.style.display = "flex";
    }

    const imgData =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF(
      "p",
      "mm",
      "letter"
    );

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      pdf.internal.pageSize.getHeight();

    // Márgenes reducidos
    const margin = 3;

    const imgWidth =
      pdfWidth - margin * 2;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // Primera página
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -=
      pdfHeight - margin * 2;

    // Páginas adicionales si son necesarias
    while (heightLeft > 0) {
      position =
        heightLeft -
        imgHeight +
        margin;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -=
        pdfHeight -
        margin * 2;
    }

    const fecha = new Date()
      .toISOString()
      .split("T")[0];

    pdf.save(
      `reporte_contact_center_${fecha}.pdf`
    );
  } catch (error) {
    console.error(
      "Error generando PDF:",
      error
    );
  }
};

  const handleFile = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const excelData =
      await parseContactCenter(file);

    setData(excelData);
  };

  return (
    <div className="app">
      <Header
        handleFile={handleFile}
        exportPDF={exportPDF}
      />

      <main
        className="reportes"
        ref={reportRef}
      >
        {data && (
          <>
            <ContactKPICards data={data} />

            <div className="top-grid">
              <ResponseChart data={data} />
            </div>

            <div className="top-grid">
              <CampaignChart data={data} />
            </div>

            

            <div className="top-grid">
              <RespuestaClienteChart
                data={data}
              />
              <EnvioChart data={data} />
            </div>

          </>
        )}
      </main>
    </div>
  );
}

export default Reportes;