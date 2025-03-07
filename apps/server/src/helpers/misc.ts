import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

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