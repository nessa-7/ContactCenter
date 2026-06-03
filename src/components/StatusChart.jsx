import { Doughnut } from "react-chartjs-2";

export default function StatusChart({ data }) {
  const motivos = {};

  data.forEach((item) => {
    let motivo = String(
      item.CONCEPTO_E || "Sin motivo"
    )
      .trim()
      .toUpperCase();

    if (
      motivo === "NO PRENDE" ||
      motivo === "NO ENCIENDE" ||
      motivo === "SE DEMORA EN ENCENDER"
    ) {
      motivo = "PROBLEMAS DE ENCENDIDO";
    }

    if (
      motivo === "APARECE ERROR" ||
      motivo === "ERROR EN PANTALLA"
    ) {
      motivo = "ERRORES DEL SISTEMA";
    }

    motivos[motivo] =
      (motivos[motivo] || 0) + 1;
  });

  // Ordenar de mayor a menor
  const sortedMotivos = Object.entries(
    motivos
  ).sort((a, b) => b[1] - a[1]);

  // Tomar solo los 5 más frecuentes
  const top5 =
    sortedMotivos.slice(0, 5);

  const chartData = {
    labels: top5.map(
      ([motivo]) => motivo
    ),

    datasets: [
      {
        data: top5.map(
          ([, cantidad]) => cantidad
        ),

        backgroundColor: [
          "#81eaf2",
          "#eebce8",
          "#f6b74b",
          "#b5a1dd",
          "#df7b99",
        ],

        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="chart-card">
      <h3>
        Top 5 Motivos de
        Garantía
      </h3>

      <Doughnut
        data={chartData}
        options={{
          responsive: true,

          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 18,
                padding: 10,
              },
            },
          },
        }}
      />
    </div>
  );
}