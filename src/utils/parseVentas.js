import * as XLSX from "xlsx";

export const parseVentas = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!worksheet) {
          resolve([]);
          return;
        }

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });
        const normalize = (value) => String(value || "")
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");

        const headerIndex = rows.findIndex((row) => {
          const headers = row.map(normalize);
          return headers.includes("marca");
        });

        if (headerIndex < 0) {
          resolve([]);
          return;
        }

        const headers = rows[headerIndex].map((header, index) =>
          String(header || `columna${index}`).trim()
        );
        const ventas = rows.slice(headerIndex + 1)
          .filter((row) => row.some((value) => String(value || "").trim() !== ""))
          .map((row) => headers.reduce((item, header, index) => {
            item[header] = row[index] ?? "";
            return item;
          }, {}));

        resolve(ventas);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo de ventas"));
    reader.readAsBinaryString(file);
  });
};