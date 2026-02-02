import dayjs from 'dayjs';
import { z } from 'zod';

export const dateSchema = z
  .string()
  .refine((val) => val && dayjs(val).isValid());

export const dateOptionalSchema = z
  .string()
  .nullable()
  .refine((val) => !val || dayjs(val).isValid())
  .optional();
