import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "./Charts.css";

function EnvioChart({ data }) {
  const left = data.noCompletoFlujo || [];
  const right = data.fueraGarantia || [];

  const normalize = (s) => String(s || "").toLowerCase();

  const matchAny = (item, keywords) => {
    const txt = normalize(item.observacion) + " " + normalize(item.nota);
    return keywords.some((kw) => txt.includes(kw));
  };

  const noCompleto = left.filter((x) => matchAny(x, ["no completo", "no completo el flujo"]) ).length;

  const cedulaLeft = left.filter((x) => matchAny(x, ["cedula", "cédula"])).length;
  const cedulaRight = right.filter((x) => matchAny(x, ["cedula", "cédula"]) ).length;
  const cedulaErronea = cedulaLeft + cedulaRight;

  const manejadoMariaLeft = left.filter((x) => matchAny(x, ["maria elena", "manejado por maria elena"]) ).length;
  const manejadoMariaRight = right.filter((x) => matchAny(x, ["maria elena", "manejado por maria elena"]) ).length;
  const manejadoMaria = manejadoMariaLeft + manejadoMariaRight;

  const escaladoLeft = left.filter((x) => matchAny(x, ["escalado a lina", "escalado a la lina"]) ).length;
  const escaladoRight = right.filter((x) => matchAny(x, ["escalado a lina", "escalado a la lina"]) ).length;
  const escalado = escaladoLeft + escaladoRight;

  const fueraGarantia = right.length || 0;

  const chartData = [
    { name: "No Completó Flujo", value: noCompleto },
    { name: "Cédula Errónea", value: cedulaErronea },
    { name: "Cambio/Devolución", value: manejadoMaria },
    { name: "PQRS", value: escalado },
    { name: "Fuera Garantía", value: fueraGarantia },
  ];

  // Calcular solucionados excluyendo 'fuera garantia' (tomando solo registros de la tabla izquierda)
  const isSolved = (x) => {
    const estado = normalize(x.estado || "");
    const note = normalize(x.nota || "");
    const obs = normalize(x.observacion || "");
    return estado.includes("solucionado") || note.includes("solucionado") || obs.includes("solucionado");
  };

  const combinedExclFuera = left.slice();
  const totalExclFuera = combinedExclFuera.length;
  const solucionadasExclFuera = combinedExclFuera.filter(isSolved).length;

  return (
    <div className="chart-card">
      <h3>Novedades</h3>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={chartData} dataKey="value" label>
            <Cell fill="#87dae8" />
            <Cell fill="#b082d5" />
            <Cell fill="#efd054" />
            <Cell fill="#dda05f" />
            <Cell fill="#e56464" />
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <strong>Total (excluye Fuera garantía):</strong> {totalExclFuera}
        </div>
        {/*}
        <div>
          <strong>Solucionadas:</strong> {solucionadasExclFuera}
        </div>
        */}
      </div>
    </div>
  );
}

export default EnvioChart;
