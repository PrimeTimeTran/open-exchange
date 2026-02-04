export function jsonToString(arg: unknown) {
  return JSON.stringify(
    arg,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
    2,
  );
}
