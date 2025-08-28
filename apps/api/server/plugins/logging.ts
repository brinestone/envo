export default defineNitroPlugin(app => {
  const logger = useLogger();
  app.hooks.hook('request', event => {
    const ip = getRequestIP(event, { xForwardedFor: true });
    const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
    if (!url.pathname.startsWith('/api')) return;
    const profiler = logger.startTimer();
    event.node.res.on('finish', () => {
      const msg = `${ip} - ${event.method} ${url.pathname} -> ${event.node.res.statusCode}`;
      profiler.done({ message: msg, level: 'http' });
    });
  })
})