import { LuDownload } from 'react-icons/lu';
import { FileUploaded } from 'src/features/file/fileSchemas';

export default function FileListItem({
  files,
}: {
  files?: FileUploaded[] | null;
}) {
  if (!files?.length) {
    return null;
  }

  return (
    <div>
      {files.map((file: FileUploaded) => {
        return (
          <div className="flex items-center" key={file.id}>
            <div className="flex items-center text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400">
              <a
                href={file.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-center gap-1"
              >
                <LuDownload className="h-4 w-4" />
                {file.filename}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
