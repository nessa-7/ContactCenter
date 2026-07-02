import "./ContactKPICards.css";
import {
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

function ContactKPICards({ data }) {
  if (!data) return null;

  const casos =
    data.baseCasos?.filter(
      (x) =>
        x["Fecha ingreso"] &&
        x["Nombre cliente"] &&
        x["Teléfono"]
    ).length || 0;

  const novedades = data.noCompletoFlujo || [];

  const solucionadas = novedades.filter(
    (x) =>
      String(x.estado)
        .trim()
        .toLowerCase() ===
      "solucionado"
  ).length;

  const pendientes =
    novedades.length - solucionadas;

  const efectividad =
    novedades.length > 0
      ? (
        (solucionadas /
          novedades.length) *
        100
      ).toFixed(0)
      : 0;

  return (
    <section className="contact-kpis">
      <div className="contact-card contact-card-primary">
        <div className="card-header">
          <div className="card-icon blue">
            <FiPackage />
          </div>

          <div>
            <p className="contact-card-primary-title">
              Casos Ingresados
            </p>

            <p className="contact-card-primary-subtitle">
              Órdenes registradas correctamente
            </p>
          </div>
        </div>

        <h2 className="contact-card-primary-value">
          {casos}
        </h2>
      </div>
      {/*
      <div className="contact-card novedades-card">
        <div className="card-header">
          <div className="card-icon orange">
            <FiAlertTriangle />
          </div>

          <div>
            <h3>Novedades</h3>
            <p>Total de casos con novedad</p>
          </div>
        </div>

        <div className="novedades-total">
          {novedades.length}
        </div>

        <div className="novedades-info">
          <div className="badge success">
            <FiCheckCircle />
            <span>Solucionadas</span>
            <strong>{solucionadas}</strong>
          </div>

          
        <div className="badge warning">
          <FiAlertTriangle />
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
        </div> 
        </div>

        {/*
      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${efectividad}%`,
          }}
        />
      </div>

      <p className="efectividad">
        {efectividad}% de efectividad
      </p> 

      </div>
*/}

    </section>
  );
}

export default ContactKPICards;