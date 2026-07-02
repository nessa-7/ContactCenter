import * as XLSX from "xlsx";

import Holidays from "date-holidays";

const hd = new Holidays("CO");

export const parseContactCenter = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(
        e.target.result,
        {
          type: "binary",
        }
      );


      const getSheet = (name) => {
        const sheet =
          workbook.Sheets[name];

        if (!sheet) return [];

        return XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: "",
          }
        );
      };

      const excelDateToJSDate = (excelDate) => {
        return new Date(
          (excelDate - 25569) * 86400 * 1000
        );
      };


      const contarDiasHabiles = (inicio, fin) => {
        let dias = 0;

        const actual = new Date(inicio);

        while (actual <= fin) {
          const diaSemana = actual.getDay();

          const esFinSemana =
            diaSemana === 0 || diaSemana === 6;

          const esFestivo =
            hd.isHoliday(actual);

          const fechaTexto =
            actual.toLocaleDateString("es-CO");

          if (
            !esFinSemana &&
            !esFestivo
          ) {
            dias++;


          } else {
            console.log(
              "❌ Excluido:",
              fechaTexto,
              esFestivo
                ? hd.isHoliday(actual)
                : "Fin de semana"
            );
          }

          actual.setDate(
            actual.getDate() + 1
          );
        }

        console.log(
          "Total hábiles:",
          dias
        );

        return dias;
      };

      const baseCasos = getSheet("Base_Casos").map((row) => {
        const fechaIngreso = row["Fecha ingreso"];
        const fechaFin = row["Fecha fin"];

        let diasCierre = null;
        let diasResolucion = 0;

        if (fechaIngreso) {
          const inicio =
            typeof fechaIngreso === "number"
              ? excelDateToJSDate(fechaIngreso)
              : new Date(fechaIngreso);

          const fechaFinalCalculo =
            fechaFin
              ? (
                typeof fechaFin === "number"
                  ? excelDateToJSDate(fechaFin)
                  : new Date(fechaFin)
              )
              : new Date();

          diasResolucion =
            contarDiasHabiles(
              inicio,
              fechaFinalCalculo
            );

          if (fechaFin) {
            diasCierre = diasResolucion;
          }
        }

        return {
          ...row,

          diasResolucion,

          diasCierre,
        };
      });
      console.log(baseCasos[0]);

      console.log(
        "Primeros casos:",
        baseCasos.slice(0, 5)
      );

      const campañasSheet =
        workbook.Sheets["Campañas"];

      let campañas = [];

      if (campañasSheet) {
        const rows = XLSX.utils.sheet_to_json(
          campañasSheet,
          {
            header: 1,
            defval: "",
          }
        );

        let fechaActual = "";

        rows.forEach((row) => {
          const primeraCol = String(
            row[0] || ""
          ).trim();

          if (
            primeraCol.includes(
              "Fecha de Envio"
            )
          ) {
            fechaActual = primeraCol
              .replace(
                "Fecha de Envio:",
                ""
              )
              .trim();

            return;
          }

          if (
            !primeraCol ||
            primeraCol === "Tipo"
          )
            return;

          campañas.push({
            fecha: fechaActual,
            tipo: row[0] || "",
            cedula: row[1] || "",
            telefono: row[2] || "",
            nombre: row[3] || "",
            enviado: row[4] || "",
            respuesta:
              row[5] || "",
            observacion:
              row[6] || "",
          });
        });
      }
      const novedadesSheet =
        workbook.Sheets["Novedades"];

      let noCompletoFlujo = [];
      let fueraGarantia = [];

      if (novedadesSheet) {
        const novedadesRaw =
          XLSX.utils.sheet_to_json(
            novedadesSheet,
            {
              header: 1,
              defval: "",
            }
          );

        for (
          let i = 2;
          i < novedadesRaw.length;
          i++
        ) {
          const row =
            novedadesRaw[i];

          // TABLA IZQUIERDA

          if (row[4]) {
            noCompletoFlujo.push({
              fechaIngreso:
                row[0],
              nombre:
                row[1],
              cedula:
                row[2],
              telefono:
                row[3],
              observacion:
                row[4],
              fechaCampaña:
                row[5],
              nota:
                row[6],
              estado: row[7],
            });
          }

          // TABLA DERECHA

          if (row[12]) {
            fueraGarantia.push({
              fechaIngreso:
                row[8],
              nombre:
                row[9],
              cedula:
                row[10],
              telefono:
                row[11],
              observacion:
                row[12],
              nota:
                row[13],
            });
          }
        }
      }

      resolve({
        baseCasos,
        campañas,
        noCompletoFlujo,
        fueraGarantia,
      });
    };

    reader.readAsBinaryString(file);
  });
};