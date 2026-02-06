export const articleStorage = {
  articleImages: {
    id: 'articleImages',
    folder: 'tenant/:tenantId/article/images',
    maxSizeInBytes: 100_000_000,
  },

  articleFiles: {
    id: 'articleFiles',
    folder: 'tenant/:tenantId/article/files',
    maxSizeInBytes: 100_000_000,
  },
};
