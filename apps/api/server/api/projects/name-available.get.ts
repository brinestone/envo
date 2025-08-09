
const db = useDatabase({ projects });
export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async event => {
    db.select()
      .from(projects)
  }
});