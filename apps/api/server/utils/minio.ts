import { Client } from "minio";

export async function uploadFile(data: Buffer, objectName: string, contentType: string) {
  const { minioUploadBucket, minioOrigin, minioAccessKey, minioSecretKey, minioPort, minioHost } = useRuntimeConfig(useEvent());
  const client = new Client({
    endPoint: minioHost,
    port: minioPort,
    accessKey: minioAccessKey,
    secretKey: minioSecretKey,
    useSSL: minioOrigin.startsWith('https')
  });
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
  ].join('/'), minioOrigin).toString();
}
