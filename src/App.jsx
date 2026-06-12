import { useState } from "react";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Reportes from "./pages/Reportes";
import Sidebar from "./components/Sidebar";

function App() {
  const [page, setPage] =
    useState("dashboard");

  return (
    <div className="layout">

      <Sidebar
        page={page}
        setPage={setPage}
      />

      <div className="app">

        {page === "dashboard" && (
          <Dashboard />
        )}

        {page === "reportes" && (
          <Reportes />
        )}

      </div>

    </div>
  );
}

export default App;