import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const membershipPermissions = {
  membershipResendInvitationEmail: {
    id: 'membershipResendInvitationEmail',
    allowedRoles: [roles.admin],
  },
  membershipDestroy: {
    id: 'membershipDestroy',
    allowedRoles: [roles.admin],
  },
  membershipImport: {
    id: 'membershipImport',
    allowedRoles: [roles.admin],
  },
  membershipCreate: {
    id: 'membershipCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.membershipAvatars.id],
  },
  membershipUpdate: {
    id: 'membershipUpdate',
    allowedRoles: [roles.admin],
  },
  membershipRead: {
    id: 'membershipRead',
    allowedRoles: [roles.admin],
  },
  membershipAutocomplete: {
    id: 'membershipAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },
};
