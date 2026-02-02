import { filesize } from 'filesize';
import { NextRequest } from 'next/server';
import { queryToObject } from 'src/shared/lib/queryToObject';
import { fileUploadFile } from 'src/features/file/fileService';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import Error403 from 'src/shared/errors/Error403';
import Error404 from 'src/shared/errors/Error404';
import { Logger } from 'src/shared/lib/Logger';
import { jwtVerify } from 'src/shared/lib/jwt';
import { formatTranslation } from 'src/translation/formatTranslation';

export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);

    if (!query.token) {
      throw new Error403();
    }

    let storage: {
      relativeFilePath: string;
      maxSizeInBytes: number;
    };

    try {
      // @ts-ignore
      storage = jwtVerify(query.token);
    } catch (error) {
      Logger.warn(error);
      throw new Error403();
    }

    let { relativeFilePath, maxSizeInBytes } = storage;

    const formData = await request.formData();
    const fields = Object.fromEntries<any>(formData);
    const filename = String(fields.filename);
    const fileBlob = fields.file;

    if (!filename) {
      throw new Error404();
    }

    if (fields.file.size > maxSizeInBytes) {
      throw new Error400(
        formatTranslation(
          context.dictionary.file.errors.tooBig,
          filesize(fields.file.size),
          filesize(maxSizeInBytes),
        ),
      );
    }

    const downloadUrl = await fileUploadFile(fileBlob, relativeFilePath);
    const payload = { downloadUrl };

    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
