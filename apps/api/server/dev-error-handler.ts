export default defineNitroErrorHandler(async (error, event) => {
  console.error(error);
  setResponseStatus(event, 500, 'Internal Server Error');
  return send(event, { cause: error, message: 'An error occurred while fulfilling your request' });
})