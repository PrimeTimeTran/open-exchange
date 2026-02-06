import * as grpc from '@grpc/grpc-js';
import {
  HelloReply,
  HelloRequest,
  GreeterClient,
} from '../../proto/helloworld/helloworld';

export { HelloRequest, HelloReply };

// Ensure the client is a singleton or managed properly to avoid creating too many connections
let client: GreeterClient | null = null;

export const getClient = (): GreeterClient => {
  if (!client) {
    const address = process.env.MATCHING_ENGINE_URL || 'localhost:50051';
    client = new GreeterClient(address, grpc.credentials.createInsecure());
  }
  return client;
};

export const sayHello = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    const request: HelloRequest = { name };
    client.sayHello(request, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.message || '');
      }
    });
  });
};
