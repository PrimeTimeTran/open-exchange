import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const messagePermissions = {
  messageImport: {
    id: 'messageImport',
    allowedRoles: [roles.admin],
  },

  messageCreate: {
    id: 'messageCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.messageAttachment.id, storage.messageImages.id],
  },

  messageUpdate: {
    id: 'messageUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.messageAttachment.id, storage.messageImages.id],
  },

  messageRead: {
    id: 'messageRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  messageAutocomplete: {
    id: 'messageAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  messageDestroy: {
    id: 'messageDestroy',
    allowedRoles: [roles.admin],
  },

  messageArchive: {
    id: 'messageArchive',
    allowedRoles: [],
  },

  messageRestore: {
    id: 'messageRestore',
    allowedRoles: [],
  },

};
