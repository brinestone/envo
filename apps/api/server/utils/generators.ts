import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function getUniqueRandomName() {
  return uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
}

export function generateUniqueCode(length = 10) {
  const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const res = [];
  let i = 0;
  while (i < length) {
    const index = Math.floor(Math.random() * pool.length);
    res.push(pool.substring(index, index + 1));
    i++;
  }
  return res.join('');
}