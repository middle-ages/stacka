import { ByteArray } from 'util/array';
import { Unary } from 'util/function';

/**
 * #### A unicode code point
 *
 * Encoded as a 32bit unsigned integer, representing the character code point,
 * in little-endian order.
 *
 * Most characters will have most bits empty.
 */
export type Rune = number;

const [decoder, encoder] = [new TextDecoder(), new TextEncoder()];

/** Encode a single character as a 32bit unsigned int */
export const encode: Unary<string, Rune> = s => {
  if (s.length === 0) return 0;

  const bytes = new DataView(encoder.encode(s).buffer);

  return bytes.byteLength === 1
    ? bytes.getUint8(0)
    : bytes.byteLength === 4
    ? bytes.getUint32(0, true)
    : bytes.byteLength === 2
    ? bytes.getUint16(0, true)
    : 2 ** 8 * bytes.getUint16(1, true) + bytes.getUint8(0);
};

/** Decode a single unicode code point from a 32bit unsigned int */
export const decode: Unary<Rune, string> = r => {
  if (r === 0) return '';
  else if (r < 2 ** 8) return decoder.decode(ByteArray.from([r]));

  const byte4 = (r >> 24) & 0xff;
  const byte3 = (r >> 16) & 0x00ff;
  const byte2 = (r >> 8) & 0x0000ff;
  const byte1 = (r >> 0) & 0x000000ff;

  return decoder.decode(
    ByteArray.from(
      byte4 !== 0
        ? [byte1, byte2, byte3, byte4]
        : byte3 !== 0
        ? [byte1, byte2, byte3]
        : [byte1, byte2],
    ),
  );
};
