const bcrypt = require('bcryptjs');

export async function hashSecret(secret: string) {
  return await bcrypt.hash(secret, 12);
}
