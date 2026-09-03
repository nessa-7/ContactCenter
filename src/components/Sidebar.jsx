import "./Sidebar.css";

import logo from "../assets/servicioalcliente.png";

function Sidebar() {
  return (
    <aside className="sidebar">

      <img src={logo} alt="Logo" className="logo" />

      <button className="active">
        Reportes
      </button>
    </aside>
  );
}

export default Sidebar;