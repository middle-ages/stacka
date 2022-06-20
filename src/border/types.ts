import { Backdrop } from 'src/backdrop';
import { MaybeBox } from 'src/box';
import { Dir, Bordered, Directed, Oriented } from 'src/geometry';
import { Tuple3 } from 'util/tuple';
import { Cell } from 'src/grid';

export type CellParts = Bordered<Cell>;
export type CharParts = Bordered<string>;
export type BackdropParts = Bordered<Backdrop>;

export type Border = Bordered<MaybeBox>;

export type BorderLines = Oriented<string> | Directed<string>;

/** An edge is a pair of corner parts + the part for the dir between them */
export type EdgeParts = Tuple3<MaybeBox>;

export interface BorderEdge {
  dir: Dir;
  parts: EdgeParts;
}

export const isDirectedLine = (c: BorderLines): c is Directed<string> =>
  'top' in c;

export const borderNames = [
  'space',
  'line',
  'round',
  'thick',
  'hThick',
  'vThick',
  'double',
  'hDouble',
  'vDouble',
  'near',
  'hNear',
  'vNear',
  'halfSolidNear',
  'halfSolidFar',
  'halfSolidStep',
  'solid',
] as const;

export type BorderName = typeof borderNames[number] & string;

export const borderedTag = 'bordered';
