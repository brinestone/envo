import redisDriver from 'unstorage/drivers/redis';

export default defineNitroPlugin(() => {
  if (import.meta.dev) return;
  const storage = useStorage();
  const driver = redisDriver({
    base: 'envo_',
    host: useRuntimeConfig().redisHost,
    port: Number(useRuntimeConfig().redisPort)
  })
  storage.mount('redis', driver);
});