import dayjs from 'dayjs';
import { z } from 'zod';

export const dateTimeSchema = z
  .union([z.string().nonempty(), z.date()])
  .refine((val) => val && dayjs(val).isValid())
  .transform((val) => {
    return dayjs(val).toDate();
  });

export const dateTimeOptionalSchema = z
  .union([z.string().nullable(), z.date().nullable()])
  .refine((val) => !val || dayjs(val).isValid())
  .transform((val) =>
    val != undefined
      ? dayjs(val).isValid()
        ? dayjs(val).toDate()
        : null
      : undefined,
  )
  .optional();
