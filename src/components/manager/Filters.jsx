import { FiFilter } from "react-icons/fi";
import "./Filters.css";

export default function Filters({
  filters,
  setFilters,
  data,
}) {
  const marcas = [
    ...new Set(
      data
        .map(
          (item) =>
            item.MARCA
        )
        .filter(Boolean)
    ),
  ];

  const sedes = [
    ...new Set(
      data
        .map(
          (item) =>
            item.CCOSTO
        )
        .filter(Boolean)
    ),
  ];

  const handleChange =
    (e) => {
      setFilters({
        ...filters,
        [e.target.name]:
          e.target.value,
      });
    };

  const clearFilters =
    () => {
      setFilters({
        estado:
          "Todos",
        marca:
          "Todas",
        sede:
          "Todas",
        mes:
         "Todos",
      });
    };

  return (
    <div className="filters-card">
      <div className="filter-title">
        <FiFilter />
        <h3>Filtros</h3>
      </div>

      <div className="filters-grid">

        <div className="filter-item">
          <label>
            Estado
          </label>

          <select
            name="estado"
            value={
              filters.estado
            }
            onChange={
              handleChange
            }
          >
            <option>
              Todos
            </option>

            <option value="PENDIENTE">
              Pendiente
            </option>

            <option value="CERRADO">
              Cerrado
            </option>
          </select>
        </div>

        <div className="filter-item">
          <label>
            Marca
          </label>

          <select
            name="marca"
            value={
              filters.marca
            }
            onChange={
              handleChange
            }
          >
            <option>
              Todas
            </option>

            {marcas.map(
              (
                marca,
                index
              ) => (
                <option
                  key={
                    index
                  }
                  value={
                    marca
                  }
                >
                  {marca}
                </option>
              )
            )}
          </select>
        </div>

        <div className="filter-item">
          <label>
            Sede
            (CCOSTO)
          </label>

          <select
            name="sede"
            value={
              filters.sede
            }
            onChange={
              handleChange
            }
          >
            <option>
              Todas
            </option>

            {sedes.map(
              (
                sede,
                index
              ) => (
                <option
                  key={
                    index
                  }
                  value={
                    sede
                  }
                >
                  {sede}
                </option>
              )
            )}
          </select>
        </div>

        <div className="filter-item">
          <label>Mes</label>

          <select
            name="mes"
            value={filters.mes}
            onChange={handleChange}
          >
            <option value="Todos">
              Todos los meses
            </option>

            <option value="enero">Enero</option>
            <option value="febrero">Febrero</option>
            <option value="marzo">Marzo</option>
            <option value="abril">Abril</option>
            <option value="mayo">Mayo</option>
            <option value="junio">Junio</option>
            <option value="julio">Julio</option>
            <option value="agosto">Agosto</option>
            <option value="septiembre">Septiembre</option>
            <option value="octubre">Octubre</option>
            <option value="noviembre">Noviembre</option>
            <option value="diciembre">Diciembre</option>
          </select>
        </div>

        <button
          className="clear-btn"
          onClick={
            clearFilters
          }
        >
          Limpiar filtros
        </button>

      </div>
    </div>
  );
}