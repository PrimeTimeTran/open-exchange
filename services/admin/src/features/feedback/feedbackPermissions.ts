import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const feedbackPermissions = {
  feedbackImport: {
    id: 'feedbackImport',
    allowedRoles: [roles.admin],
  },

  feedbackCreate: {
    id: 'feedbackCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.feedbackAttachments.id],
  },

  feedbackUpdate: {
    id: 'feedbackUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.feedbackAttachments.id],
  },

  feedbackRead: {
    id: 'feedbackRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  feedbackAutocomplete: {
    id: 'feedbackAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  feedbackDestroy: {
    id: 'feedbackDestroy',
    allowedRoles: [roles.admin],
  },

  feedbackArchive: {
    id: 'feedbackArchive',
    allowedRoles: [],
  },

  feedbackRestore: {
    id: 'feedbackRestore',
    allowedRoles: [],
  },

};
