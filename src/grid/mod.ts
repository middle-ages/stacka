import { function as FN } from 'fp-ts';
import * as CE from 'src/cell';
import { Cell, PackedCell } from 'src/cell';
import { Color } from 'src/color';
import * as ST from 'src/style';
import { Style } from 'src/style';
import { Pair } from 'util/tuple';
import { Endo, Unary } from 'util/function';
import * as TY from './types';
import { Grid } from './types';

type IndexPacked = (x: number, y: number, cell: PackedCell) => PackedCell;
type IndexCell = (x: number, y: number, cell: Cell) => Cell;

export const modIndexPacked: Unary<IndexPacked, Endo<Grid>> = f => grid => {
  const { width, buffer: readBuffer } = grid,
    height = readBuffer.length / (CE.cellWords * width),
    writeBuffer = TY.sized({ width, height }),
    read = CE.readPackedCell(readBuffer),
    write = CE.writePackedCell(writeBuffer.buffer);

  let offset = 0;

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      offset += write(offset, f(x, y, read(offset)[1]));

  return writeBuffer;
};

export const modIndexCell: Unary<IndexCell, Endo<Grid>> = f =>
  modIndexPacked((x, y, packed) => CE.packCell(f(x, y, CE.unpackCell(packed))));

export const modPacked: Unary<Endo<PackedCell>, Endo<Grid>> = f =>
  modIndexPacked((_x, _y, packed) => f(packed));

/** Map all grid cells through the given function of type `Cell ⇒ Cell` */
export const modCells: Unary<Endo<Cell>, Endo<Grid>> = FN.flow(
  CE.withCell,
  modPacked,
);

/** Map only `none` cells through the given function of type `Cell ⇒ Cell` */
export const modIndexNone: Unary<Unary<Pair<number>, Cell>, Endo<Grid>> = f =>
  modIndexCell((x, y, cell) => (cell[2] === 'none' ? f([x, y]) : cell));

/** Map only `char` cells through the given function of type `Cell ⇒ Cell` */
export const modIndexChar: Unary<IndexCell, Endo<Grid>> = f =>
  modIndexCell((x, y, cell) => (cell[2] === 'char' ? f(x, y, cell) : cell));

/** Map over cells that are _not_ `none` or `cont`, I.e. `char` and `wide` */
export const modIndexSome: Unary<IndexCell, Endo<Grid>> = f =>
  modIndexCell((x, y, cell) =>
    cell[2] === 'char' || cell[2] === 'wide' ? f(x, y, cell) : cell,
  );

export const modNone: Unary<FN.Lazy<Cell>, Endo<Grid>> = modIndexNone,
  modChar: Unary<Endo<Cell>, Endo<Grid>> = f =>
    modIndexChar((_x, _y, cell) => f(cell)),
  modSome: Unary<Endo<Cell>, Endo<Grid>> = f =>
    modIndexSome((_x, _y, cell) => f(cell)),
  modStyle: Unary<Endo<Style>, Endo<Grid>> = FN.flow(CE.style.mod, modSome),
  modRune: Unary<Endo<string>, Endo<Grid>> = FN.flow(CE.rune.mod, modSome);

export const modFg: Unary<Endo<Color>, Endo<Grid>> = FN.flow(
    ST.fg.color.mod,
    modStyle,
  ),
  modBg: Unary<Endo<Color>, Endo<Grid>> = FN.flow(ST.bg.color.mod, modStyle);
