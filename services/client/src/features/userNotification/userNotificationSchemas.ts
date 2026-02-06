import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { UserNotification, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { userNotificationEnumerators } from 'src/features/userNotification/userNotificationEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Notification } from '@prisma/client';

extendZodWithOpenApi(z);

export const userNotificationFindSchema = z.object({
  id: z.string(),
});

export const userNotificationFilterFormSchema = z
  .object({
    readAtRange: z.array(dateTimeOptionalSchema).max(2),
    dismissedAtRange: z.array(dateTimeOptionalSchema).max(2),
    acknowledgedAtRange: z.array(dateTimeOptionalSchema).max(2),
    deliveryChannel: z.nativeEnum(userNotificationEnumerators.deliveryChannel).nullable().optional(),
    deliveredAtRange: z.array(dateTimeOptionalSchema).max(2),
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

export const userNotificationFilterInputSchema = userNotificationFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const userNotificationFindManyInputSchema = z.object({
  filter: userNotificationFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const userNotificationDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const userNotificationArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const userNotificationRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const userNotificationAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const userNotificationAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const userNotificationCreateInputSchema = z.object({
  readAt: dateTimeOptionalSchema,
  dismissedAt: dateTimeOptionalSchema,
  acknowledgedAt: dateTimeOptionalSchema,
  deliveryChannel: z.nativeEnum(userNotificationEnumerators.deliveryChannel).nullable().optional(),
  deliveredAt: dateTimeOptionalSchema,
  meta: jsonSchema.optional(),
  notification: objectToUuidSchemaOptional,
  user: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const userNotificationImportInputSchema =
  userNotificationCreateInputSchema.merge(importerInputSchema);

export const userNotificationImportFileSchema = z
  .object({
    readAt: z.string(),
    dismissedAt: z.string(),
    acknowledgedAt: z.string(),
    deliveryChannel: z.string(),
    deliveredAt: z.string(),
    meta: z.string(),
    notification: z.string(),
    user: z.string(),
  })
  .partial();

export const userNotificationUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const userNotificationUpdateBodyInputSchema =
  userNotificationCreateInputSchema.partial();

export interface UserNotificationWithRelationships extends UserNotification {
  notification?: Notification;
  user?: Membership;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
