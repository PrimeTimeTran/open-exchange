import { Tenant, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { fileCredentialsController } from 'src/features/file/controllers/fileCredentialsController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

jest.mock('src/features/storage', () => {
  const actualStorage = jest.requireActual('src/features/storage');

  return {
    ...actualStorage,

    storage: {
      ...actualStorage.storage,
      privateStorage: {
        id: 'privateStorage',
        folder: 'tenant/:tenantId/private',
        maxSizeInBytes: 1,
        publicRead: false,
      },

      publicStorage: {
        id: 'publicStorage',
        folder: 'tenant/:tenantId/public',
        maxSizeInBytes: 2,
        publicRead: true,
      },
    },
  };
});

jest.mock('src/features/permissions', () => {
  const actualPermission = jest.requireActual('src/features/permissions');

  return {
    ...actualPermission,
    permissions: {
      ...actualPermission.permissions,
      allPermissions: {
        id: 'allPermissions',
        allowedRoles: ['admin'],
        allowedStorage: ['privateStorage', 'publicStorage'],
      },
    },
  };
});

jest.mock('@google-cloud/storage', () => {
  return {
    Bucket: jest.fn(),
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn().mockImplementation(() => ({
        file: jest.fn().mockReturnValue({
          getSignedUrl: jest
            .fn()
            .mockReturnValue(Promise.resolve(['mockSignedUrl'])),
          generateSignedPostPolicyV4: jest
            .fn()
            .mockReturnValue(Promise.resolve([{ policy: 'test' }])),
        }),
      })),
    })),
  };
});

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3: jest.fn(),
    GetObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-presigned-post', () => {
  return {
    createPresignedPost: jest
      .fn()
      .mockReturnValue(Promise.resolve({ policy: 'test' })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockReturnValue(Promise.resolve('mockSignedUrl')),
  };
});

jest.mock('fs-extra', () => {
  return {
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn().mockReturnValue(true),
    move: jest.fn().mockReturnValue(true),
  };
});

describe('fileCredentials', () => {
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

  describe('local', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
      process.env.FILE_STORAGE_PROVIDER = 'local';
    });

    describe('credentials', () => {
      it('generates private credentials', async () => {
        const data = await fileCredentialsController(
          {
            filename: 'avatar.png',
            storageId: 'privateStorage',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );

        expect(data.relativeFilePath).toBe(
          `tenant/${currentTenant.id}/private/avatar.png`,
        );

        const downloadUrl = data.downloadUrl;

        expect(downloadUrl).toContain(
          `http://localhost:3000/api/file/local-download`,
        );

        const downloadToken = new URL(downloadUrl).searchParams.get(
          'token',
        ) as string;

        const decodedDownloadToken = (await jwt.decode(downloadToken)) as any;
        expect(decodedDownloadToken.relativeFilePath).toEqual(
          data.relativeFilePath,
        );

        expect(data.uploadCredentials.url).toContain(
          `http://localhost:3000/api/file/local-upload?token=`,
        );

        const uploadToken = new URL(
          data.uploadCredentials.url,
        ).searchParams.get('token') as string;

        const decodedUploadToken = (await jwt.decode(uploadToken)) as any;
        expect(decodedUploadToken.maxSizeInBytes).toEqual(1);
        expect(decodedUploadToken.relativeFilePath).toEqual(
          data.relativeFilePath,
        );
      });

      it('generates public credentials', async () => {
        const data = await fileCredentialsController(
          {
            filename: 'avatar.png',
            storageId: 'publicStorage',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );

        expect(data.relativeFilePath).toBe(
          `tenant/${currentTenant.id}/public/avatar.png`,
        );

        const downloadUrl = data.downloadUrl;

        expect(downloadUrl).toContain(
          `http://localhost:3000/api/file/local-download`,
        );

        const downloadToken = new URL(downloadUrl).searchParams.get(
          'token',
        ) as string;

        const decodedDownloadToken = (await jwt.decode(downloadToken)) as any;
        expect(decodedDownloadToken.relativeFilePath).toEqual(
          data.relativeFilePath,
        );

        // No expiration for public credentials
        expect(decodedDownloadToken.exp).toBeFalsy();

        expect(data.uploadCredentials.url).toContain(
          `http://localhost:3000/api/file/local-upload?token=`,
        );

        const uploadToken = new URL(
          data.uploadCredentials.url,
        ).searchParams.get('token') as string;

        const decodedUploadToken = (await jwt.decode(uploadToken)) as any;
        expect(decodedUploadToken.maxSizeInBytes).toEqual(2);
        expect(decodedUploadToken.relativeFilePath).toEqual(
          data.relativeFilePath,
        );
      });

      it('blocks with no permissions', async () => {
        // clear permissions
        await prisma.membership.updateMany({
          data: {
            roles: [],
          },
        });

        try {
          await fileCredentialsController(
            {
              filename: 'avatar.png',
              storageId: 'privateStorage',
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

      it('blocks with invalid storage', async () => {
        try {
          await fileCredentialsController(
            {
              filename: 'avatar.png',
              storageId: 'invalid',
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
    });
  });

  describe('gcp credentials', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
      process.env.FILE_STORAGE_PROVIDER = 'gcp';
    });

    afterAll(() => {
      process.env.FILE_STORAGE_PROVIDER = 'local';
    });

    it('generates private credentials', async () => {
      const data = await fileCredentialsController(
        {
          filename: 'avatar.png',
          storageId: 'privateStorage',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data.relativeFilePath).toBe(
        `tenant/${currentTenant.id}/private/avatar.png`,
      );
      expect(data.downloadUrl).toBe('mockSignedUrl');
      expect(data.uploadCredentials.policy).toBe('test');
    });

    it('blocks with no permissions', async () => {
      // clear permissions
      await prisma.membership.updateMany({
        data: {
          roles: [],
        },
      });

      try {
        await fileCredentialsController(
          {
            filename: 'avatar.png',
            storageId: 'privateStorage',
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

    it('blocks with invalid storage', async () => {
      try {
        await fileCredentialsController(
          {
            filename: 'avatar.png',
            storageId: 'invalid',
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
  });

  describe('aws credentials', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
      process.env.FILE_STORAGE_PROVIDER = 'aws';
      process.env.FILE_STORAGE_BUCKET = 'test-bucket';
    });

    afterAll(() => {
      process.env.FILE_STORAGE_PROVIDER = 'local';
      process.env.FILE_STORAGE_BUCKET = '';
    });

    it('generates public credentials', async () => {
      const data = await fileCredentialsController(
        {
          filename: 'avatar.png',
          storageId: 'publicStorage',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data.relativeFilePath).toBe(
        `tenant/${currentTenant.id}/public/avatar.png`,
      );
      expect(data.downloadUrl).toBe(
        `https://test-bucket.s3.amazonaws.com/tenant/${currentTenant.id}/public/avatar.png`,
      );
      expect(data.uploadCredentials.policy).toBe('test');
    });

    it('generates private credentials', async () => {
      const data = await fileCredentialsController(
        {
          filename: 'avatar.png',
          storageId: 'privateStorage',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data.downloadUrl).toBe('mockSignedUrl');
      expect(data.relativeFilePath).toBe(
        `tenant/${currentTenant.id}/private/avatar.png`,
      );
      expect(data.uploadCredentials.policy).toBe('test');
    });

    it('blocks with no permissions', async () => {
      // clear permissions
      await prisma.membership.updateMany({
        data: {
          roles: [],
        },
      });

      try {
        await fileCredentialsController(
          {
            filename: 'avatar.png',
            storageId: 'privateStorage',
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

    it('blocks with invalid storage', async () => {
      try {
        await fileCredentialsController(
          {
            filename: 'avatar.png',
            storageId: 'invalid',
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
  });
});
