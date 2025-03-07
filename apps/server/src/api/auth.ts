import { credentialTable, userTable } from "@schemas/user";
import { count, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { google } from 'googleapis';
import { randomUUID } from 'node:crypto';
import { hashPassword } from "src/helpers/misc";
import { useUsersDb } from "../helpers/db";

const googleOauth2Client = () => new google.auth.OAuth2({
    clientId: Bun.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: Bun.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: new URL('/auth/oauth/google/callback', `${Bun.env.BASE_URL}`).toString()
});

export default new Elysia({ name: 'auth', prefix: '/auth', tags: ['Auth'] })
    .group('/oauth/google', g => {
        g
            .decorate('db', useUsersDb())
            .decorate('oauthClient', googleOauth2Client())
            .get('/callback', async ({ db, query, oauthClient }) => {
                oauthClient.setCredentials({ access_token: query.code });
                const ps = google.people({ version: 'v1', auth: oauthClient });
                try {
                    const res = await ps.people.get({
                        resourceName: 'people/me',
                        personFields: 'names,emailAddresses'
                    });

                    return res.data;
                } catch (e) {
                    console.error(JSON.stringify(e));
                    throw e;
                }
            }, {
                detail: {
                    summary: 'Complete Google OAuth 2.0', description: 'Complete the Google Oauth 2.0 workflow', responses: {
                        '307': { description: "Redirects user to the web client" }
                    }
                }
            });
        g
            .decorate('oauthClient', googleOauth2Client())
            .get('/', ({ oauthClient, redirect }) => {
                const scope = ['email', 'profile'];

                const url = oauthClient.generateAuthUrl({
                    access_type: 'offline',
                    scope
                });

                return redirect(url, 307);
            }, {
                detail: {
                    summary: 'Start Google OAuth 2.0', description: 'Starts the Google Oauth 2.0 workflow', responses: {
                        '307': { description: "Redirects user to Google for sign in" }
                    }
                }
            });
        return g;
    })
    .decorate('db', useUsersDb())
    .post('/sign-up', async ({ body, db, error }) => {
        const [{ emailCount }] = await db.select({ emailCount: count() })
            .from(userTable)
            .where(eq(userTable.email, body.email));
        if (emailCount > 0) {
            return error('Conflict', { message: 'Email address is already in use' });
        }

        await db.transaction(async t => {

            const [{ id: userId }] = await t.insert(userTable).values({
                email: body.email,
                names: body.names,
            }).returning({ id: userTable.id });

            const hash = await hashPassword(body.password);

            await t.insert(credentialTable)
                .values({
                    id: randomUUID(),
                    provider: 'local',
                    owner: userId,
                    params: {
                        passwordHash: hash,
                        email: body.email
                    }
                });
        });
    }, {
        detail: {
            summary: 'Email & password sign up ',
            description: 'Registers a user using their email address and password',
            responses: {
                '422': { description: "Invalid request information" },
                '201': { description: "The user's account was created successfully" },
                '409': { description: "The provided email address is already in use." }
            }
        },
        body: t.Object({
            email: t.String({
                format: 'email',
            }),
            names: t.String(),
            password: t.String({ pattern: '^[\\S\\da-zA-Z]{6,}$', description: "The user's password" }),
            confirmPassword: t.String({ pattern: '^[\\S\\da-zA-Z]{6,}$', description: "The user's password confirmation" }),
        })
    });