import { Tenant } from '@prisma/client';

export function tenantLabel(tenant?: Tenant | null) {
  return tenant?.name;
}
