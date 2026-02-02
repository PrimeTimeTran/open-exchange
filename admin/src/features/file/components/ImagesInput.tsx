'use client';

import { useRef, useState } from 'react';
import { LuLoader2, LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { FileUploader } from 'src/features/file/fileUploader';
import { ImageDialog } from 'src/features/file/components/ImageDialog';
import { StorageConfig } from 'src/features/storage';
import { Button } from 'src/shared/components/ui/button';
import { toast } from 'src/shared/components/ui/use-toast';
import { Dictionary } from 'src/translation/locales';

export function ImagesInput({
  readonly,
  max,
  formats,
  storage,
  value,
  onChange,
  dictionary,
  disabled,
}: {
  value: any;
  onChange?: (value: Array<FileUploaded> | null | undefined) => void;
  dictionary: Dictionary;
  storage?: StorageConfig;
  readonly?: boolean;
  max?: number;
  formats?: string[];
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [imageToPreview, setImageToPreview] = useState<{
    src: string;
    alt: string;
  }>();
  const input = useRef<any>();
  const [mouseOver, setMouseOver] = useState<string>('');

  const handleRemove = (id: string) => {
    onChange &&
      onChange(
        value?.filter((fileUploaded: FileUploaded) => fileUploaded.id !== id),
      );
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
              image: true,
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

  const doPreviewImage = (image: FileUploaded) => {
    if (!image.downloadUrl) {
      throw new Error('Image downloadUrl is empty');
    }

    setImageToPreview({
      src: image.downloadUrl,
      alt: image.filename,
    });
  };

  const doCloseImageModal = () => {
    setImageToPreview(undefined);
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
              accept={formatsCommaSeparated ? formatsCommaSeparated : 'image/*'}
              type="file"
              onChange={handleChange}
              ref={input}
              multiple={filesLeft > 1}
            />
          </label>
        </Button>
      )}

      {value?.length ? (
        <div className="mt-2 flex flex-row flex-wrap">
          {value.map((fileUploaded: FileUploaded) => {
            return (
              <div
                className="mb-2 mr-2 rounded-md"
                style={{ height: '104px' }}
                key={fileUploaded.id}
                onMouseEnter={() => setMouseOver(fileUploaded.id)}
                onMouseLeave={() => setMouseOver('')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={fileUploaded.filename}
                  src={fileUploaded.downloadUrl}
                  className="rounded-md"
                  style={{
                    width: '104px',
                    height: '104px',
                    objectFit: 'cover',
                  }}
                />

                <div
                  className="relative items-center justify-center gap-3 rounded-b-md p-2"
                  style={{
                    display: mouseOver === fileUploaded.id ? 'flex' : 'none',
                    bottom: '2.25rem',
                    width: '104px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <button
                    type="button"
                    className="text-white"
                    onClick={() => doPreviewImage(fileUploaded)}
                  >
                    <LuSearch className="h-5 w-5" />
                  </button>

                  {!readonly && (
                    <button
                      type="button"
                      className="text-white"
                      onClick={() => handleRemove(fileUploaded.id)}
                      disabled={loading || disabled}
                    >
                      <LuX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {imageToPreview && (
        <ImageDialog
          src={imageToPreview.src}
          alt={imageToPreview.alt}
          onClose={() => doCloseImageModal()}
        />
      )}
    </div>
  );
}
