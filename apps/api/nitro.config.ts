//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-07-12",
  // errorHandler: '~/error-handler.ts',
  // devErrorHandler: '~/dev-error-handler.ts',
  experimental: {
    openAPI: true,
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
        route: '/_docs/scalar'
      }
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
