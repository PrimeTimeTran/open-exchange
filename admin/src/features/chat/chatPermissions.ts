import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const chatPermissions = {
  chatImport: {
    id: 'chatImport',
    allowedRoles: [roles.admin],
  },

  chatCreate: {
    id: 'chatCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.chatMedia.id],
  },

  chatUpdate: {
    id: 'chatUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.chatMedia.id],
  },

  chatRead: {
    id: 'chatRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  chatAutocomplete: {
    id: 'chatAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  chatDestroy: {
    id: 'chatDestroy',
    allowedRoles: [roles.admin],
  },

  chatArchive: {
    id: 'chatArchive',
    allowedRoles: [],
  },

  chatRestore: {
    id: 'chatRestore',
    allowedRoles: [],
  },

};
