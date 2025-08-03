//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-07-12",
  experimental: {
    asyncContext: true
  },
  runtimeConfig: {
    databaseUrl: "",
    upstashToken: "",
    frontendOrigin: '',
    minioAccessKey: '',
    minioSecretKey: '',
    minioUploadBucket: '',
    minioUploadPath: '',
    minioHost: ''
  },
  appConfig: {

  }
});
