import "./Sidebar.css";

import logo from "../assets/servicioalcliente.png";

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">

      <img src={logo} alt="Logo" className="logo" />

      {/* <button
        className={page === "dashboard" ? "active" : ""}
        onClick={() => setPage("dashboard")}
      >
        Dashboard
      </button> */}

      <button
        className={page === "reportes" ? "active" : ""}
        onClick={() => setPage("reportes")}
      >
        Reportes
      </button>
    </aside>
  );
}

export default Sidebar;