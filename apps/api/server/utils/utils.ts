const maskChar = '*';
const maskMaxLength = 3;

export function maskString(value: string) {
  const start = Math.floor(.333 * value.length);
  const end = Math.floor(.8 * value.length);
  const mask = maskChar.repeat(Math.min(end - start, maskMaxLength));
  const prefix = value.substring(0, Math.min(4, start));
  const suffix = value.substring(Math.max(value.length - 2, end));
  return [prefix, mask, suffix].join('');
}