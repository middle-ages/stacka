import { bold } from 'ansis/colors';
import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  record as RC,
  tuple as TU,
} from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { lines } from 'fp-ts-std/String';
import { dup, mapBoth, withSnd } from 'fp-ts-std/Tuple';
import { Endomorphism as Endo } from 'fp-ts/lib/Endomorphism';
import {
  Backdrop,
  backdrop as bd,
  bitmap,
  border as br,
  Box,
  box,
  Color,
  color,
  grid,
  hex,
  size,
} from 'src/stacka';
import stringWidth from 'string-width';
import * as HE from '../helpers';

/**
 * Report on all built-in box backdrops and a pair of custom backdrop
 * examples
 */

const bricksExample = FN.pipe(
  [bitmap.tee.bottom, bitmap.tee.top],
  dup<[string, string]>,
  TU.mapSnd(TU.swap),
  mapBoth(join('')),
  FN.pipe(['white', hex('#8a350088')], color.of, AR.map),
  grid.parseRows,
  bd.repeat,
);

const moonPhase: Backdrop = FN.pipe(
  '🌘🌘🌗🌖🌕🌔🌓🌒🌑',
  grid.parseRow,
  bd.repeat,
);

const transparent = color.setOpacityLevel('transparent');

const colors = {
  evenOdd: FN.pipe(
    ['lighterGrey', 'white'] as [Color, Color],
    mapBoth(transparent),
  ),
  altCells: FN.pipe(
    ['white', 'lighter', 'light', 'lighterGrey', 'darkGrey'],
    AR.map(transparent),
  ),
  rainbow: FN.pipe(color.rainbow8, AR.map(transparent)),
};

const backdrops = {
  empty: bd.empty,
  visible: bd.visible,
  coloredChar: FN.pipe('⁺', bd.coloredChar('red')),
  solidFg: bd.solidFg('orange'),
  solidBg: bd.solidBg('yellow'),
  grid: bd.grid,
  charGrid: bd.charGrid,
  evenOddRows: bd.evenOddRows(colors.evenOdd),
  evenOddColumns: bd.evenOddColumns(colors.evenOdd),
  altRows: bd.altRows(colors.rainbow),
  altColumns: bd.altColumns(colors.rainbow),
  altCells: bd.altCells(colors.altCells),
  halfCheckers: bd.halfCheckers,
  checkers1x1: bd.checkers1x1,
  checkersMxN: bd.checkersMxN([4, 2]),
  cmykQuadrants: bd.cmykQuadrants,
  'custom🧱bricks': bricksExample,
  ' custom\n moon phase': moonPhase,
} as const;

type Name = keyof typeof backdrops;

const names = Object.keys(backdrops) as Name[];

const labelStyle: Partial<Record<Name, Endo<string>>> = {
  solidFg: color.of(['black', 'orange']),
  solidBg: color.of(['black', 'yellow']),
  altCells: color('black'),
  checkersMxN: color.of(['darkBlue', 'grey']),
  checkers1x1: FN.flow(bold, color.of(['darkBlue', 'grey'])),
  ...(FN.pipe(
    ['evenOddRows', 'evenOddColumns', 'altColumns', 'altRows', 'cmykQuadrants'],
    AR.map(withSnd(color('darkBlue'))),
    Object.fromEntries,
  ) as Partial<Record<Name, Endo<string>>>),
};

const reportSize = FN.pipe(
  Math.max(...FN.pipe(names, RA.chain(lines), RA.map(stringWidth))),
  size.square,
  size.halfHeight,
);

const report = (name: Name, backdrop: Backdrop): Box => {
  const style = labelStyle[name];
  return box.centered({
    text: FN.pipe(name, style === undefined ? FN.identity : style),
    size: reportSize,
    apply: FN.pipe(br.sets.dash.dot, br.roundCorners, br.setFg('dark'), br),
    blend: 'normal',
    backdrop,
  });
};

FN.pipe(
  FN.pipe(backdrops, RC.mapWithIndex(report), Object.entries) as [Name, Box][],
  AR.map(TU.snd),
  HE.gallery('Built-in & Custom Backdrops'),
  box.print,
);
