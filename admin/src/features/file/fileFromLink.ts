import { v4 as uuid } from 'uuid';

export function fileFromLink(link: string) {
  return {
    id: uuid(),
    filename: link,
    sizeInBytes: 0,
    publicUrl: link,
    downloadUrl: link,
  };
}
