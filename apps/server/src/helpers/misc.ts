import { Logger } from '@bogeychan/elysia-logger/dist/types';
import { Session, User } from 'better-auth/types';
import { Context } from 'elysia';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { DrizzleDb } from './db';

export type AppContext<T = unknown> = Context & { log: Logger, db: DrizzleDb, body: T }
export type AuthContext<T = unknown> = AppContext<T> & { user: User, session: Session };

export function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, 64, (err, hash) => {
            if (err) {
                return reject(err);
            }

            return resolve(`${salt}$$${hash.toString('hex')}`);
        })
    })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, k] = hash.split('$$');
        scrypt(password, salt, 64, (err, hash) => {
            if (err) {
                return reject(err);
            }

            return resolve(timingSafeEqual(hash, Buffer.from(k)));
        });
    })
}