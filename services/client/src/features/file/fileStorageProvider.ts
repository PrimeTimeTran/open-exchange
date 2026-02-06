import fs from 'fs-extra';
import { FileAwsStorage } from 'src/features/file/fileAwsStorage';
import { FileGoogleCloudFileStorage } from 'src/features/file/fileGoogleCloudStorage';
import { FileLocalFileStorage } from 'src/features/file/fileLocalFileStorage';

export interface FileStorageProvider {
  uploadCredentials(
    relativeFilePath: string,
    maxSizeInBytes: number,
    publicRead: boolean,
    tokenExpiresAt?: Date,
  ): Promise<any>;

  downloadUrl(
    relativeFilePath: string,
    publicRead: boolean,
    tokenExpiresAt?: Date,
  ): Promise<any>;

  upload(fileBlob: Blob, relativeFilePath: string): Promise<any>;

  download(
    relativeFilePath: string,
    token: string,
  ): Promise<{ readStream: fs.ReadStream; mimeType: string | null }>;
}

export function fileStorageProvider(): FileStorageProvider {
  if (process.env.FILE_STORAGE_PROVIDER === 'gcp') {
    return new FileGoogleCloudFileStorage();
  }

  if (process.env.FILE_STORAGE_PROVIDER === 'aws') {
    return new FileAwsStorage();
  }

  if (process.env.FILE_STORAGE_PROVIDER === 'local') {
    return new FileLocalFileStorage();
  }

  throw new Error('FILE_STORAGE_PROVIDER not set');
}
