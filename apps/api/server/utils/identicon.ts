import { toPng } from 'jdenticon';

export function generateIdenticon(data: Buffer, size = 200) {
  const png = toPng(data, size);
  return png;
}