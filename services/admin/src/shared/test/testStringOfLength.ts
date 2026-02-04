export function testStringOfLength(length: number, char = 'a') {
  return new Array(length + 1).join(char);
}
