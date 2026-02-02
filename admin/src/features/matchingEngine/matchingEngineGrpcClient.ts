import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'fs';

let PROTO_PATH = path.resolve(
  process.cwd(),
  'proto/helloworld/helloworld.proto',
);
// Fallback for local development outside Docker
if (!fs.existsSync(PROTO_PATH)) {
  PROTO_PATH = path.resolve(
    process.cwd(),
    '../matching_engine/proto/helloworld/helloworld.proto',
  );
}

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// @ts-ignore - Proto types are not automatically generated here
const helloworld: any = protoDescriptor.helloworld;

export interface HelloRequest {
  name: string;
}

export interface HelloReply {
  message: string;
}

// Ensure the client is a singleton or managed properly to avoid creating too many connections
// @ts-ignore
let client: any = null;

export const getClient = () => {
  if (!client) {
    const address = process.env.MATCHING_ENGINE_URL || 'localhost:50051';
    // @ts-ignore
    client = new helloworld.Greeter(address, grpc.credentials.createInsecure());
  }
  return client;
};

export const sayHello = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.SayHello({ name }, (err: any, response: HelloReply) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.message);
      }
    });
  });
};
