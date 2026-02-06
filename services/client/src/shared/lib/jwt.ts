import jwt from 'jsonwebtoken';

export function jwtSign(payload: any, expiresIn?: string | number | null) {
  let expiresInOrNull: string | number | null =
    expiresIn || process.env.AUTH_TOKEN_EXPIRES_IN;

  if (expiresInOrNull === Infinity) {
    expiresInOrNull = null;
  }

  return jwt.sign(
    payload,
    String(process.env.AUTH_TOKEN_SECRET),
    expiresInOrNull
      ? {
          expiresIn: expiresInOrNull,
        }
      : undefined,
  );
}


export function jwtVerify(token: string) {
  try {
    const payload: unknown = jwt.verify(
      token,
      String(process.env.AUTH_TOKEN_SECRET),
    );
    return payload as { id: string; iat: number };
  } catch (error) {
    return null;
  }
}
