import { sessionPlugin } from "elysia-session";
import { CookieStore } from 'elysia-session/src/stores/cookie';

// export class DrizzleStore implements Store {
//     constructor(private db: DrizzleDb) { }
//     getSession(id?: string, ctx?: Context): SessionData | null | undefined | Promise<SessionData | null | undefined> {
//         if (!id) return undefined;
//         return this.db.query.sessionTable.findFirst({
//             where: (session, { eq }) => eq(session.id, id),
//             columns: {
//                 _data: true
//             }
//         }).then(res => res?._data as SessionData | undefined);
//     }
//     async createSession(data: SessionData, id?: string, ctx?: Context) {
//         await this.db.transaction(t => t.insert(sessionTable).values({
//             id: id ?? randomBytes(16).toString('hex'),
//             _data: data,
//         }));
//     }
//     async persistSession(data: SessionData, id?: string, ctx?: Context) {
//         await this.db.transaction(t => t.update(sessionTable).set({
//             _data: data,
//         }).where(eq(sessionTable.id, id as string)))
//     }

//     async deleteSession(id?: string, ctx?: Context) {
//         await this.db.transaction(t => t.delete(sessionTable).where(eq(sessionTable.id, id as string)))
//     }
// }

export const sessionConfig = sessionPlugin({
    cookieName: 'session',
    expireAfter: 15 * 60,
    store: new CookieStore()
});