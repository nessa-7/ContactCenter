import {
  FiClipboard,
  FiClock,
  FiCheckCircle,
  FiTag,
} from "react-icons/fi";

export default function KPICards({
  data,
}) {
  const total =
    data.length;

  const pendientes =
    data.filter(
      (item) =>
        String(
          item.ESTADONOMB
        )
          .toUpperCase()
          .trim() ===
        "PENDIENTE"
    ).length;

  const cerradas =
    data.filter(
      (item) =>
        String(
          item.ESTADONOMB
        )
          .toUpperCase()
          .trim() ===
        "CERRADO"
    ).length;

  const marcas =
    new Set(
      data.map(
        (item) =>
          item.MARCA
      )
    ).size;

  const pendientePorcentaje =
    total
      ? (
          (pendientes /
            total) *
          100
        ).toFixed(2)
      : 0;

  const cerradaPorcentaje =
    total
      ? (
          (cerradas /
            total) *
          100
        ).toFixed(2)
      : 0;

  const cards = [
    {
      title:
        "Total Órdenes",
      value: total,
      subtitle:
        "Órdenes registradas",
      icon:
        <FiClipboard />,
      className:
        "blue",
    },

    {
      title:
        "Pendientes",
      value:
        pendientes,
      subtitle:
        `${pendientePorcentaje}% del total`,
      icon:
        <FiClock />,
      className:
        "orange",
    },

    {
      title:
        "Cerradas",
      value:
        cerradas,
      subtitle:
        `${cerradaPorcentaje}% del total`,
      icon:
        <FiCheckCircle />,
      className:
        "green",
    },

    /** 
    {
      title:
        "Marcas",
      value: marcas,
      subtitle:
        "Marcas diferentes",
      icon: <FiTag />,
      className:
        "purple",
    },
    */
  ];

  return (
    <div className="kpi-grid">
      {cards.map(
        (
          card,
          index
        ) => (
          <div
            key={index}
            className="kpi-card"
          >
            <div
              className={`kpi-icon ${card.className}`}
            >
              {
                card.icon
              }
            </div>

            <div>
              <h4>
                {
                  card.title
                }
              </h4>

              <h2>
                {
                  card.value
                }
              </h2>

              <p>
                {
                  card.subtitle
                }
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}