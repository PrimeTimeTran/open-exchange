import testCleanupDatabase from 'src/shared/test/testCleanDatabase';

jest.mock('@google-cloud/storage', jest.fn());
jest.mock('@aws-sdk/client-s3', jest.fn());
jest.mock('@aws-sdk/s3-presigned-post', jest.fn());
jest.mock('@aws-sdk/s3-request-presigner', jest.fn());
jest.mock('@aws-sdk/signature-v4-crt', jest.fn());

beforeEach(async () => {
  process.env.AUTH_BYPASS_EMAIL_VERIFICATION = true;
  return testCleanupDatabase();
});
