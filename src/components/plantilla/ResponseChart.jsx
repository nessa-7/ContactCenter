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

function ResponseChart({ data }) {
  const dias = Array.from(
    { length: 31 },
    (_, i) => i + 1
  );

  const meses = Array.from(
    { length: 12 },
    () => Array(31).fill(0)
  );

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

  const chartData = dias.map(
    (dia, index) => ({
      dia,
      Enero: meses[0][index],
      Febrero: meses[1][index],
      Marzo: meses[2][index],
      Abril: meses[3][index],
      Mayo: meses[4][index],
      Junio: meses[5][index],
      Julio: meses[6][index],
      Agosto: meses[7][index],
      Septiembre:
        meses[8][index],
      Octubre:
        meses[9][index],
      Noviembre:
        meses[10][index],
      Diciembre:
        meses[11][index],
    })
  );

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

  return (
    <div className="chart-card">
      <h3>
        Casos Ingresados por Día
      </h3>

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
            tick={{
              fontSize: 12,
            }}
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
          />

          {mesesConfig.map(
            (mes) => {
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
                  type="linear"
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