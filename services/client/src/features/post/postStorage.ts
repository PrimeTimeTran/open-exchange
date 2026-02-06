export const postStorage = {
  postFiles: {
    id: 'postFiles',
    folder: 'tenant/:tenantId/post/files',
    maxSizeInBytes: 100_000_000,
  },

  postImages: {
    id: 'postImages',
    folder: 'tenant/:tenantId/post/images',
    maxSizeInBytes: 100_000_000,
  },
};
