import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Account, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { accountEnumerators } from 'src/features/account/accountEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Order } from '@prisma/client';
import { Wallet } from '@prisma/client';
import { Deposit } from '@prisma/client';
import { Withdrawal } from '@prisma/client';
import { BalanceSnapshot } from '@prisma/client';

extendZodWithOpenApi(z);

export const accountFindSchema = z.object({
  id: z.string(),
});

export const accountFilterFormSchema = z
  .object({
    name: z.string(),
    isSystem: z.string().nullable().optional(),
    type: z.nativeEnum(accountEnumerators.type).nullable().optional(),
    status: z.nativeEnum(accountEnumerators.status).nullable().optional(),
    isInterest: z.string().nullable().optional(),
    interestRateRange: z.array(z.coerce.number()).max(2),
    archived: z
    .any()
    .transform((val) =>
      val != null && val !== ''
        ? val === 'true' || val === true
          ? true
          : null
        : null,
    ),
  })
  .partial();

export const accountFilterInputSchema = accountFilterFormSchema
  .merge(
    z.object({
      isSystem: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
      isInterest: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const accountFindManyInputSchema = z.object({
  filter: accountFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const accountDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const accountArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const accountRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const accountAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const accountAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const accountCreateInputSchema = z.object({
  name: z.string().trim().nullable().optional(),
  isSystem: z.boolean().default(false),
  type: z.nativeEnum(accountEnumerators.type),
  status: z.nativeEnum(accountEnumerators.status).nullable().optional(),
  isInterest: z.boolean().default(false),
  interestRate: numberOptionalCoerceSchema(z.number().nullable().optional()),
  meta: jsonSchema.optional(),
  user: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const accountImportInputSchema =
  accountCreateInputSchema.merge(importerInputSchema);

export const accountImportFileSchema = z
  .object({
    name: z.string(),
    isSystem: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    type: z.string(),
    status: z.string(),
    isInterest: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    interestRate: z.string(),
    meta: z.string(),
    user: z.string(),
  })
  .partial();

export const accountUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const accountUpdateBodyInputSchema =
  accountCreateInputSchema.partial();

export interface AccountWithRelationships extends Account {
  user?: Membership;
  orders?: Order[];
  wallets?: Wallet[];
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
  snapshots?: BalanceSnapshot[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
