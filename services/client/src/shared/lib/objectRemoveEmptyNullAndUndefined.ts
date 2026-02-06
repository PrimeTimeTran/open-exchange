export function objectRemoveEmptyNullAndUndefined(
  obj: Record<string, any>,
): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        cleaned[key] = obj[key];
      }
    }
  }

  return cleaned;
}
