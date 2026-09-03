import "./App.css";

import Reportes from "./pages/Reportes";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="app">
        <Reportes />
      </div>
    </div>
  );
}

export default App;