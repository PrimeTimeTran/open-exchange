import { FileUploaded } from 'src/features/file/fileSchemas';

export function fileLabel(file?: FileUploaded | null) {
  return file?.filename;
}
