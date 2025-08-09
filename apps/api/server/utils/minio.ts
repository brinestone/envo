import { Client } from "minio";

const client = new Client({
  endPoint: useRuntimeConfig().minioHost,
  port: 9000,
  accessKey: useRuntimeConfig().minioAccessKey,
  secretKey: useRuntimeConfig().minioSecretKey,
  useSSL: useRuntimeConfig().minioHost !== 'localhost'
});

export async function uploadFile(data: Buffer, objectName: string, contentType: string) {
  const { minioUploadBucket, minioHost } = useRuntimeConfig(useEvent());
  await client.putObject(
    minioUploadBucket,
    objectName,
    data,
    data.byteLength,
    {
      'Content-Type': contentType
    }
  );
  return new URL([
    minioUploadBucket,
    objectName,
  ].join('/'), `http://${minioHost}:9000`).toString();
}