import { times } from 'lodash';

export function testMockFilesArray(size: number) {
  return times(size).map((i) => ({
    id: 'file.png',
    filename: 'file.png',
    relativeFilePath: 'path/to/file.png',
    sizeInBytes: 1000,
    publicUrl: 'https://example.com/file.png',
  }));
}
