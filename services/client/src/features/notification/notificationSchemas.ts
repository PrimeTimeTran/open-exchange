import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Notification, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { notificationEnumerators } from 'src/features/notification/notificationEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { UserNotification } from '@prisma/client';

extendZodWithOpenApi(z);

export const notificationFindSchema = z.object({
  id: z.string(),
});

export const notificationFilterFormSchema = z
  .object({
    type: z.nativeEnum(notificationEnumerators.type).nullable().optional(),
    severity: z.nativeEnum(notificationEnumerators.severity).nullable().optional(),
    title: z.string(),
    body: z.string(),
    actionUrl: z.string(),
    scope: z.nativeEnum(notificationEnumerators.scope).nullable().optional(),
    targetUserId: z.string(),
    targetSegment: z.string(),
    persistent: z.string().nullable().optional(),
    dismissible: z.string().nullable().optional(),
    requiresAck: z.string().nullable().optional(),
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

export const notificationFilterInputSchema = notificationFilterFormSchema
  .merge(
    z.object({
      persistent: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
      dismissible: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
      requiresAck: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const notificationFindManyInputSchema = z.object({
  filter: notificationFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const notificationDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const notificationArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const notificationRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const notificationAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const notificationAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const notificationCreateInputSchema = z.object({
  type: z.nativeEnum(notificationEnumerators.type).nullable().optional(),
  severity: z.nativeEnum(notificationEnumerators.severity).nullable().optional(),
  title: z.string().trim().nullable().optional(),
  body: z.string().trim().nullable().optional(),
  actionUrl: z.string().trim().nullable().optional(),
  scope: z.nativeEnum(notificationEnumerators.scope).nullable().optional(),
  targetUserId: z.string().trim().nullable().optional(),
  targetSegment: z.string().trim().nullable().optional(),
  persistent: z.boolean().default(false),
  dismissible: z.boolean().default(false),
  requiresAck: z.boolean().default(false),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const notificationImportInputSchema =
  notificationCreateInputSchema.merge(importerInputSchema);

export const notificationImportFileSchema = z
  .object({
    type: z.string(),
    severity: z.string(),
    title: z.string(),
    body: z.string(),
    actionUrl: z.string(),
    scope: z.string(),
    targetUserId: z.string(),
    targetSegment: z.string(),
    persistent: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    dismissible: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    requiresAck: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    meta: z.string(),
  })
  .partial();

export const notificationUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const notificationUpdateBodyInputSchema =
  notificationCreateInputSchema.partial();

export interface NotificationWithRelationships extends Notification {
  userNotifications?: UserNotification[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
