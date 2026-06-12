import "./SummaryTable.css";

function SummaryTable({ data }) {
  const registros =
    data?.baseCasos || [];

  return (
    <div className="summary-table">
      <h3>Casos Registrados</h3>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Responsable</th>
          </tr>
        </thead>

        <tbody>
          {registros
            .slice(0, 10)
            .map((item, index) => (
              <tr key={index}>
                <td>
                  {item[
                    "Nombre cliente"
                  ]}
                </td>

                <td>
                  {item["Teléfono"]}
                </td>

                <td>
                  {item["Responsable"]}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummaryTable;