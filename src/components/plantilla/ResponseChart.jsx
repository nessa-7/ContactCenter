import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import "./Charts.css";

import Holidays from "date-holidays";



import { useState } from "react";

function ResponseChart({ data }) {

  const meses = Array.from(
    { length: 12 },
    () => Array(31).fill(0)
  );

  const [mesSeleccionado, setMesSeleccionado] =
    useState("Todos");

  const excelDateToJSDate = (excelDate) => {
    const utcDate = new Date(
      (excelDate - 25569) * 86400 * 1000
    );

    return new Date(
      utcDate.getTime() +
      utcDate.getTimezoneOffset() *
      60000
    );
  };

  data.baseCasos.forEach(
    (item) => {
      const fecha =
        item["Fecha ingreso"];

      if (!fecha) return;

      let date;

      if (!isNaN(fecha)) {
        date = excelDateToJSDate(
          Number(fecha)
        );
      } else {
        date = new Date(fecha);
      }

      if (
        isNaN(date.getTime())
      )
        return;

      const mes =
        date.getMonth();

      const dia =
        date.getDate();

      meses[mes][dia - 1]++;
    }
  );

  const primerCaso = data.baseCasos.find(
    (x) => x["Fecha ingreso"]
  );

  let year = new Date().getFullYear();

  if (primerCaso) {
    let fecha = primerCaso["Fecha ingreso"];

    if (!isNaN(fecha)) {
      year = excelDateToJSDate(Number(fecha)).getFullYear();
    } else {
      year = new Date(fecha).getFullYear();
    }
  }

  const mesesNumero = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11,
  };

  const diasDelMes =
    mesSeleccionado === "Todos"
      ? 31
      : new Date(
        year,
        mesesNumero[mesSeleccionado] + 1,
        0
      ).getDate();

  const dias = Array.from(
    { length: diasDelMes },
    (_, i) => i + 1
  );

  const chartData = dias.map((dia, index) => ({
    dia,
    Enero: meses[0][index],
    Febrero: meses[1][index],
    Marzo: meses[2][index],
    Abril: meses[3][index],
    Mayo: meses[4][index],
    Junio: meses[5][index],
    Julio: meses[6][index],
    Agosto: meses[7][index],
    Septiembre: meses[8][index],
    Octubre: meses[9][index],
    Noviembre: meses[10][index],
    Diciembre: meses[11][index],
  }));

  const mesesConfig = [
    {
      key: "Enero",
      color: "#3b82f6",
    },
    {
      key: "Febrero",
      color: "#ef4444",
    },
    {
      key: "Marzo",
      color: "#22c55e",
    },
    {
      key: "Abril",
      color: "#f59e0b",
    },
    {
      key: "Mayo",
      color: "#8b5cf6",
    },
    {
      key: "Junio",
      color: "#06b6d4",
    },
    {
      key: "Julio",
      color: "#ec4899",
    },
    {
      key: "Agosto",
      color: "#84cc16",
    },
    {
      key: "Septiembre",
      color: "#f97316",
    },
    {
      key: "Octubre",
      color: "#6366f1",
    },
    {
      key: "Noviembre",
      color: "#14b8a6",
    },
    {
      key: "Diciembre",
      color: "#dc2626",
    },
  ];

  const hd = new Holidays("CO");


  const totalCasos = data.baseCasos.filter((item) => {
    const fecha = item["Fecha ingreso"];
    if (!fecha) return false;

    let date;

    if (!isNaN(fecha)) {
      date = excelDateToJSDate(Number(fecha));
    } else {
      date = new Date(fecha);
    }

    if (isNaN(date.getTime())) return false;

    if (mesSeleccionado === "Todos") {
      return true;
    }

    return (
      date.getMonth() ===
      mesesNumero[mesSeleccionado]
    );
  }).length;

  const CustomXAxisTick = ({
    x,
    y,
    payload,
  }) => {
    if (mesSeleccionado === "Todos") {
      return (
        <text
          x={x}
          y={y + 15}
          textAnchor="middle"
          fill="#374151"
        >
          {payload.value}
        </text>
      );
    }

    const fecha = new Date(
      year,
      mesesNumero[mesSeleccionado],
      payload.value
    );

    const esFinSemana =
      fecha.getDay() === 0 ||
      fecha.getDay() === 6;

    const esFestivo =
      hd.isHoliday(fecha);

    return (
      <text
        x={x}
        y={y + 15}
        textAnchor="middle"
        fill={
          esFestivo
            ? "#dc2626"
            : esFinSemana
              ? "#f59e0b"
              : "#374151"
        }
        fontWeight={
          esFestivo || esFinSemana
            ? 700
            : 400
        }
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-headermiau">
        <div>
          <h3>Casos Ingresados por Día</h3>

          <div className="chart-total">
            <span className="chart-total-number">
              {totalCasos}
            </span>

            <span className="chart-total-text">
              Casos ingresados
            </span>
          </div>
        </div>

        {mesSeleccionado !== "Todos" && (
          <div className="day-legend">
            <span>⚫ Día Hábil</span>
            <span>🟠 Sábado/Domingo</span>
            <span>🔴 Festivo</span>
          </div>
        )}

        <select
          className="month-filter"
          value={mesSeleccionado}
          onChange={(e) =>
            setMesSeleccionado(e.target.value)
          }
        >
          <option value="Todos">Todos</option>
          <option value="Enero">Enero</option>
          <option value="Febrero">Febrero</option>
          <option value="Marzo">Marzo</option>
          <option value="Abril">Abril</option>
          <option value="Mayo">Mayo</option>
          <option value="Junio">Junio</option>
          <option value="Julio">Julio</option>
          <option value="Agosto">Agosto</option>
          <option value="Septiembre">Septiembre</option>
          <option value="Octubre">Octubre</option>
          <option value="Noviembre">Noviembre</option>
          <option value="Diciembre">Diciembre</option>
        </select>
      </div>


      <ResponsiveContainer
        width="100%"
        height={450}
      >
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.3}
          />

          <XAxis
            dataKey="dia"
            tick={<CustomXAxisTick />}
          />

          <YAxis
            allowDecimals={false}
            tick={{
              fontSize: 12,
            }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 4px 12px rgba(0,0,0,.1)",
            }}
          />

          <Legend
  verticalAlign="bottom"
  wrapperStyle={{
    paddingTop: "10px",
  }}
  content={() => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        flexWrap: "wrap",
        paddingTop: "10px",
      }}
    >
      {mesesConfig
        .filter(
          (mes) =>
            mesSeleccionado === "Todos" ||
            mes.key === mesSeleccionado
        )
        .filter((mes) =>
          chartData.some(
            (item) => item[mes.key] > 0
          )
        )
        .map((mes) => (
          <div
            key={mes.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: mes.color,
                display: "inline-block",
              }}
            />

            <span
              style={{
                color: mes.color,
                fontSize: "14px",
              }}
            >
              {mes.key}
            </span>
          </div>
        ))}
    </div>
  )}
/>

          {mesesConfig
            .filter(
              (mes) =>
                mesSeleccionado === "Todos" ||
                mes.key === mesSeleccionado
            )
            .map((mes) => {
              const tieneDatos =
                chartData.some(
                  (item) =>
                    item[
                    mes.key
                    ] > 0
                );

              if (
                !tieneDatos
              )
                return null;

              return (
                <Line
                  key={mes.key}
                  type="monotone"
                  dataKey={
                    mes.key
                  }
                  stroke={
                    mes.color
                  }
                  strokeWidth={
                    3
                  }
                  dot={{
                    r: 1.5,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />
              );
            }
            )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ResponseChart;