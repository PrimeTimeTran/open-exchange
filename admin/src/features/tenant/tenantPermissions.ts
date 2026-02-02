import { roles } from 'src/features/roles';

export const tenantPermissions = {
  tenantEdit: {
    id: 'tenantEdit',
    allowedRoles: [roles.admin],
  },
  tenantDestroy: {
    id: 'tenantDestroy',
    allowedRoles: [roles.admin],
  },
};
