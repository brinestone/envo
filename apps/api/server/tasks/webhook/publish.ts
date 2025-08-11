export default defineTask({
  meta: {
    name: 'webhook:publish',
    description: 'Publish webhook events'
  },
  run: async (event) => {
    // const { } = event.payload;
    console.log(event);
    // console.log(`publishing webhook event: ${event.payload['event']}`);
    return { result: 'ok' }
  }
})