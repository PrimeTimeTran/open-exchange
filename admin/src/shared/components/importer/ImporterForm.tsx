import md5 from 'md5';
import { useRef, useState } from 'react';
import { LuFile, LuPlus } from 'react-icons/lu';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';
import { csvExporterTemplate } from 'src/shared/lib/csvExporter';
import { csvReader } from 'src/shared/lib/csvReader';
import { IMPORTER_STATUS } from 'src/shared/schemas/importerSchemas';
import { ZodSchema, z } from 'zod';

export function ImporterForm({
  context,
  fileSchema,
  validationSchema,
  keys,
  labels,
  setRows,
}: {
  context: AppContext;
  fileSchema: ZodSchema;
  validationSchema: ZodSchema;
  keys: string[];
  labels: Record<string, string>;
  setRows: (rows: any[]) => void;
}) {
  const input = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');

  function doDownloadTemplate() {
    csvExporterTemplate(keys, labels, 'template.csv');
  }

  async function doReadFile(file: File) {
    setErrorMessage('');
    try {
      const rawData = await csvReader(file, keys);

      if (!rawData?.length) {
        setErrorMessage(
          context.dictionary.shared.importer.errors.invalidFileEmpty,
        );
        return;
      }

      let data = z.array(fileSchema).parse(rawData);

      data = data.map((item, index) => {
        return {
          _line: index + 1,
          ...item,
          importHash: md5(JSON.stringify(item)),
        };
      });

      const rows = data.map((row) => {
        let _status: IMPORTER_STATUS = 'pending';

        const validation = validationSchema.safeParse(row);

        if (!validation.success) {
          const _errorMessages = validation.error.errors.map((error) => {
            return `${labels[error.path[0]] || error.path[0]}: ${
              error.message
            }`;
          });

          _status = 'error';

          return {
            ...row,
            _status,
            _errorMessages,
          };
        }

        return { ...row, _status };
      });

      setRows(rows);
    } catch (error) {
      setErrorMessage(
        context.dictionary.shared.importer.errors.invalidFileEmpty,
      );
      setRows([]);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Button className="cursor-pointer" asChild variant={'default'}>
          <label>
            <LuPlus className="mr-2 h-4 w-4 " />
            {context.dictionary.file.button}
            <input
              style={{ display: 'none' }}
              accept={'.csv'}
              type="file"
              onChange={async (event) => {
                const files = event.target.files;

                if (!files || !files.length) {
                  return;
                }

                let file = files[0];

                if (file) {
                  await doReadFile(file);
                }

                event.target.value = '';
              }}
              ref={input}
            />
          </label>
        </Button>

        <Button variant={'secondary'} onClick={doDownloadTemplate}>
          <LuFile className="mr-2 h-4 w-4 " />
          {context.dictionary.shared.importer.form.downloadTemplate}
        </Button>
      </div>

      <div className="mt-2 text-sm text-red-600">{errorMessage}</div>
    </div>
  );
}
