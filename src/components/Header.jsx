import {
  FiUpload,
  FiDownload,
} from "react-icons/fi";

import {
  MdHeadsetMic,
} from "react-icons/md";

export default function Header({
  handleFile,
  exportPDF,
}) {
  return (
    <header className="header">

      <div className="header-left">

        <div>
          <h1>
            Dashboard
            Contact
            Center
          </h1>

          <p>
            Análisis de órdenes
            de servicio
          </p>
        </div>
      </div>

      <div className="header-actions">

        <label className="upload-btn">

          <FiUpload />

          <span>
            Seleccionar
            archivo
          </span>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={
              handleFile
            }
            hidden
          />
        </label>

        <button
          className="pdf-btn"
          onClick={
            exportPDF
          }
        >
          <FiDownload />
          Descargar PDF
        </button>
      </div>
    </header>
  );
}