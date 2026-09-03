import { useEffect, useRef, useState } from "react";
import { parseContactCenter } from "../utils/parseContactCenter";
import { parseVentas } from "../utils/parseVentas";
import "../App.css";

import ContactKPICards from "../components/plantilla/ContactKPICards";
import CampaignChart from "../components/plantilla/CampaignChart";
import ResponseChart from "../components/plantilla/ResponseChart";
import NovedadesChart from "../components/plantilla/NovedadesChart";
import EnvioChart from "../components/plantilla/EnvioChart";
import SummaryTable from "../components/plantilla/SummaryTable";
import Header from "../components/plantilla/HeaderPlantilla";
import RespuestaClienteChart from "../components/plantilla/RespuestaClienteChart";
import CasosPorDiasChart from "../components/plantilla/CasosPorDiasChart";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "../components/plantilla/Charts.css";
import "../components/plantilla/Filters.css";
import BrandReportChart from "../components/plantilla/BrandReportChart";
import ProductDonutChart from "../components/plantilla/ProductDonutChart";
import OrdenMarcaChart from "../components/plantilla/OrdenMarcaChart";
import SurveyChart from "../components/plantilla/SurveyChart";

const COSTO_OPTIONS = [
  { value: "10101", label: "10101 - Popayán" },
  { value: "10201", label: "10201 - Bordo" },
  { value: "10301", label: "10301 - Santander" },
  { value: "10401", label: "10401 - Ambienta" },
  { value: "20101", label: "20101 - Valle" },
  { value: "30101", label: "30101 - Pasto" },
  { value: "70101", label: "70101 - Pitalito" },
];

function Reportes() {
  const initialFilters = {
    costo: "Todos",
    marca: "Todos",
    producto: "Todos",
  };

  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [filteredBaseCasos, setFilteredBaseCasos] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ casos: "", ventas: "", loading: "" });

  const reportRef = useRef();

  const normalizeKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const getCaseValue = (item, targetKeys) => {
    const normalizedTargets = new Set(
      targetKeys.map((key) => normalizeKey(key))
    );

    for (const key of Object.keys(item || {})) {
      if (normalizedTargets.has(normalizeKey(key))) {
        const value = item[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return String(value).trim();
        }
      }
    }

    return "";
  };

  const getUniqueOptions = (items, keys) => {
    const values = new Map();

    (items || []).forEach((item) => {
      const value = getCaseValue(item, keys);
      const normalizedValue = normalizeKey(value);
      if (value && !values.has(normalizedValue)) {
        values.set(normalizedValue, value);
      }
    });

    return [...values.values()].sort((a, b) =>
      String(a).localeCompare(String(b), "es", { sensitivity: "base" })
    );
  };

  useEffect(() => {
    if (!data?.baseCasos) {
      setFilteredBaseCasos(null);
      return;
    }

    const filtered = data.baseCasos.filter((item) => {
      const valorCosto = getCaseValue(item, ["CCOSTO", "Costo", "COSTO"]);
      const valorMarca = getCaseValue(item, ["MARCA", "Marca", "marca"]);
      const valorProducto = getCaseValue(item, ["Producto", "PRODUCTO", "producto", "Producto/Servicio", "Tipo de producto"]);

      if (
        filters.costo !== "Todos" &&
        String(valorCosto).toUpperCase() !== String(filters.costo).toUpperCase()
      ) {
        return false;
      }

      if (
        filters.marca !== "Todos" &&
        String(valorMarca).toUpperCase() !== String(filters.marca).toUpperCase()
      ) {
        return false;
      }

      if (
        filters.producto !== "Todos" &&
        String(valorProducto).toUpperCase() !== String(filters.producto).toUpperCase()
      ) {
        return false;
      }

      return true;
    });

    setFilteredBaseCasos(filtered);
  }, [data, filters]);

  const reportData = data
    ? {
        ...data,
        baseCasos: filteredBaseCasos ?? data.baseCasos,
        ventas: (data.ventas || []).filter((item) => {
          const valorCodigoCosto = getCaseValue(item, ["CODIGOCCO", "CODIGO CCO"]);
          const valorSede = getCaseValue(item, ["SEDE"]);
          const valorMarca = getCaseValue(item, ["MARCA"]);
          const valorProducto = getCaseValue(item, ["NOMBREPRO"]);
          const costoSeleccionado = COSTO_OPTIONS.find((option) => option.value === filters.costo);
          const normalizeCode = (value) => normalizeKey(value).replace(/0+$/, "");
          const productoSeleccionado = normalizeKey(filters.producto);
          const productoVenta = normalizeKey(valorProducto);
          const productoCoincide = filters.producto === "Todos" ||
            productoVenta.includes(productoSeleccionado) ||
            productoSeleccionado.includes(productoVenta);
          const costoCoincide = filters.costo === "Todos" || (
            normalizeCode(valorCodigoCosto) === normalizeCode(filters.costo) ||
            normalizeKey(valorSede) === normalizeKey(costoSeleccionado?.label.split(" - ")[1])
          );

          return (
            costoCoincide &&
            (filters.marca === "Todos" || normalizeKey(valorMarca) === normalizeKey(filters.marca)) &&
            productoCoincide
          );
        }),
      }
    : null;

  const marcaOptions = getUniqueOptions(data?.baseCasos || [], ["MARCA", "Marca", "marca"]);
  const productoOptions = getUniqueOptions(data?.baseCasos || [], ["Producto", "PRODUCTO", "producto", "Producto/Servicio", "Tipo de producto"]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);

    let clonedHeader = null;
let actions = null;

    try {
      // clonar el header principal y quitarle las acciones (botones)
      const originalHeader = document.querySelector(".header");

      if (originalHeader && reportRef.current) {
        clonedHeader = originalHeader.cloneNode(true);
        const clonedActions = clonedHeader.querySelector(".header-actions");
        if (clonedActions) clonedActions.remove();

        // ajustar estilo del header clonado para PDF: alineado a la izquierda y más grande
        clonedHeader.style.marginLeft = "0";
        clonedHeader.style.width = "100%";
        clonedHeader.style.justifyContent = "flex-start";
        clonedHeader.style.padding = "40px 30px";

        const headerLeft = clonedHeader.querySelector(".header-left");
        if (headerLeft) {
          headerLeft.style.alignItems = "flex-start";
        }

        const h1 = clonedHeader.querySelector("h1");
        if (h1) {
          h1.style.fontSize = "50px";
          h1.style.fontWeight = "700";
          h1.style.margin = "0";
        }

        const p = clonedHeader.querySelector("p");
        if (p) {
          p.style.fontSize = "20px";
          p.style.margin = "4px 0 0 0";
        }

        // 🔥 NUEVO: Obtener fecha y hora local formateada
        const ahora = new Date();

        // Obtener fecha del primer y último caso
        let rangoCasos = "";

        if (data?.baseCasos?.length) {
          const fechas = data.baseCasos
            .map((x) => x["Fecha ingreso"])
            .filter((f) => f !== undefined && f !== null && f !== "" && f !== "0" && f !== 0);

          const excelDateToJSDate = (excelDate) => {
            const utcDate = new Date(
              (excelDate - 25569) * 86400 * 1000
            );
            return new Date(
              utcDate.getTime() +
              utcDate.getTimezoneOffset() * 60000
            );
          };

          const fechasValidas = fechas
            .map((f) => {
              if (f instanceof Date) {
                return Number.isNaN(f.getTime()) ? null : f;
              }

              if (typeof f === "number") {
                return f > 0 ? excelDateToJSDate(f) : null;
              }

              const value = Number(String(f).trim());

              if (
                !Number.isNaN(value) &&
                String(value) === String(f).trim() &&
                value > 0
              ) {
                return excelDateToJSDate(value);
              }

              const fechaDate = new Date(f);
              return Number.isNaN(fechaDate.getTime())
                ? null
                : fechaDate;
            })
            .filter(Boolean);

          if (fechasValidas.length) {
            const primeraFecha = new Date(
              Math.min(...fechasValidas.map((f) => f.getTime()))
            );

            const ultimaFecha = new Date(
              Math.max(...fechasValidas.map((f) => f.getTime()))
            );

            const formato = {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            };

            rangoCasos = `Casos Ingresados en el rango de fechas: ${primeraFecha.toLocaleDateString(
              "es-ES",
              formato
            )} - ${ultimaFecha.toLocaleDateString(
              "es-ES",
              formato
            )}`;
          }
        }

        const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        const fechaFormateada = ahora.toLocaleDateString('es-ES', opcionesFecha);
        const horaFormateada = ahora.toLocaleTimeString('es-ES', opcionesHora);

        const metaPeriodo = document.createElement("span");
        metaPeriodo.innerText = rangoCasos;

        metaPeriodo.style.fontSize = "15px";
        metaPeriodo.style.color = "#565a61";
        metaPeriodo.style.marginTop = "5px";
        metaPeriodo.style.fontWeight = "400";

        // 🔥 NUEVO: Crear el elemento contenedor para la metadata de descarga
        const metaDescarga = document.createElement("span");
        metaDescarga.innerText = `Reporte generado el: ${fechaFormateada} a las ${horaFormateada}`;

        // 🔥 NUEVO: Estilos estéticos para el texto de la fecha
        metaDescarga.style.fontSize = "13px";
        metaDescarga.style.color = "#6b7280"; // Gris elegante (Tailwind gray-500)
        metaDescarga.style.marginTop = "3px";
        metaDescarga.style.fontWeight = "400";
        metaDescarga.style.display = "flex";
        headerLeft.style.flexDirection = "column";


        // 🔥 NUEVO: Insertarlo justo dentro de la sección izquierda del encabezado clonado
        if (headerLeft) {
          if (rangoCasos) {
            headerLeft.appendChild(metaPeriodo);
          }
          headerLeft.appendChild(metaDescarga);

        }

        // insertar el header clonado al inicio del area a capturar
        const firstPage =
          reportRef.current.querySelector(".pdf-page-1");

        if (firstPage) {
          firstPage.insertAdjacentElement(
            "afterbegin",
            clonedHeader
          );
        }
      }

      // SOLO dentro del reporte (no global)
       actions = reportRef.current.querySelector(".header-actions");

      if (actions) {
        actions.style.display = "none";
      }

      const pageElements = Array.from(
        reportRef.current.querySelectorAll(".pdf-page")
      );

      const pdf = new jsPDF("p", "mm", "letter");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 3;
      const imgWidth = pdfWidth - margin * 2;

      let pageIndex = 0;

      for (const pageElement of pageElements) {
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);

        heightLeft -= pdfHeight - margin * 2;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight - margin * 3;
        }

        pageIndex += 1;
      }



      // 🔥 NUEVO: Hacer que el nombre del archivo también incluya la hora exacta para evitar duplicados
      const ahoraNombre = new Date();
      const fechaNombre = ahoraNombre.toISOString().split("T")[0];
      const horaNombre = ahoraNombre.toTimeString().split(" ")[0].replace(/:/g, "-");

      pdf.save(`reporte_contact_center_${fechaNombre}_${horaNombre}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      if (actions) {
        actions.style.display = "flex";
      }

      // quitar el header temporal
      if (clonedHeader?.parentNode) {
        clonedHeader.parentNode.removeChild(clonedHeader);
      }
      setIsExporting(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploadStatus((current) => ({ ...current, loading: "Cargando casos..." }));
    try {
      const excelData = await parseContactCenter(file);
      setData((currentData) => ({ ...(currentData || {}), ...excelData }));
      setUploadStatus((current) => ({ ...current, casos: `Casos cargados: ${excelData.baseCasos?.length || 0}`, loading: "" }));
    } catch (error) {
      setUploadStatus((current) => ({ ...current, casos: "Error al cargar casos", loading: "" }));
    }
  };

  const handleSalesFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus((current) => ({ ...current, loading: "Cargando ventas..." }));
    try {
      const ventas = await parseVentas(file);
      setData((currentData) => ({ ...(currentData || {}), ventas }));
      setUploadStatus((current) => ({ ...current, ventas: `Ventas cargadas: ${ventas.length}`, loading: "" }));
    } catch (error) {
      setUploadStatus((current) => ({ ...current, ventas: "Error al cargar ventas", loading: "" }));
    }
  };

  return (
    <div className="app">
      <Header
        handleFile={handleFile}
        handleSalesFile={handleSalesFile}
        uploadStatus={uploadStatus}
        exportPDF={exportPDF}
      />

      {isExporting && (
        <div className="export-overlay">
          <div className="export-box">
            <div className="spinner" />
            <div className="export-text">Generando PDF...</div>
          </div>
        </div>
      )}

      <main
        className="reportes"
        ref={reportRef}
      >
        {data && (
          <>
            <div className="filters-card">
              <div className="filter-title">
                <h3>Filtros del reporte</h3>
              </div>

              <div className="filters-grid">
                <div className="filter-item">
                  <label>Costo</label>
                  <select
                    name="costo"
                    value={filters.costo}
                    onChange={handleFilterChange}
                  >
                    <option value="Todos">Todos</option>
                    {COSTO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label>Marca</label>
                  <select
                    name="marca"
                    value={filters.marca}
                    onChange={handleFilterChange}
                  >
                    <option value="Todos">Todas</option>
                    {marcaOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label>Producto</label>
                  <select
                    name="producto"
                    value={filters.producto}
                    onChange={handleFilterChange}
                  >
                    <option value="Todos">Todos</option>
                    {productoOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="clear-btn"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            <div className="pdf-page pdf-page-1">
              <div className="top-grid">
                <CasosPorDiasChart data={reportData} />
              </div>

              <div className="top-grid">
                <ResponseChart data={reportData} />
              </div>
            </div>

            <div className="pdf-page pdf-page-2">
              <div className="top-grid">
                <BrandReportChart data={reportData} />
              </div>

              <div className="top-grid">
                <OrdenMarcaChart data={reportData} />
                <ProductDonutChart data={reportData} />
              </div>

              <br />
              <br />

              <div className="top-grid">
                
                
                <EnvioChart data={data} />
                <NovedadesChart data={data} />
              </div>
            </div>

            <div className="pdf-page pdf-page-3">
              <div className="top-grid">
                <SurveyChart data={data} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Reportes;