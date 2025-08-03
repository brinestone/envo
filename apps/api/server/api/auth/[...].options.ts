import cors from 'cors';
export default defineEventHandler(event => {
  setHeader(event, 'Access-Control-Allow-Credentials', 'true');
  setHeader(event, 'Access-Control-Allow-Headers', ['Content-Type']);
  setHeader(event, 'Access-Control-Allow-Methods', ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH']);
  setHeader(event, 'Access-Control-Allow-Origin', useRuntimeConfig(event).frontendOrigin);
  setResponseStatus(event, 204, 'No Content');
})