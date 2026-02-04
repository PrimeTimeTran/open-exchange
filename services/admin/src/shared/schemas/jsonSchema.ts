import { z } from 'zod';

export const jsonSchema = z.string().refine((val) => {
  if (!val) {
    return true;
  }

  try {
    JSON.parse(val);
    return true;
  } catch (e) {
    return false;
  }
});
