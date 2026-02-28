import { credentials } from '@grpc/grpc-js';

// Generic Client Constructor Type
type GrpcClientConstructor<T> = new (
  address: string,
  credentials: any,
  options?: any,
) => T;

export function createLazyClient<T>(
  ClientClass: GrpcClientConstructor<T>,
  serviceUrl: string,
  serviceName: string,
): () => T {
  let clientInstance: T | null = null;

  return () => {
    if (!clientInstance) {
      console.log(`Connecting to ${serviceName} at: ${serviceUrl}`);
      clientInstance = new ClientClass(
        serviceUrl,
        credentials.createInsecure(),
      );
    }
    return clientInstance;
  };
}
