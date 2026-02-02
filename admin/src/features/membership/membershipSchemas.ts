import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Membership, Tenant, User } from '@prisma/client';
import { toLower } from 'lodash';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { roles } from 'src/features/roles';
import { dateTimeSchema } from 'src/shared/schemas/dateTimeSchema';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';

extendZodWithOpenApi(z);

export interface MembershipWithTenant extends Membership {
  tenant?: Partial<Tenant>;
}

export interface MembershipWithUser extends Membership {
  user?: Partial<User>;
}

export const membershipAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ fullName: 'asc' }),
});

export const membershipAutocompleteOutputSchema = z.array(
  z.object({
    id: z.string(),
    fullName: z.string().optional().nullable(),
    user: z.object({
      id: z.string(),
      email: z.string(),
    }),
  }),
);

export const membershipFilterFormSchema = z
  .object({
    email: z.string(),
    fullName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.nativeEnum(roles)),
    statuses: z.array(
      z.enum([
        MembershipStatus.active,
        MembershipStatus.invited,
        MembershipStatus.disabled,
      ]),
    ),
    createdAtRange: z.array(dateTimeSchema).max(2),
  })
  .partial();

export const membershipAcceptInvitationInputSchema = z.object({
  token: z.string().trim(),
  forceAcceptOtherEmail: z.boolean().default(false),
});

export const membershipCreateInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .email()
    .transform(toLower)
    .openapi({ type: 'string', format: 'email' }),
  firstName: z.string().trim().max(255).optional(),
  lastName: z.string().trim().max(255).optional(),
  avatars: z.array(fileUploadedSchema).optional(),
  roles: z.array(z.nativeEnum(roles)).min(1),
  importHash: z.string().optional(),
});

export const membershipDeclineInvitationInputSchema = z.object({
  token: z.string().trim(),
});

export const membershipDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const membershipFindInputSchema = z.object({
  id: z.string(),
});

export const membershipFindManyInputSchema = z.object({
  filter: membershipFilterFormSchema.optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const membershipImportFileSchema = z
  .object({
    avatars: z.string(),
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    roles: z.string().transform((val) => val.split(' ').filter(Boolean)),
  })
  .partial();

export const membershipImportInputSchema =
  membershipCreateInputSchema.merge(importerInputSchema);

export const membershipResendInvitationEmailInputSchema = z.object({
  id: z.string(),
});

export const membershipUpdateParamsSchema = z.object({
  id: z.string(),
});

export const membershipUpdateInputSchema = z.object({
  firstName: z.string().trim().max(255).optional(),
  lastName: z.string().trim().max(255).optional(),
  avatars: z.array(fileUploadedSchema).optional(),
  roles: z.array(z.nativeEnum(roles)).optional(),
});

export const membershipUpdateMeInputSchema = z.object({
  firstName: z.string().trim().min(1).max(255).optional(),
  lastName: z.string().min(1).trim().max(255).optional(),
  avatars: z.array(fileUploadedSchema).optional(),
});
