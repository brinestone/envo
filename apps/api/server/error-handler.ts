export default defineNitroErrorHandler((error, event) => {
  console.error(error);
  setResponseStatus(event, 500, 'Internal Server Error');
  return send(event, { message: 'An error occurred while fulfilling your request' }, 'application/json');
})