import { function as FN } from 'fp-ts';
import { indexRecord } from 'util/array';
import { Unary } from 'util/function';
import { typedKeys } from 'util/object';

/**
 * Cell types:
 *
 * 1. `none` represents an empty cell
 * 2. `char` represents a character of width 1
 * 3. `wide` represents 1st cell of a character of width > 1
 * 4. `cont` represents a continuation of a previous wide character
 *
 */
export type CellType = keyof typeof index;
export type PackedType = number;

export const width = {
  none: 0,
  char: 1,
  wide: 2,
  cont: 0,
} as const;

export const index = FN.pipe(width, typedKeys, indexRecord);

export const types: CellType[] = typedKeys(index);

export const matchPackedType =
  <R>(onNone: R, onChar: R, onWide: R, onCont: R): Unary<PackedType, R> =>
  packedType =>
    packedType === 0
      ? onNone
      : packedType === 1
      ? onChar
      : packedType === 2
      ? onWide
      : onCont;

export const matchCellType =
  <R>(onNone: R, onChar: R, onWide: R, onCont: R): Unary<CellType, R> =>
  type =>
    FN.pipe(index[type], matchPackedType(onNone, onChar, onWide, onCont));

export const pack: Unary<CellType, PackedType> = type => index[type],
  unpack: Unary<PackedType, CellType> = idx => types[idx];

export const runeWidth: Unary<PackedType, number> = t => width[unpack(t)];
