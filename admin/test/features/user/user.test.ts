import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanDatabase from 'src/shared/test/testCleanDatabase';
import { userLabel } from 'src/features/user/userLabel';

describe('User Feature', () => {
  let prisma;

  beforeAll(() => {
    prisma = prismaDangerouslyBypassAuth();
  });

  beforeEach(async () => {
    await testCleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Model', () => {
    test('should create a new user', async () => {
      const email = 'primetimetran@gmail.com';

      const user = await prisma.user.create({
        data: {
          email,
          emailVerified: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.emailVerified).toBe(true);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should enforce unique email', async () => {
      const email = 'unique-email@example.com';

      await prisma.user.create({
        data: {
          email,
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('userLabel', () => {
    test('should return email as label', async () => {
      const email = 'label-test@example.com';
      const user = await prisma.user.create({
        data: {
          email,
        },
      });

      expect(userLabel(user)).toBe(email);
    });

    test('should return undefined if user is null', () => {
      expect(userLabel(null)).toBeUndefined();
    });

    test('should return undefined if user is undefined', () => {
      expect(userLabel(undefined)).toBeUndefined();
    });
  });

  describe('Relationships', () => {
    test('should allow creating user with membership', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'relationship-test@example.com',
          memberships: {
            create: {
              tenant: {
                create: {
                  name: 'Test Tenant',
                },
              },
              status: 'active',
              roles: ['admin'],
            },
          },
        },
        include: {
          memberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      expect(user.memberships).toHaveLength(1);
      expect(user.memberships[0].tenant.name).toBe('Test Tenant');
      expect(user.memberships[0].roles).toContain('admin');
    });
  });
});
