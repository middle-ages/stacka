import { Backdrop } from 'src/backdrop';
import { bitmap } from 'src/bitmap';
import { MaybeBox } from 'src/box';
import { Bordered, Dir, Directed, Oriented } from 'src/geometry';
import { Cell } from 'src/cell';
import { membershipTest } from 'util/array';
import { Tuple3 } from 'util/tuple';

export type CellParts = Bordered<Cell>;
export type CharParts = Bordered<string>;
export type BackdropParts = Bordered<Backdrop>;

/** A `Border` is record of 9 optional boxes by border direction */
export type Border = Bordered<MaybeBox>;

export type BorderLines = Oriented<string> | Directed<string>;

/** An edge is a pair of corner parts + the part for the dir between them */
export type EdgeParts = Tuple3<MaybeBox>;

/** A border edge is an edge direction together with its edge parts */
export interface BorderEdge {
  dir: Dir;
  parts: EdgeParts;
}

/** Names of all borders with no dashing of any kind */
export const noDashBorderNames = bitmap.elbowGroups;

export type NoDashBorderName = typeof noDashBorderNames[number];

export const [dashedNames, dottedNames, dashedWideNames] = [
  ['dashed', 'roundDashed', 'thickDashed'],
  ['dotted', 'roundDotted', 'thickDotted'],
  ['dashedWide', 'roundDashedWide', 'thickDashedWide'],
] as const;

/** Names of all borders with some kind of dashing */
export const dashBorderNames = [
  ...dashedNames,
  ...dottedNames,
  ...dashedWideNames,
];

export type DashBorderName = typeof dashBorderNames[number];

const dashBorderNameCheck = membershipTest(dashBorderNames);
export const isDashBorderName = (s: string): s is DashBorderName =>
  dashBorderNameCheck(s);

/** All border names. Each is available as a field on the `border.sets`
 *  object, and as a method that adds the border set, on the object
 *  `border`. Example:
 * 
 *  ```ts
 *  import { border } from 'stacka';
 * 
 *  // add unmodified border set to myBox
 *  const myBorderedBox = border.thickDashedWide(myBox);

 *  // set border background color then add to myBox
 *  const borderSet = border.sets.thickDashedWide;
 *  const coloredSet = border.setBg('red')(borderSet);
 *  const myRedBorderedBox = border(coloredSet)(myBox);
 *  ```
 */
export const borderNames = [
  ...noDashBorderNames,
  ...dashedNames,
  ...dottedNames,
  ...dashedWideNames,
] as const;

export type BorderName = typeof borderNames[number] & string;

const borderNameCheck = membershipTest(borderNames);
export const isBorderName = (s: string): s is BorderName => borderNameCheck(s);
