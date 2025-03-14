import { Session, User } from "better-auth/types";
import Elysia, { Context } from "elysia";
import { auth } from "src/auth";

export const userMiddleware = async (c: Context) => {
    const session = await auth.api.getSession({ headers: c.request.headers });

    if (!session) {
        c.set.status = 401;
        return { success: 'error', message: "Unauthorized Access: Token is missing" };
    }

    return {
        user: session.user,
        session: session.session
    }
}

export const userInfo = (user: User | null, session: Session | null) => {
    return {
        user: user,
        session: session
    }
}

export const authPlugin = new Elysia({ tags: ['Auth'], }).mount(auth.handler)
    .macro({
        auth: {
            async resolve({ error, request: { headers } }) {
                const session = await auth.api.getSession({
                    headers,
                });

                if (!session) return error('Unauthorized');

                return {
                    user: session.user,
                    session: session.session,
                };
            },
        },
    });
