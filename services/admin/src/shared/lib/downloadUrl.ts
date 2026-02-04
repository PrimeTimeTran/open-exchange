export function downloadUrl(files: any, index = 0): string | undefined {
  if (!files) {
    return undefined;
  }

  if (!Array.isArray(files)) {
    if (!index) {
      return files?.downloadUrl;
    }

    return undefined;
  }

  // @ts-ignore
  return files?.[index]?.downloadUrl;
}
