import { function as FN } from 'fp-ts';
import { BinaryC, Endo, Unary } from 'util/function';
import * as style from 'src/style';
import { Style } from 'src/style';
import { decode, encode } from './rune';
import { pack as packType, PackedType, unpack as unpackType } from './type';
import { Cell } from './types';

/**
 * #### Packed Cell
 *
 * Byte layout in order:
 *
 * | offset |    data   | bytes |
 * |-------:|-----------|------:|
 * |      0 | fg color  |     4 |
 * |      4 | bg color  |     4 |
 * |      8 | rune      |     4 |
 * |     12 | cell type |     1 |
 * |     13 | deco      |     1 |
 * |     14 | unused    |     2 |
 * |        |           |  + 16 |
 *
 * Cell layout in 128 (16 * 8) bits:
 *
 * ```txt
 *
 *  byte #╷ 1     ╷ 2     ╷ 3     ╷ 4
 * ━━━━━━0╋━━━━━━━╋━━━━━━━╋━━━━━━━╋━━━━━━━┓
 *        ┃┌──────╂───────╂───────╂──────┐┃
 *        ┃│fg color      ┃       ┃      │┃
 *        ┃│R     ┃G      ┃B      ┃A     │┃
 *        ┃└──────╂───────╂───────╂──────┘┃
 *       4┣━━━━━━━╋━━━━━━━╋━━━━━━━╋━━━━━━━┫
 *        ┃┌──────╂───────╂───────╂──────┐┃
 *        ┃│bg color      ┃       ┃      │┃
 *        ┃│R     ┃G      ┃B      ┃A     │┃
 *        ┃└──────╂───────╂───────╂──────┘┃
 *       8┣━━━━━━━╋━━━━━━━╋━━━━━━━╋━━━━━━━┫
 *        ┃┌──────╂───────╂───────╂──────┐┃
 *        ┃│4 byte┃ rune  ┃       ┃      │┃
 *        ┃│#1    ┃#2     ┃#3     ┃#4    │┃
 *        ┃└──────╂───────╂───────╂──────┘┃
 *      12┣━━━━━━━╋━━━━━━━╋━━━━━━━┻━━━━━━━┩
 *        ┃┌─────┐┃┌─────┐┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱│
 *        ┃│deco │┃│type │┃╱╱╱╱unused╱╱╱╱╱│
 *        ┃│     │┃│     │┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱│
 *        ┃└─────┘┃└─────┘┃╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱│
 *      16┗━━━━━━━┻━━━━━━━┹───────────────┘
 * ```
 *
 */
export type PackedCell = [style: Style, rune: number, type: PackedType];

export const cellWords = 4;

export const packedCont: PackedCell = [style.empty, 0, 3];

export const writePackedCell =
  (buffer: Uint32Array) =>
  (offset: number, [[fg, bg, deco], rune, type]: PackedCell): number => {
    if (type === 0) {
      buffer.fill(0, offset, offset + cellWords * 4);
      return cellWords;
    } else if (type === 3) {
      buffer.fill(0, offset, offset + cellWords * 4);
      buffer[offset + 3] = 3;
      return cellWords;
    }

    const isWide = type === 2;

    buffer[offset + 0] = fg;
    buffer[offset + 1] = bg;
    buffer[offset + 2] = rune;
    buffer[offset + 3] = type | (deco << 8);

    if (isWide) buffer[offset + 3 + cellWords] = 3;

    return cellWords * (isWide ? 2 : 1);
  };

export const writeEmptyCells =
  (buffer: Uint32Array) =>
  (offset: number, cellCount: number): number => {
    const size = cellWords * cellCount;
    buffer.fill(0, offset, size);
    return size;
  };

export const readPackedCell: BinaryC<
  Uint32Array,
  number,
  [readWords: number, cell: PackedCell]
> = buffer => offset => {
  const typeAndDeco = buffer[offset + 3];
  const type = typeAndDeco & 0x00_ff;

  if (type === 0) return [cellWords, [style.empty, 0, 0]];
  else if (type === 3) return [cellWords, [style.empty, 0, 3]];

  const fg = buffer[offset + 0],
    bg = buffer[offset + 1],
    rune = buffer[offset + 2],
    deco = (typeAndDeco >> 8) & 0x00_ff,
    packedStyle: Style = [fg, bg, deco];

  return [cellWords, [packedStyle, rune, type]] as [
    readWords: number,
    cell: PackedCell,
  ];
};

export const readPackedType: BinaryC<Uint32Array, number, PackedType> =
  buffer => offset =>
    buffer[offset + 3] & 0x00_ff;

export const packCell: Unary<Cell, PackedCell> = ([style, rune, type]) => [
  style,
  encode(rune),
  packType(type),
];

export const unpackCell: Unary<PackedCell, Cell> = ([style, rune, type]) => [
  style,
  decode(rune),
  unpackType(type),
];

export const readCell =
  (buffer: Uint32Array) =>
  (offset: number): Cell =>
    unpackCell(readPackedCell(buffer)(offset)[1]);

export const writeCell =
  (buffer: Uint32Array) =>
  (offset: number, cell: Cell): number =>
    writePackedCell(buffer)(offset, packCell(cell));

export const withCell: Unary<Endo<Cell>, Endo<PackedCell>> = f =>
  FN.flow(unpackCell, f, packCell);
