import "./ContactKPICards.css";

function ContactKPICards({
  data,
}) {
  if (!data) return null;

  const casos =
  data.baseCasos.filter(
    (x) =>
      x["Fecha ingreso"] &&
      x["Nombre cliente"] &&
      x["Teléfono"]
  ).length;

  const campañaHoy =
    data.baseCasos?.filter(
      (x) =>
        String(
          x["¿Campaña hoy?"]
        ).toUpperCase() === "SI"
    ).length || 0;

  const ordenes =
    data.baseCasos?.filter(
      (x) =>
        x[
          "Orden de Servicio"
        ]
    ).length || 0;

  const noCompleto =
    data.noCompletoFlujo?.filter(
      (x) =>
        x.observacion ===
        "No completo el flujo"
    ).length || 0;

  const cedulaErronea =
    data.noCompletoFlujo?.filter(
      (x) =>
        x.observacion ===
        "cedula erronea"
    ).length || 0;

  const fueraGarantia =
    data.fueraGarantia?.length || 0;

  const cards = [
    {
      title:
        "Total Casos Ingresados",
      value: casos,
    },
    {
      title:
        "Campaña Hoy",
      value: campañaHoy,
    },
    {
      title:
        "No Completó Flujo",
      value: noCompleto,
    },
    {
      title:
        "Cédula Errónea",
      value: cedulaErronea,
    },
    {
      title:
        "Fuera Garantía",
      value: fueraGarantia,
    },
  ];

  return (
    <section className="contact-kpis">
      {cards.map((card) => (
        <div
          key={card.title}
          className="contact-card"
        >
          <h4>{card.title}</h4>

          <h2>{card.value}</h2>
        </div>
      ))}
    </section>
  );
}

export default ContactKPICards;