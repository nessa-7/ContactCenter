import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./survey.css";

const COLORS = [
  "#24a9cb",
  "#39d856",
  "#f5ca0b",
  "#fd5a88",
  "#7c3aed",
  "#0891b2",
];

export default function SurveyChart({ data }) {
  console.log("🔍 SurveyChart - datos recibidos:", data);
  
  if (!data) {
    return <div className="chart-card">❌ No hay datos</div>;
  }

  if (!data.encuesta) {
    return <div className="chart-card">❌ No hay encuesta en los datos</div>;
  }

  console.log("🔍 SurveyChart - encuesta:", data.encuesta);
  console.log("🔍 SurveyChart - length:", data.encuesta.length);
  
  if (data.encuesta.length === 0) {
    return <div className="chart-card">❌ No hay datos de encuesta disponibles</div>;
  }

  // Obtener columnas ordenadas
  const columnasKeys = data.encuesta.length > 0 ? Object.keys(data.encuesta[0]) : [];
  
  console.log("✅ Todas las columnas:", columnasKeys);
  
  // Filtrar solo columnas de preguntas (excluyendo Número, Nombre, Fecha de creación, columnas vacías)
  const preguntasColumnas = columnasKeys.filter(
    (col) =>
      col &&
      !/numero/i.test(col) &&
      !/nombre/i.test(col) &&
      !/fecha/i.test(col) &&
      col.trim() !== ""
  );

  console.log("✅ Columnas candidatas a preguntas:", preguntasColumnas);
  console.log("✅ Cantidad de columnas candidatas:", preguntasColumnas.length);

  const usedColumns = new Set();

  const findColumnKey = (patterns) =>
    columnasKeys.find(
      (col) =>
        !usedColumns.has(col) &&
        patterns.some((pattern) => pattern.test(col))
    );

  const getNextUnusedColumn = () =>
    preguntasColumnas.find((col) => !usedColumns.has(col));

  const chooseColumnKey = (patterns, fallbackIndex) => {
    const key = findColumnKey(patterns) || getNextUnusedColumn();
    if (key) usedColumns.add(key);
    return key;
  };

  const pregunta1Key = chooseColumnKey([
    /califica.*atenc/i,
    /atenc.*califica/i,
    /calific.*atenc/i,
  ]);

  const pregunta2Key = chooseColumnKey([
    /fue claro.*proceso/i,
    /claro.*proceso/i,
    /direccion.*marca/i,
    /direccionam.*marca/i,
    /direccion.*garant/i,
    /garant[ií]a.*direccion/i,
  ]);

  const pregunta3Key = chooseColumnKey([
    /seguimiento/i,
    /oportuno/i,
    /realiz.*seguimiento/i,
  ]);

  const pregunta4Key = chooseColumnKey([
    /califica.*soluci/i,
    /soluci[oó]n/i,
    /soluci.*califica/i,
  ]);

  const pregunta5Key = chooseColumnKey([
    /volver[ií]a.*comprar/i,
    /comprar.*nuevamente/i,
    /volver.*comprar/i,
    /volver.*a.*comprar/i,
  ]);

  // Función para contar respuestas
  const contarRespuestas = (columnKey) => {
    const counter = {};
    data.encuesta.forEach((row) => {
      const respuesta = row[columnKey];
      if (respuesta && String(respuesta).trim() !== "") {
        const normalized = String(respuesta).trim().toLowerCase();
        counter[normalized] = (counter[normalized] || 0) + 1;
      }
    });
    return Object.entries(counter).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const pregunta1Data = contarRespuestas(pregunta1Key);
  const pregunta4Data = contarRespuestas(pregunta4Key);

  // Para Si/No normalizamos
  const normalizarSiNo = (data) => {
    const normalized = {};
    data.forEach((item) => {
      let key = item.name;
      if (
        key === "sí" ||
        key === "si" ||
        key.startsWith("s")
      ) {
        key = "Sí";
      } else {
        key = "No";
      }
      normalized[key] = (normalized[key] || 0) + item.value;
    });
    return Object.entries(normalized).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getSiNoColor = (name) => {
    const lowerName = String(name || "").trim().toLowerCase();
    if (lowerName === "sí" || lowerName === "si" || lowerName.startsWith("s")) {
      return "#39d856"; // color para Sí
    }
    return "#fd5a88"; // color para No
  };

  const pregunta2Data = normalizarSiNo(contarRespuestas(pregunta2Key));
  const pregunta3Data = normalizarSiNo(contarRespuestas(pregunta3Key));
  const pregunta5Data = normalizarSiNo(contarRespuestas(pregunta5Key));

  const isCommentColumn = (col) =>
    /coment|suger|recomend|observ|feedback|texto|mensaje|nota/i.test(col);

  const comentarioKey = columnasKeys.find((col) => isCommentColumn(col));

  // Pregunta de comentarios
  const comentarios = [];
  if (comentarioKey) {
    data.encuesta.forEach((row) => {
      const respuesta = row[comentarioKey];
      if (respuesta && String(respuesta).trim() !== "") {
        comentarios.push(String(respuesta).trim());
      }
    });
  }

  const totalRespuestas = data.encuesta.length;
  const totalEncuestaEnviados = data.campañas
    ? data.campañas.filter((row) =>
        String(row.tipo || "")
          .toLowerCase()
          .includes("encuesta satisfaccion")
      ).length
    : 0;

  // Validar que tenemos suficientes datos
  if (
    !pregunta1Key ||
    !pregunta2Key ||
    !pregunta3Key ||
    !pregunta4Key ||
    !pregunta5Key
  ) {
    console.error("❌ No hay suficientes preguntas");
    console.error("Pregunta 1:", pregunta1Key);
    console.error("Pregunta 2:", pregunta2Key);
    console.error("Pregunta 3:", pregunta3Key);
    console.error("Pregunta 4:", pregunta4Key);
    console.error("Pregunta 5:", pregunta5Key);
    return (
      <div className="chart-card">
        <p>❌ No se encontraron suficientes columnas de preguntas en la encuesta.</p>
        <p>Columnas encontradas: {preguntasColumnas.length}</p>
        <p>{preguntasColumnas.join(", ")}</p>
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="survey-section">
      <div className="survey-section-header">
        <span className="survey-badge">Sección de encuesta</span>
        <h2>Satisfaccion del Cliente</h2>
      </div>

      <div className="survey-chart-grid">
      <div className="survey-card survey-summary-card">
        <h3>Encuesta Satisfacción</h3>
        <div className="survey-summary-content">
          <div className="survey-summary-stats">
            <div className="survey-summary-stat">
              <div className="survey-summary-value">{totalEncuestaEnviados}</div>
              <div className="survey-summary-label">Envios</div>
            </div>
            <div className="survey-summary-stat survey-summary-stat--secondary">
              <div className="survey-summary-value">{totalRespuestas}</div>
              <div className="survey-summary-label">Respuestas</div>
            </div>
          </div>
          <div className="survey-summary-note">
            Se consideran todas las encuestas enviadas a clientes con casos resueltos, 
            exceptuando aquellos en los que la marca informó que no aplicaba la garantía o 
            cuando la solución fue gestionada de manera externa al proceso.
          </div>
        </div>
      </div>
      {/* Pregunta 1 */}
      {pregunta1Data.length > 0 && (
        <div className="survey-card">
          <h3>{pregunta1Key}</h3>
          <div className="survey-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pregunta1Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#9759d5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pregunta 2 */}
      {pregunta2Data.length > 0 && (
        <div className="survey-card">
          <h3>{pregunta2Key}</h3>
          <div className="survey-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pregunta2Data}
                  cx="40%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pregunta2Data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSiNoColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={10}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pregunta 3 */}
      {pregunta3Data.length > 0 && (
        <div className="survey-card">
          <h3>{pregunta3Key}</h3>
          <div className="survey-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pregunta3Data}
                  cx="40%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pregunta3Data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSiNoColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={10}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pregunta 4 */}
      {pregunta4Data.length > 0 && (
        <div className="survey-card">
          <h3>{pregunta4Key}</h3>
          <div className="survey-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pregunta4Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#24a9cb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pregunta 5 */}
      {pregunta5Data.length > 0 && (
        <div className="survey-card">
          <h3>{pregunta5Key}</h3>
          <div className="survey-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pregunta5Data}
                  cx="40%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pregunta5Data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSiNoColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={10}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      </div>

      <div className="survey-card">
        <h3>
          Comentarios, Sugerencias y Recomendaciones (
          {comentarios.length})
        </h3>
        <div
          className="survey-chart-container survey-comment-list"
          style={{ maxHeight: "320px", overflowY: "auto" }}
        >
          {comentarioKey ? (
            comentarios.length > 0 ? (
              <ul style={{ paddingLeft: "20px" }}>
                {comentarios.map((comentario, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                    }}
                  >
                    {comentario}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="survey-no-comments">No hay comentarios registrados.</div>
            )
          ) : (
            <div className="survey-no-comments">
              No se encontró la columna de comentarios.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
