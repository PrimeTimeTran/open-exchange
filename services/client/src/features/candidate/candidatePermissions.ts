import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const candidatePermissions = {
  candidateImport: {
    id: 'candidateImport',
    allowedRoles: [roles.admin],
  },

  candidateCreate: {
    id: 'candidateCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.candidateResume.id],
  },

  candidateUpdate: {
    id: 'candidateUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.candidateResume.id],
  },

  candidateRead: {
    id: 'candidateRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  candidateAutocomplete: {
    id: 'candidateAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  candidateDestroy: {
    id: 'candidateDestroy',
    allowedRoles: [roles.admin],
  },

  candidateArchive: {
    id: 'candidateArchive',
    allowedRoles: [],
  },

  candidateRestore: {
    id: 'candidateRestore',
    allowedRoles: [],
  },

};
