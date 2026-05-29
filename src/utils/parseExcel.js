import * as XLSX from "xlsx";

export const parseExcel = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      const workbook = XLSX.read(data, {
        type: "binary",
      });

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const json =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );

      resolve(json);
    };

    reader.readAsBinaryString(file);
  });
};