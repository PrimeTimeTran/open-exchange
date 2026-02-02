export function enumeratorLabel(
  enumeratorDictionary: Record<string, string>,
  value: string | null | undefined,
): string {
  return value ? enumeratorDictionary[value] || value : '';
}
