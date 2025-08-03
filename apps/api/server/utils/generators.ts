import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function getUniqueRandomName() {
  return uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
}

export function generateUniqueCode(length = 10) {
  const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const res = [];
  let i = 0;
  while (i < length) {
    res.push(pool[Math.round(Math.random() * pool.length) % pool.length]);
  }
  return res.join('');
}