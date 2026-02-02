export const messageStorage = {
  messageAttachment: {
    id: 'messageAttachment',
    folder: 'tenant/:tenantId/message/attachment',
    maxSizeInBytes: 100_000_000,
  },

  messageImages: {
    id: 'messageImages',
    folder: 'tenant/:tenantId/message/images',
    maxSizeInBytes: 100_000_000,
  },
};
