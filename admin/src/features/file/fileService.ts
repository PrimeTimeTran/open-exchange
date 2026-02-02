import { fileStorageProvider } from 'src/features/file/fileStorageProvider';

export async function fileDownloadFile(
  relativeFilePath: string,
  token: string,
) {
  return fileStorageProvider().download(relativeFilePath, token);
}

export async function fileUploadFile(fileBlob: Blob, relativeFilePath: string) {
  return fileStorageProvider().upload(fileBlob, relativeFilePath);
}

/**
 * Download URLs expire, so they have to be generated on demand for each request.
 * This method scans the object or array and populates the downloadUrl property.
 */
export async function filePopulateDownloadUrlInTree(objectOrArray: any) {
  if (!objectOrArray) {
    return objectOrArray;
  }

  function catchFileInTree(currentObject: any, output: Array<any>): any {
    var result = null;
    if (currentObject instanceof Array) {
      for (var i = 0; i < currentObject.length; i++) {
        result = catchFileInTree(currentObject[i], output);
      }
    } else {
      for (var prop in currentObject) {
        const hasFilename = Boolean(currentObject['filename']);
        if (
          (prop == 'relativeFilePath' || prop == 'publicUrl') &&
          hasFilename
        ) {
          if (currentObject[prop] != null) {
            output.push(currentObject);
            return null;
          }
        }
        if (
          currentObject[prop] instanceof Object ||
          currentObject[prop] instanceof Array
        )
          result = catchFileInTree(currentObject[prop], output);
      }
    }
    return result;
  }

  let files: Array<any> = [];
  catchFileInTree(objectOrArray, files);
  await Promise.all(files.map((file) => _filePopulateDownloadUrlOfFiles(file)));

  return objectOrArray;
}

async function _filePopulateDownloadUrlOfFiles(file: any) {
  if (file?.publicUrl) {
    file.downloadUrl = file.publicUrl;
  }

  if (file?.relativeFilePath) {
    file.downloadUrl = await fileStorageProvider().downloadUrl(
      file.relativeFilePath,
      false,
    );
  }
}
