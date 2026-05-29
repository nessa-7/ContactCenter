import { FiFilter } from "react-icons/fi";

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