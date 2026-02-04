import { roles } from 'src/features/roles';

export const auditLogPermissions = {
  auditLogRead: {
    id: 'auditLogRead',
    allowedRoles: [roles.admin],
  },
};
