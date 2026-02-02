import fs from 'fs-extra';
import mime from 'mime';
import os from 'os';
import path from 'path';
import { FileStorageProvider } from 'src/features/file/fileStorageProvider';
import Error403 from 'src/shared/errors/Error403';
import { jwtSign, jwtVerify } from 'src/shared/lib/jwt';

export class FileLocalFileStorage implements FileStorageProvider {
  UPLOAD_DIR = process.env.FILE_STORAGE_LOCAL_FOLDER || os.tmpdir();

  async uploadCredentials(
    relativeFilePath: string,
    maxSizeInBytes: number,
    publicRead: boolean,
    tokenExpiresAt: Date,
  ) {
    const expires = tokenExpiresAt || Date.now() + 10 * 60 * 1000;

    const token = jwtSign(
      { relativeFilePath, maxSizeInBytes },
      Number(expires),
    );

    return {
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/file/local-upload?token=${token}`,
    };
  }

  async upload(fileBlob: Blob, relativeFilePath: string, publicRead?: boolean) {
    const internalUrl = path.join(this.UPLOAD_DIR, relativeFilePath);
    if (!this.isPathInsideUploadDir(internalUrl)) {
      throw new Error403();
    }
    ensureDirectoryExistence(internalUrl);
    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    await fs.writeFile(internalUrl, buffer);
    return this.downloadUrl(relativeFilePath, publicRead);
  }

  async downloadUrl(
    relativeFilePath: string,
    publicRead?: boolean,
    tokenExpiresAt?: Date,
  ) {
    const expires = tokenExpiresAt || Date.now() + 10 * 60 * 1000;

    let token;

    if (publicRead) {
      // For public read, the token never expires
      token = jwtSign({ relativeFilePath }, Infinity);
    } else {
      token = jwtSign({ relativeFilePath }, Number(expires));
    }

    return `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/file/local-download?token=${token}&relativeFilePath=${relativeFilePath}`;
  }

  async download(relativeFilePath: string, token: string) {
    const decodedToken = jwtVerify(token) as any;

    if (decodedToken.relativeFilePath !== relativeFilePath) {
      throw new Error403();
    }

    let finalPath = path.join(this.UPLOAD_DIR, relativeFilePath);
    if (!this.isPathInsideUploadDir(finalPath)) {
      throw new Error403();
    }
    const readStream = fs.createReadStream(finalPath);

    return {
      readStream,
      mimeType: mime.getType(finalPath),
    };
  }

  isPathInsideUploadDir(relativeFilePath: string) {
    const uploadUrlWithSlash = this.UPLOAD_DIR.endsWith(path.sep)
      ? this.UPLOAD_DIR
      : `${this.UPLOAD_DIR}${path.sep}`;
    return relativeFilePath.indexOf(uploadUrlWithSlash) === 0;
  }
}

function ensureDirectoryExistence(filePath: string) {
  var dirname = path.dirname(filePath);

  if (fs.existsSync(dirname)) {
    return true;
  }

  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}
