import { Client } from "minio";

const client = new Client({
  endPoint: useRuntimeConfig().minioEndpoint,
  port: 9000,
  accessKey: useRuntimeConfig().minioAccessKey,
  secretKey: useRuntimeConfig().minioSecretKey,
  useSSL: useRuntimeConfig().minioEndpoint.startsWith('https')
});

export async function uploadFile(data: Buffer, objectName: string, contentType: string) {
  await client.putObject(
    useRuntimeConfig().minioUploadBucket + '/' + useRuntimeConfig().minioUploadPath,
    objectName,
    data,
    data.byteLength, { contentType }
  );
  return new URL([
    useRuntimeConfig().minioUploadBucket,
    useRuntimeConfig().minioUploadPath,
    objectName,
  ].join('/'), useRuntimeConfig().minioEndpoint).toString();
}