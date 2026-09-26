//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-07-12",
  experimental: {
    openAPI: true,
    tasks: true,
    asyncContext: true
  },
  runtimeConfig: {
    databaseUrl: "",
    frontendOrigin: '',
    minioAccessKey: '',
    minioSecretKey: '',
    minioUploadBucket: '',
    minioUploadPath: '',
    minioOrigin: '',
    minioPort: 0,
    minioHost: '',
    redisHost: '',
    redisPort: ''
  },
  openAPI: {
    route: "/_docs/openapi.json",
    meta: {
      title: 'Envo API',
      version: '1.0'
    },
    ui: {
      scalar: {
        route: '/_docs/scalar',
        theme: 'purple'
      },
    }
  },
  devStorage: {
    redis: {
      driver: 'redis',
      base: 'envo_',
    }
  },
  storage: {
    redis: {
      driver: 'redis',
      base: 'envo_',
    }
  }
});
