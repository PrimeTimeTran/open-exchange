import { filesize } from 'filesize';
import { fileCredentialsApiCall } from 'src/features/file/fileApiCalls';
import { StorageConfig } from 'src/features/storage';
import { Logger } from 'src/shared/lib/Logger';
import { formatTranslation } from 'src/translation/formatTranslation';
import { Dictionary } from 'src/translation/locales';
import { v4 as uuid } from 'uuid';

export interface FileUploaderConfig {
  image?: boolean;
  storage: StorageConfig;
  dictionary: Dictionary;
  formats?: string[];
}

export class FileUploader {
  static validate(file: File, config: FileUploaderConfig) {
    if (!config) {
      return;
    }

    if (config.image) {
      if (!file.type.startsWith('image')) {
        throw new Error(config.dictionary.file.errors.notImage);
      }
    }

    if (
      config.storage.maxSizeInBytes &&
      file.size > config.storage.maxSizeInBytes
    ) {
      throw new Error(
        formatTranslation(
          config.dictionary.file.errors.tooBig,
          filesize(file.size),
          filesize(config.storage.maxSizeInBytes),
        ),
      );
    }

    const extension = extractExtensionFrom(file.name);

    if (config.formats && (!extension || !config.formats.includes(extension))) {
      throw new Error(
        formatTranslation(
          config.dictionary.file.errors.formats,
          config.formats.join(', '),
        ),
      );
    }
  }

  static async upload(file: File, config: FileUploaderConfig) {
    this.validate(file, config);

    const extension = extractExtensionFrom(file.name);
    const id = uuid();
    const filename = `${id}.${extension}`;

    const { uploadCredentials, downloadUrl, relativeFilePath } =
      await fileCredentialsApiCall(filename, config.storage.id);

    await this.uploadToServer(file, uploadCredentials);

    return {
      id: id,
      filename: file.name,
      sizeInBytes: file.size,
      publicUrl: uploadCredentials?.publicUrl,
      relativeFilePath,
      downloadUrl,
    };
  }

  static async uploadToServer(
    file: File,
    uploadCredentials: {
      url: string;
      fields?: object;
    },
  ) {
    try {
      const url = uploadCredentials.url;
      const formData = new FormData();

      for (const [key, value] of Object.entries(
        uploadCredentials.fields || {},
      )) {
        formData.append(key, value as string);
      }
      formData.append('file', file);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Network response was not ok. Status: ${response.status}, StatusText: ${response.statusText}, ResponseBody: ${text}`,
        );
      }
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}

function extractExtensionFrom(filename: string) {
  if (!filename) {
    return null;
  }

  const regex = /(?:\.([^.]+))?$/;
  const exec = regex.exec(filename);

  if (!exec) {
    return null;
  }

  return exec[1];
}
