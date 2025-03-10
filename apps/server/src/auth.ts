import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './helpers/db';
export const auth = betterAuth({
	trustedOrigins: [Bun.env.FRONT_END_ORIGIN as string],
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		google: {
			redirectURI: new URL('/api/auth/callback/google', `${Bun.env.BASE_URL}`).toString(),
			scope: ['email', 'profile'],
			enabled: true,
			clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
			accessType: 'offline',
		}
	}
});
