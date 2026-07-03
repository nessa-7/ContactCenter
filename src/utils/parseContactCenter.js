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

        if (!sheet) {
          const allSheets = Object.keys(workbook.Sheets);
          console.log(`❌ Hoja "${name}" no encontrada.`);
          console.log("🔍 Todas las hojas disponibles:");
          allSheets.forEach((sheetName, index) => {
            console.log(`   ${index + 1}. "${sheetName}" (length: ${sheetName.length})`);
          });
          return [];
        }

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


          }

          actual.setDate(
            actual.getDate() + 1
          );
        }

        

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

      const encuesta = getSheet("Encuesta");
      
      // Si no encuentra "Encuesta", busca una hoja que contenga "encuesta" en el nombre
      let finalEncuesta = encuesta;
      if (encuesta.length === 0) {
        console.log("🔍 Buscando hoja 'Encuesta' con búsqueda flexible...");
        const allSheets = Object.keys(workbook.Sheets);
        const encuestaSheet = allSheets.find(
          (sheet) => sheet.toLowerCase().includes("encuesta")
        );
        if (encuestaSheet) {
          console.log(`✅ Encontrada hoja: "${encuestaSheet}"`);
          finalEncuesta = XLSX.utils.sheet_to_json(
            workbook.Sheets[encuestaSheet],
            { defval: "" }
          );
        } else {
          console.log("❌ No se encontró hoja con 'encuesta' en el nombre");
          console.log("🔍 DEBUG: Listando todas las hojas y su contenido:");
          const allSheets = Object.keys(workbook.Sheets);
          allSheets.forEach((sheetName) => {
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
            console.log(`📄 Hoja: "${sheetName}" - Registros: ${data.length}`);
            if (data.length > 0) {
              const allColumns = Object.keys(data[0]);
              console.log(`   Todas las columnas (${allColumns.length}):`, allColumns);
              console.log(`   Primer registro:`, data[0]);
            }
          });
        }
      }
      
      console.log("📋 Encuesta cargada:", finalEncuesta);
      console.log("📋 Número de registros:", finalEncuesta.length);
      if (finalEncuesta.length > 0) {
        console.log("📋 Primera fila:", finalEncuesta[0]);
        console.log("📋 Columnas:", Object.keys(finalEncuesta[0]));
      }

      resolve({
        baseCasos,
        campañas,
        noCompletoFlujo,
        fueraGarantia,
        encuesta: finalEncuesta,
      });
    };

    reader.readAsBinaryString(file);
  });
};