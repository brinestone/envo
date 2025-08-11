export default defineTask({
  meta: {
    name: 'events:write',
    description: 'Register an event that has occurred'
  },
  run: async event => {
    console.log(event);
    return { result: 'success' };
  }
})