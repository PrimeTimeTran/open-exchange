import { useRef, useState } from 'react';
import { LuDownload, LuLoader2, LuPlus, LuX } from 'react-icons/lu';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { FileUploader } from 'src/features/file/fileUploader';
import { StorageConfig } from 'src/features/storage';
import { Button } from 'src/shared/components/ui/button';
import { toast } from 'src/shared/components/ui/use-toast';
import { Dictionary } from 'src/translation/locales';

export function FilesInput({
  readonly,
  max,
  formats,
  storage,
  value,
  onChange,
  dictionary,
  disabled,
}: {
  readonly?: boolean;
  max?: number;
  formats?: string[];
  storage: StorageConfig;
  value: any;
  onChange: (value: Array<FileUploaded> | null | undefined) => void;
  dictionary: Dictionary;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const input = useRef<any>();

  const valueAsArray = value ? (Array.isArray(value) ? value : [value]) : [];

  const handleRemove = (id: string) => {
    onChange(valueAsArray.filter((uploadedFile) => uploadedFile.id !== id));
  };

  const handleChange = async (event: {
    target: {
      files: FileList | null;
    };
  }) => {
    if (!storage) {
      return;
    }

    try {
      const files = event.target.files;

      if (!files?.length) {
        return;
      }

      for (let file of Array.from(files)) {
        FileUploader.validate(file, {
          storage,
          formats,
          dictionary,
        });
      }

      setLoading(true);

      const uploadedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            return await FileUploader.upload(file, {
              storage,
              formats,
              dictionary,
            });
          } catch (error: any) {
            console.error(error);
            toast({
              description: error?.message || dictionary.shared.errors.unknown,
              variant: 'destructive',
            });
            return null;
          }
        }),
      );

      input.current.value = '';

      setLoading(false);
      onChange && onChange([...value, ...uploadedFiles.filter(Boolean)]);
    } catch (error: any) {
      input.current.value = '';
      console.error(error);
      setLoading(false);
      toast({
        description: error?.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    }
  };

  const formatsCommaSeparated = formats
    ?.map((format) => `.${format}`)
    .join(',');

  const filesLeft = max ? max - value?.length : Infinity;

  return (
    <div>
      {readonly || filesLeft <= 0 ? null : (
        <Button
          className="cursor-pointer"
          disabled={loading || disabled}
          asChild
          variant={'secondary'}
        >
          <label>
            {loading ? (
              <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LuPlus className="mr-2 h-4 w-4 " />
            )}
            {dictionary.file.button}
            <input
              style={{ display: 'none' }}
              disabled={loading || readonly}
              accept={formatsCommaSeparated}
              type="file"
              onChange={handleChange}
              ref={input}
              multiple={filesLeft > 1}
            />
          </label>
        </Button>
      )}

      {valueAsArray?.length ? (
        <div className="mt-2">
          {valueAsArray.map((item: FileUploaded) => {
            return (
              <div className="flex items-center" key={item.id}>
                <div className="flex items-center text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400">
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-center gap-1"
                  >
                    <LuDownload className="h-4 w-4" />
                    {item.filename}
                  </a>
                </div>

                {!readonly && (
                  <Button
                    type="button"
                    variant={'secondary'}
                    size={'sm'}
                    onClick={() => handleRemove(item.id)}
                    title={dictionary.file.delete}
                    className="ml-2"
                    disabled={loading || disabled}
                  >
                    <LuX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
