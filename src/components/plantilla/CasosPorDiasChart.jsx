import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

import "./Charts.css";
import "./CasosPorDias.css";
import "../manager/KPICards.css";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
} from "react-icons/fi";


function CasosPorDiasChart({
  data,
}) {
  const [selectedSegment, setSelectedSegment] = useState(null);

  if (!data?.baseCasos)
    return null;

  const ranges = [
    { key: "1-10", min: 1, max: 10 },
    { key: "11-20", min: 11, max: 20 },
    { key: "21-30", min: 21, max: 30 },
    { key: ">30", min: 31, max: Infinity },
  ];

  const counts = {};

  const normalizeText = (value) =>
    String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  const getCaseValue = (caso, candidates) => {
    const normalizedTargets = new Set(candidates.map(normalizeText));

    for (const key of Object.keys(caso || {})) {
      const normalizedKey = normalizeText(key);
      if (normalizedTargets.has(normalizedKey)) {
        const value = caso[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return String(value).trim();
        }
      }
    }

    return "";
  };

  const formatDateValue = (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return "";
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("es-CO");
    }

    if (typeof value === "number") {
      if (value > 59) {
        const date = new Date((value - 25569) * 86400 * 1000);
        return date.toLocaleDateString("es-CO");
      }
      return String(value);
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("es-CO");
    }

    return String(value);
  };

  const hasFechaFin = (caso) =>
    Object.keys(caso || {}).some(
      (k) =>
        /fech.*fin|fecha.*fin|fechafin|fecha_fin|fecha.*cierre|fechacierre/i.test(k) &&
        String(caso[k] || "").toString().trim() !== ""
    );

  const getCasesForSegment = (dia, segmentType) => {
    const range = ranges.find((r) => r.key === dia);
    if (!range) return [];

    return data.baseCasos.filter((caso) => {
      const dias = Number(caso.diasResolucion) || 0;

      if (!dias || dias < 1) return false;
      if (dias < range.min || dias > range.max) return false;

      const isClosed = hasFechaFin(caso);
      return segmentType === "cerrado" ? isClosed : !isClosed;
    });
  };

  ranges.forEach((r) => {
    counts[r.key] = { abierto: 0, cerrado: 0 };
  });

  data.baseCasos.forEach((caso) => {
    const dias = Number(caso.diasResolucion) || 0;

    if (!dias || dias < 1) return;

    const range = ranges.find((r) => dias >= r.min && dias <= r.max);
    if (!range) return;

    const key = range.key;

    if (hasFechaFin(caso)) counts[key].cerrado++;
    else counts[key].abierto++;
  });

  const chartData = ranges.map((r) => ({
    dia: r.key,
    abierto: counts[r.key].abierto,
    cerrado: counts[r.key].cerrado,
    total: counts[r.key].abierto + counts[r.key].cerrado,
  }));

  const totalOverall = chartData.reduce((s, d) => s + d.total, 0) || 1;

  const casosCerradosConTiempo =
    data.baseCasos.filter(
      (c) =>
        c.diasCierre !== null &&
        c.diasCierre !== undefined &&
        !isNaN(c.diasCierre)
    );

  const promedioResolucion =
    casosCerradosConTiempo.length > 0
      ? Math.round(
        casosCerradosConTiempo.reduce(
          (sum, c) => sum + c.diasCierre,
          0
        ) / casosCerradosConTiempo.length
      )
      : 0;

  const menorTiempoResolucion =
    casosCerradosConTiempo.length > 0
      ? Math.min(
        ...casosCerradosConTiempo.map(
          (c) => c.diasCierre
        )
      )
      : 0;

  const mayorTiempoResolucion =
    casosCerradosConTiempo.length > 0
      ? Math.max(
        ...casosCerradosConTiempo.map(
          (c) => c.diasCierre
        )
      )
      : 0;

  const getColor = (dia) => {
    const colorMap = {
      "1-10": "#19ee47",
      "11-20": "#efe22c",
      "21-30": "#ef4444",
      ">30": "#9ca3af",
    };

    return colorMap[dia] || "#4b5563";
  };

  const selectedCases = selectedSegment
    ? getCasesForSegment(selectedSegment.dia, selectedSegment.segmentType)
    : [];

  const closeModal = () => setSelectedSegment(null);

  const renderTopLabel = (props) => {
    const { x, y, index } = props;
    const d = chartData[index] || { total: 0 };
    const pct = Math.round((d.total / totalOverall) * 100);
    const text = `${d.total} (${pct}%)`;

    return (
      <text
        x={x + 20}
        y={y - 6}
        textAnchor="middle"
        fill="#0b2b5b"
        fontSize={12}
      >
        {text}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const d = chartData.find((c) => c.dia === label) || {};
    const total = d.total || 0 || 1;

    return (
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          padding: 8,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => {
          const name = p.dataKey === "abierto" ? "Abiertos" : "Cerrados";
          const value = p.value || 0;
          const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";

          return (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 10, height: 10, background: p.color || p.fill, marginTop: 4 }} />
              <div>
                {name}: {value} ({pct}%)
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 6, borderTop: "1px solid #eee", paddingTop: 6 }}>
          Total: {total} ({Math.round((total / totalOverall) * 100)}% del total)
        </div>
      </div>
    );
  };

  return (
    <div className="chart-card">
      {selectedSegment && (
        <div className="case-details-overlay" onClick={closeModal}>
          <div className="case-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="case-details-header">
              <div>
                <h3>
                  {selectedSegment.dia} · {selectedSegment.segmentType === "abierto" ? "Abiertos" : "Cerrados"}
                </h3>
                <p>{selectedCases.length} caso(s) encontrados</p>
              </div>
              <button type="button" className="case-details-close" onClick={closeModal}>
                ×
              </button>
            </div>

            {selectedCases.length === 0 ? (
              <p className="case-details-empty">No hay casos para este segmento.</p>
            ) : (
              <div className="case-details-list">
                {selectedCases.map((caso, index) => (
                  <div className="case-details-item" key={`${getCaseValue(caso, ["Id", "id", "Número", "numero"])}-${index}`}>
                    <div className="case-details-name">
                      {getCaseValue(caso, ["Nombre cliente", "Nombre Cliente", "Cliente", "nombre cliente", "Nombre", "nombre"]) || "Sin nombre"}
                    </div>
                    <div className="case-details-meta">
                      <span><strong>Producto:</strong> {getCaseValue(caso, ["Producto", "producto", "Producto/Servicio", "Tipo de producto"]) || "Sin producto"}</span>
                      <span><strong>Marca:</strong> {getCaseValue(caso, ["Marca", "marca", "MARCA"]) || "Sin marca"}</span>
                      <span><strong>Estado:</strong> {getCaseValue(caso, ["Estado", "estado", "ESTADO", "Status", "status", "Estado del caso", "estadodelcaso"]) || "Sin estado"}</span>
                      <span><strong>Días:</strong> {caso.diasResolucion ?? caso.diasCierre ?? "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <h3>
        Casos por
        Días de Atención
      </h3>

      {/* KPI row */}
      <div style={{ marginBottom: 30, marginTop: 15 }}>
        <div className="kpi-grid2">
          <div className="kpi-card2" style={{ padding: 14, background: 'rgba(0, 255, 94, 0.11)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="kpi-icon" style={{ width: 56, height: 56, fontSize: 22, background: 'rgba(34, 197, 94, 0.4)', color: '#16a34a' }}>
              <FiCheckCircle />
            </div>

            <div>
              <h4>A Tiempo (1-10 días)</h4>
              <h2>{counts["1-10"].abierto}</h2>
              <p>Plazo oportuno</p>
            </div>
          </div>

          <div className="kpi-card2" style={{ padding: 14, background: 'rgba(250,204,21,0.11)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <div className="kpi-icon" style={{ width: 56, height: 56, fontSize: 22, background: 'rgba(250, 204, 21, 0.41)', color: '#b45309' }}>
              <FiAlertTriangle />
            </div>

            <div>
              <h4>En Riesgo (11-20 días)</h4>
              <h2>{counts["11-20"].abierto}</h2>
              <p>Próximos a vencerse</p>
            </div>
          </div>

          <div className="kpi-card2" style={{ padding: 14, background: 'rgba(239,68,68,0.11)', border: '1px solid rgba(239, 68, 68, 0.21)' }}>
            <div className="kpi-icon" style={{ width: 56, height: 56, fontSize: 22, background: 'rgba(239, 68, 68, 0.34)', color: '#dc2626' }}>
              <FiXCircle />
            </div>

            <div>
              <h4>Críticos (21-30 días)</h4>
              <h2>{counts["21-30"].abierto}</h2>
              <p>Alto riesgo</p>
            </div>
          </div>

          <div className="kpi-card2" style={{ padding: 14, background: 'rgba(156,163,175,0.11)', border: '1px solid rgba(156,163,175,0.3)' }}>
            <div className="kpi-icon" style={{ width: 56, height: 56, fontSize: 22, background: 'rgba(156, 163, 175, 0.35)', color: '#374151' }}>
              <FiClock />
            </div>

            <div>
              <h4>Muy Críticos (&gt;30 días)</h4>
              <h2>{counts[">30"].abierto}</h2>
              <p>Riesgo extremo</p>
            </div>
          </div>


        </div>
      </div>



      <div className="chart-main-layout" style={{ alignItems: "stretch" }}>

        <div className="chart-area" style={{ minHeight: 430 }}>

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 20,
                left: 20,
                bottom: 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="dia"
                label={{
                  value:
                    "Días de Resolución",
                  position:
                    "insideBottom",
                  offset: -10,
                }}
              />

              <YAxis
                allowDecimals={
                  false
                }
                label={{
                  value:
                    "Cantidad de Casos",
                  angle: -90,
                  position:
                    "insideLeft",
                }}
              />

              <Tooltip content={CustomTooltip} />

              <Bar dataKey="abierto" stackId="a" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getColor(entry.dia)}
                    cursor="pointer"
                    onClick={() => setSelectedSegment({ dia: entry.dia, segmentType: "abierto" })}
                    onDoubleClick={() => setSelectedSegment({ dia: entry.dia, segmentType: "abierto" })}
                  />
                ))}
                <LabelList dataKey="abierto" position="insideTop" style={{ fill: "#fffffff0", fontSize: 15, fontWeight: 700 }} />
              </Bar>

              <Bar dataKey="cerrado" stackId="a" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill="#bfdeff"
                    cursor="pointer"
                    onClick={() => setSelectedSegment({ dia: entry.dia, segmentType: "cerrado" })}
                    onDoubleClick={() => setSelectedSegment({ dia: entry.dia, segmentType: "cerrado" })}
                  />
                ))}
                <LabelList dataKey="cerrado" position="insideTop" style={{ fill: "#2a2a2ac5", fontSize: 12, fontWeight: 700 }} />
                <LabelList content={renderTopLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="side-kpis">

          <div className="kpi-card2" style={{ padding: 14, background: 'rgba(160, 220, 230, 0.23)', border: '1px solid rgba(117, 204, 222, 0.3)' }}>
            <div className="kpi-icon" style={{ width: 56, height: 56, fontSize: 22, background: 'rgba(188, 224, 238, 0.56)', color: '#19d9ff' }}>
              <FiClock />
            </div>

            <div>
              <h4>Cerrados</h4>
              <h2>{chartData.reduce((s, d) => s + d.cerrado, 0)}</h2>
              <p>Casos cerrados</p>
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div
            className="kpi-card2"
            style={{
              padding: 14,
              background:
                "rgba(59,130,246,0.11)",
              border:
                "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <div
              className="kpi-icon"
              style={{
                width: 56,
                height: 56,
                fontSize: 22,
                background:
                  "rgba(59,130,246,0.35)",
                color: "#2563eb",
              }}
            >
              <FiActivity />
            </div>

            <div>
              <h4>Tiempo Promedio</h4>

              <h2>
                {promedioResolucion}
                <span
                  style={{
                    fontSize: 18,
                    marginLeft: 4,
                  }}
                >
                  días
                </span>
              </h2>

              <p>
                Promedio de Solución
              </p>
            </div>
          </div>

          {/* Menor Tiempo */}
          <div
            className="kpi-card2"
            style={{
              padding: 14,
              background: "rgba(97, 57, 23, 0.11)",
              border: "1px solid rgba(138, 68, 24, 0.3)",
            }}
          >
            <div
              className="kpi-icon"
              style={{
                width: 56,
                height: 56,
                fontSize: 22,
                background: "rgba(135, 56, 13, 0.28)",
                color: "#5c330f",
              }}
            >
              <FiTrendingUp />
            </div>

            <div>
              <h4>Caso Menor Tiempo</h4>

              <h2>
                {menorTiempoResolucion}
                <span
                  style={{
                    fontSize: 18,
                    marginLeft: 4,
                  }}
                >
                  días
                </span>
              </h2>

              <p>Para la Solución</p>
            </div>
          </div>


          {/* Mayor Tiempo */}

          <div
            className="kpi-card2"
            style={{
              padding: 14,
              background: "rgba(165, 68, 239, 0.11)",
              border: "1px solid rgba(154, 68, 239, 0.3)",
            }}
          >
            <div
              className="kpi-icon"
              style={{
                width: 56,
                height: 56,
                fontSize: 22,
                background: "rgba(173, 68, 239, 0.35)",
                color: "#9026dc",
              }}
            >
              <FiTrendingDown />
            </div>

            <div>
              <h4>Caso Mayor Tiempo</h4>

              <h2>
                {mayorTiempoResolucion}
                <span
                  style={{
                    fontSize: 18,
                    marginLeft: 4,
                  }}
                >
                  días
                </span>
              </h2>

              <p>Para la Solución</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default CasosPorDiasChart;