import { function as FN, option as OP } from 'fp-ts';
import { Backdrop, backdrop as BD } from 'src/backdrop';
import { box, MaybeBox } from 'src/box';
import { BorderDir, borderDir } from 'src/geometry';
import { Unary } from 'util/function';
import { mapValuesOf } from 'util/object';
import { BackdropParts, Border, CharParts, CellParts } from './types';
import { Cell, cell } from 'src/grid';

const backdropBox: Unary<Backdrop, MaybeBox> = FN.flow(
  box.fromBackdrop,
  OP.some,
);

const mapBordered = <T>() => mapValuesOf<BorderDir, T>()<MaybeBox>;

/** Create a border from the given mapping of `BorderDir ⇒ Backdrop */
export const fromBackdrops: Unary<BackdropParts, Border> =
  mapBordered<Backdrop>()(backdropBox);

/** Create a border that repeats the given cell */
export const fromCells: Unary<CellParts, Border> = mapBordered<Cell>()(
  FN.flow(BD.repeatCell, backdropBox),
);

/** Create a border that repeats the char given per border direction */
export const fromNarrowChars: Unary<CharParts, Border> = FN.flow(
  mapValuesOf<BorderDir, string>()<Cell>(cell.plainNarrow),
  fromCells,
);

export const empty: Border = FN.pipe(OP.none, FN.constant, borderDir.associate);
