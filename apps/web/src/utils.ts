import { adjectives, colors, animals, uniqueNamesGenerator } from 'unique-names-generator';
export function randomName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    style: 'capital',
    separator: ' ',
  });
}
