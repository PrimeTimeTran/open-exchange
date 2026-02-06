import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileStorageProvider } from 'src/features/file/fileStorageProvider';
import dayjs from 'dayjs';

export class FileAwsStorage implements FileStorageProvider {
  s3: S3;

  constructor() {
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      region: process.env.AWS_REGION || '',
    });
  }

  /**
   * Creates a signed upload URL that enables
   * the frontend to upload directly to S3 in a
   * secure way
   */
  async uploadCredentials(
    relativeFilePath: string,
    maxSizeInBytes: number,
    publicRead: boolean,
    tokenExpiresAt: Date,
  ) {
    const expires = tokenExpiresAt
      ? dayjs(tokenExpiresAt).diff(dayjs(), 'seconds')
      : 3600;

    const Conditions: Array<any> = [];

    if (maxSizeInBytes) {
      Conditions.push(['content-length-range', 0, maxSizeInBytes]);
    }

    let publicUrl;

    const Fields: any = { key: relativeFilePath };

    if (publicRead) {
      Fields.acl = 'public-read';
      Conditions.push({ acl: 'public-read' });
      publicUrl = await this.downloadUrl(relativeFilePath, publicRead);
    }

    const policy = await createPresignedPost(this.s3, {
      Key: relativeFilePath,
      Bucket: process.env.FILE_STORAGE_BUCKET || '',
      Fields,
      Expires: Number(expires),
      Conditions,
    });

    return {
      ...policy,
      publicUrl,
    };
  }

  /**
   * Returns a signed download URL
   */
  async downloadUrl(relativeFilePath: string, publicRead: boolean) {
    if (publicRead) {
      return `https://${process.env.FILE_STORAGE_BUCKET}.s3.amazonaws.com/${relativeFilePath}`;
    }

    const params = {
      Bucket: process.env.FILE_STORAGE_BUCKET,
      Key: relativeFilePath,
    };
    const command = new GetObjectCommand(params);
    return await getSignedUrl(this.s3, command);
  }

  upload(fileBlob: Blob, relativeFilePath: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  download(relativeFilePath: string, token: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
