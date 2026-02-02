import { NextRequest } from 'next/server';
import { fileDownloadFile } from 'src/features/file/fileService';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { appContext } from 'src/shared/controller/appContext';
import Error404 from 'src/shared/errors/Error404';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const { token, relativeFilePath } = Object.fromEntries(
      request.nextUrl.searchParams,
    );

    if (!relativeFilePath) {
      throw new Error404();
    }

    const { readStream, mimeType } = await fileDownloadFile(
      String(relativeFilePath),
      String(token),
    );

    // @ts-ignore
    return new Response(readStream, {
      headers: {
        'Content-Type': mimeType || 'text/plain',
      },
    });
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
