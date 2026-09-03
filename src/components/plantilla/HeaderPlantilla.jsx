import "./Header.css";

import {
  FiUpload,
  FiDownload,
} from "react-icons/fi";

import {
  MdHeadsetMic,
} from "react-icons/md";

export default function Header({ handleFile, handleSalesFile, uploadStatus, exportPDF, showActions = true }) {
  return (
    <header className="header">

      <div className="header-left">
        <div>
          <h1>Control de Casos</h1>
          <p>Análisis de Casos Ingresados por Contact Center</p>
        </div>
      </div>

      {showActions && (
        <div className="header-actions">

          <label className="upload-btn">
            <FiUpload />
            <span>Casos Garantia</span>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              hidden
            />
          </label>

          <label className="upload-btn">
            <FiUpload />
            <span>Ventas</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleSalesFile} hidden />
          </label>

          <div className="upload-status" aria-live="polite">
            {uploadStatus?.loading && <span className="upload-loading">{uploadStatus.loading}</span>}
            {uploadStatus?.casos && <span>{uploadStatus.casos}</span>}
            {uploadStatus?.ventas && <span>{uploadStatus.ventas}</span>}
          </div>

          <button className="pdf-btn" onClick={exportPDF}>
            <FiDownload />
            Descargar PDF
          </button>

        </div>
      )}

    </header>
  );
}