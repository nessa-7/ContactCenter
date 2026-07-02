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
  if (!data?.baseCasos)
    return null;

  const ranges = [
    { key: "1-10", min: 1, max: 10 },
    { key: "11-20", min: 11, max: 20 },
    { key: ">20", min: 21, max: Infinity },
  ];

  const counts = {};

  ranges.forEach((r) => {
    counts[r.key] = { abierto: 0, cerrado: 0 };
  });

  data.baseCasos.forEach((caso) => {
    const dias = Number(caso.diasResolucion) || 0;

    if (!dias || dias < 1) return;

    const range = ranges.find((r) => dias >= r.min && dias <= r.max);
    if (!range) return;

    const key = range.key;

    // Determine closed by presence of any 'fecha fin' field (handle variants)
    const hasFechaFin = Object.keys(caso).some((k) =>
      /fech.*fin|fecha.*fin|fechafin|fecha_fin|fecha.*cierre|fechacierre/i.test(k) &&
      String(caso[k] || "").toString().trim() !== ""
    );

    if (hasFechaFin) counts[key].cerrado++;
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
      ">20": "#ef4444",
    };

    return colorMap[dia] || "#4b5563";
  };

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
              <h4>Críticos (&gt;20 días)</h4>
              <h2>{counts[">20"].abierto}</h2>
              <p>Alto riesgo</p>
            </div>
          </div>

          <div className="kpi-card2" style={{ padding: 14, background: 'rgba(156,163,175,0.11)', border: '1px solid rgba(156,163,175,0.3)' }}>
            <div className="kpi-icon" style={{ width: 56, height: 56, fontSize: 22, background: 'rgba(156, 163, 175, 0.35)', color: '#374151' }}>
              <FiClock />
            </div>

            <div>
              <h4>Cerrados</h4>
              <h2>{chartData.reduce((s, d) => s + d.cerrado, 0)}</h2>
              <p>Casos cerrados</p>
            </div>
          </div>

        </div>
      </div>



      <div className="chart-main-layout">

        <div className="chart-area">

          <ResponsiveContainer
            width="100%"
            height={450}
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
                  <Cell key={index} fill={getColor(entry.dia)} />
                ))}
                <LabelList dataKey="abierto" position="insideTop" style={{ fill: "#fffffff0", fontSize: 15, fontWeight: 700 }} />
              </Bar>

              <Bar dataKey="cerrado" stackId="a" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill="#b1b2b4" />
                ))}
                <LabelList dataKey="cerrado" position="insideTop" style={{ fill: "#2a2a2ac5", fontSize: 12, fontWeight: 700 }} />
                <LabelList content={renderTopLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="side-kpis">

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