import { Prisma, PrismaClient } from '@prisma/client';
import { AppContext } from 'src/shared/controller/appContext';
import 'src/env';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

/**
 * This function is used to bypass the Tenant verification via RLS (Row Level Security) in Prisma. Use when you don't need transactions.
 */
export function prismaDangerouslyBypassAuth(
  context?: Partial<AppContext> | null,
) {
  return _prismaAuth(context, true);
}

/**
 * This is an authenticated Prisma Client. Use when you don't need transactions.
 */
export function prismaAuth(context?: Partial<AppContext> | null) {
  return _prismaAuth(context, false);
}

/**
 * This function is used to bypass the Tenant verification via RLS (Row Level Security) in Prisma. Use when you need to use transactions.
 */
export function prismaTransactionDangerouslyBypassAuth(
  context?: Partial<AppContext> | null,
) {
  return _prismaTransactionAuth(context, true);
}

/**
 * This is an authenticated Prisma Client. Use when you need to use transactions.
 */
export function prismaTransactionAuth(context?: Partial<AppContext> | null) {
  return _prismaTransactionAuth(context, false);
}

function _prismaAuth(
  context?: Partial<AppContext> | null,
  bypassRls?: boolean,
) {
  return prisma.$extends({
    query: {
      async $queryRaw({ args, query, operation }) {
        const [, , , , , result] = await prisma.$transaction([
          prisma.$executeRaw`SELECT set_config('app.current_user_id', ${
            context?.currentUser?.id ? context?.currentUser?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.current_membership_id', ${
            context?.currentMembership?.id ? context?.currentMembership?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${
            context?.currentTenant?.id ? context?.currentTenant?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.current_api_key_id', ${
            context?.apiKey?.id ? context?.apiKey?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.bypass_rls', ${
            bypassRls ? 'on' : 'off'
          }, TRUE)`,
          query(args),
        ]);
        return result;
      },
      $allModels: {
        async $allOperations({ args, query }) {
          const [, , , , , result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.current_user_id', ${
              context?.currentUser?.id ? context?.currentUser?.id : ''
            }, TRUE)`,
            prisma.$executeRaw`SELECT set_config('app.current_membership_id', ${
              context?.currentMembership?.id
                ? context?.currentMembership?.id
                : ''
            }, TRUE)`,
            prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${
              context?.currentTenant?.id ? context?.currentTenant?.id : ''
            }, TRUE)`,
            prisma.$executeRaw`SELECT set_config('app.current_api_key_id', ${
              context?.apiKey?.id ? context?.apiKey?.id : ''
            }, TRUE)`,
            prisma.$executeRaw`SELECT set_config('app.bypass_rls', ${
              bypassRls ? 'on' : 'off'
            }, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    },

    client: {
      $transaction: async () => {
        throw new Error(
          'The `prismaAuth` Prisma Client doesn`t allow $transaction. Please use `prismaTransactionAuth`.',
        );
      },
    },
  });
}

function _prismaTransactionAuth(
  context?: Partial<AppContext> | null,
  bypassRls?: boolean,
) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return query(args);
        },
      },
    },

    client: {
      $transaction: async <P extends Prisma.PrismaPromise<any>[]>(
        args: [...P],
      ) => {
        const [, , , , , ...response] = await prisma.$transaction([
          prisma.$executeRaw`SELECT set_config('app.current_user_id', ${
            context?.currentUser?.id ? context?.currentUser?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.current_membership_id', ${
            context?.currentMembership?.id ? context?.currentMembership?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${
            context?.currentTenant?.id ? context?.currentTenant?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.current_api_key_id', ${
            context?.apiKey?.id ? context?.apiKey?.id : ''
          }, TRUE)`,
          prisma.$executeRaw`SELECT set_config('app.bypass_rls', ${
            bypassRls ? 'on' : 'off'
          }, TRUE)`,
          ...args,
        ]);

        return response;
      },
    },
  });
}
