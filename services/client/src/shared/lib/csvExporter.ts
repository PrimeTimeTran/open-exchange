import FileSaver from 'file-saver';
import { mapKeys } from 'lodash';
import Papa from 'papaparse';

const CSV_TYPE_WITH_CHARSET = 'text/csv;charset=utf-8';

export function csvExporter(
  data: Record<string, string | null | undefined>[],
  headers: Record<string, string>,
  fileName: string,
) {
  const dataWithHeaders = data.map((item) => {
    return mapKeys(item, (value, key) => headers[key] || key);
  });
  const csv = Papa.unparse(dataWithHeaders);
  saveAsCsv(csv, fileName);
}

export function csvExporterTemplate(
  keys: string[],
  labels: Record<string, string>,
  fileName: string,
) {
  const data = [keys.map((key) => labels[key])];
  const csv = Papa.unparse(data);
  saveAsCsv(csv, fileName);
}

function saveAsCsv(buffer: any, fileName: string) {
  const data = new Blob([buffer], {
    type: CSV_TYPE_WITH_CHARSET,
  });
  FileSaver.saveAs(data, `${fileName}.csv`);
}
