import { roles } from 'src/features/roles';

export const subscriptionPermissions = {
  subscriptionRead: {
    id: 'subscriptionRead',
    allowedRoles: [roles.admin, roles.custom],
  },
  subscriptionCreate: {
    id: 'subscriptionCreate',
    allowedRoles: [roles.admin, roles.custom],
  },
  subscriptionUpdate: {
    id: 'subscriptionUpdate',
    allowedRoles: [roles.admin, roles.custom],
  },
};
