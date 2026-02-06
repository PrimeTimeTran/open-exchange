import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipImporterController } from 'src/features/membership/controllers/membershipImporterController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import { formatTranslation } from 'src/translation/formatTranslation';
import { z } from 'zod';

const prisma = prismaDangerouslyBypassAuth();

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('membershipImport', () => {
  let currentUser: User;
  let currentTenant: Tenant;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );
    currentUser = await prisma.user.findFirstOrThrow();
    currentTenant = await prisma.tenant.findFirstOrThrow();
  });

  describe('validation', () => {
    it('email is a required field', async () => {
      const response = await membershipImporterController(
        [{ _line: 1, roles: [roles.admin], importHash: '1' }],
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(response[0]._status).toBe('error');
      expect(response[0]._line).toBe(1);
      expect(response[0]._errorMessages?.[0]).toContain('email');
    });

    it('is already a member', async () => {
      const response = await membershipImporterController(
        [
          {
            _line: 1,
            email: 'felipe@scaffoldhub.io',
            roles: [roles.admin],
            importHash: '1',
          },
        ],
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(response[0]._status).toBe('error');
      expect(response[0]._line).toBe(1);
      expect(response[0]._errorMessages?.[0]).toBe(
        formatTranslation(
          dictionary.membership.errors.alreadyMember,
          'felipe@scaffoldhub.io',
        ),
      );
    });

    it('must be signed in', async () => {
      try {
        await membershipImporterController(
          [
            {
              _line: 1,
              email: 'johndoe@scaffoldhub.io',
              roles: [roles.admin],
              importHash: '1',
            },
          ],
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('must have permission', async () => {
      await prisma.membership.updateMany({
        where: { userId: currentUser?.id, tenantId: currentTenant?.id },
        data: {
          // this role has no access
          roles: [roles.custom],
        },
      });

      try {
        await membershipImporterController(
          {
            _line: 1,
            email: 'johndoe@scaffoldhub.io',
            roles: [roles.admin],
            importHash: '1',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('importHash is a required field', async () => {
      const response = await membershipImporterController(
        [{ _line: 1, email: 'johndoe@scaffoldhub.io', roles: [roles.admin] }],
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(response[0]._status).toBe('error');
      expect(response[0]._line).toBe(1);
      expect(response[0]._errorMessages?.[0]).toContain('importHash');
    });

    it('validate unique import hash', async () => {
      await membershipImporterController(
        [
          {
            _line: 1,
            email: 'johndoe@scaffoldhub.io',
            roles: [roles.admin],
            importHash: '1',
          },
        ],
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      const response = await membershipImporterController(
        {
          _line: 2,
          email: 'johndoe@scaffoldhub.io',
          roles: [roles.admin],
          importHash: '1',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(response[0]._status).toBe('error');
      expect(response[0]._line).toBe(2);
      expect(response[0]._errorMessages).toEqual([
        dictionary.shared.importer.importHashAlreadyExists,
      ]);
    });
  });

  describe('success', () => {
    let response: z.infer<typeof importerOutputSchema>;

    beforeEach(async () => {
      mockSendEmail.mockClear();

      response = await membershipImporterController(
        [
          {
            _line: 1,
            email: 'JOHNDOE@scaffoldhub.io',
            roles: [roles.admin],
            importHash: '1',
          },
          {
            _line: 2,
            email: 'janedoe@scaffoldhub.io',
            roles: [roles.custom],
            importHash: '2',
          },
        ],
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
    });

    it('returns the correct response', async () => {
      expect(response[0]._status).toBe('success');
      expect(response[0]._line).toBe(1);
      expect(response[0]._errorMessages).toBeFalsy();

      expect(response[1]._status).toBe('success');
      expect(response[1]._line).toBe(2);
      expect(response[1]._errorMessages).toBeFalsy();
    });

    it('invite and transform email in lowercase', async () => {
      let user = await prisma.user.findFirst({
        where: { email: 'johndoe@scaffoldhub.io' },
      });

      expect(user).toBeTruthy();

      user = await prisma.user.findFirst({
        where: { email: 'janedoe@scaffoldhub.io' },
      });

      expect(user).toBeTruthy();
    });

    it('sends invitation email with token', async () => {
      expect(mockSendEmail).toHaveBeenCalled();
    });
  });
});
