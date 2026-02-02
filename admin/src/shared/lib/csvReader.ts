import { zipObject } from 'lodash';
import Papa from 'papaparse';
import { cleanObjectForServerComponent } from 'src/shared/lib/mapObjectForServerComponent';
import { objectRemoveEmptyNullAndUndefined } from 'src/shared/lib/objectRemoveEmptyNullAndUndefined';

export async function csvReader(file: File, headers: string[]) {
  const content = await readFile(file);

  if (content) {
    const result = Papa.parse(content, {
      skipEmptyLines: 'greedy',
    });

    if (!result?.data?.length) {
      if (result.errors.length) {
        throw result.errors[0];
      }

      return [];
    }

    const data = result.data.slice(1);
    const parsedData = data.map((item: any) => zipObject(headers, item));
    return parsedData.map((item) => objectRemoveEmptyNullAndUndefined(item));
  }

  return [];
}

async function readFile(file: File) {
  if (!file) {
    return null;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (!e || !e.target) {
          reject(new Error());
          return;
        }

        resolve(e.target.result as string);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (e) => {
      reject();
    };

    reader.readAsText(file);
  });
}
