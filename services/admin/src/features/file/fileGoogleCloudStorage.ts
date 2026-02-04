import { Bucket, Storage } from '@google-cloud/storage';
import { FileStorageProvider } from 'src/features/file/fileStorageProvider';

export class FileGoogleCloudFileStorage implements FileStorageProvider {
  bucket: Bucket;

  constructor() {
    if (process.env.GOOGLE_CLOUD_PLATFORM_CREDENTIALS) {
      const serviceAccount: any = JSON.parse(
        process.env.GOOGLE_CLOUD_PLATFORM_CREDENTIALS,
      );

      this.bucket = new Storage({
        projectId: serviceAccount.project_id,
        credentials: serviceAccount,
      }).bucket(String(process.env.FILE_STORAGE_BUCKET));
    } else {
      this.bucket = new Storage().bucket(
        String(process.env.FILE_STORAGE_BUCKET),
      );
    }
  }

  /**
   * Creates a signed upload URL that enables
   * the frontend to upload directly to GCS in a
   * secure way
   */
  async uploadCredentials(
    relativeFilePath: string,
    maxSizeInBytes: number,
    publicRead: boolean,
    tokenExpiresAt: Date,
  ) {
    const expires = tokenExpiresAt ? tokenExpiresAt.getTime() : Date.now() + 10 * 60 * 1000;

    const file = this.bucket.file(relativeFilePath);

    const conditions: Array<any> = [];
    const fields: any = {};

    if (maxSizeInBytes) {
      conditions.push(['content-length-range', 0, maxSizeInBytes]);
    }

    let publicUrl;

    if (publicRead) {
      fields.acl = 'public-read';
      publicUrl = await this.downloadUrl(relativeFilePath, publicRead);
    }

    const [policy] = await file.generateSignedPostPolicyV4({
      expires,
      virtualHostedStyle: true,
      conditions,
      fields,
    });

    return {
      ...policy,
      publicUrl,
    };
  }

  /**
   * Returns a signed download URL.
   */
  async downloadUrl(
    relativeFilePath: string,
    publicRead: boolean,
    tokenExpiresAt?: Date,
  ) {
    if (publicRead) {
      return `https://storage.googleapis.com/${process.env.FILE_STORAGE_BUCKET}/${relativeFilePath}`;
    }

    const expires = tokenExpiresAt ? tokenExpiresAt.getTime() : Date.now() + 10 * 60 * 1000;

    const response = await this.bucket.file(relativeFilePath).getSignedUrl({
      action: 'read',
      expires,
      version: 'v4',
    });

    if (response && response[0]) {
      return response[0];
    }

    return response;
  }

  upload(fileBlob: Blob, relativeFilePath: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  download(relativeFilePath: string, token: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
