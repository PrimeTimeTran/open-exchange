const bcrypt = require('bcryptjs');

export async function isHashEqual(
  hashA: string | null | undefined,
  hashB: string | null | undefined,
) {
  return await bcrypt.compare(hashA, hashB);
}
