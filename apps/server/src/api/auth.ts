import Elysia, { Context } from "elysia";
import { google } from 'googleapis';

const googleOauth2Client = new google.auth.OAuth2({
    clientId: Bun.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: Bun.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: new URL('/auth/oauth/google/callback', `${Bun.env.BASE_URL}`).toString()
});

async function finishGoogleSignIn(ctx: Context) {
    return ctx.query;
}

function handleGoogleSignInInit(ctx: Context) {
    const scope = ['email', 'profile'];

    const url = googleOauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope
    });

    return ctx.redirect(url, 307);
}

export default new Elysia({ name: 'auth', prefix: '/auth', tags: ['Auth'] })
    .group('/oauth/google', g => {
        g.get('/callback', finishGoogleSignIn, {
            detail: {
                summary: 'Complete Google OAuth 2.0', description: 'Complete the Google Oauth 2.0 workflow', responses: {
                    '307': { description: "Redirects user to the web client" }
                }
            }
        });
        g.get('/', handleGoogleSignInInit, {
            detail: {
                summary: 'Start Google OAuth 2.0', description: 'Starts the Google Oauth 2.0 workflow', responses: {
                    '307': { description: "Redirects user to Google for sign in" }
                }
            }
        });
        return g;
    });