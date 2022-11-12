import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  record as RC,
  tuple as TU,
} from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { curry2 } from 'fp-ts-std/Function';
import { lines } from 'fp-ts-std/String';
import { dup, mapBoth, withSnd } from 'fp-ts-std/Tuple';
import { Endomorphism as Endo } from 'fp-ts/lib/Endomorphism';
import {
  Backdrop,
  backdrop as bd,
  bitmap,
  BlendMode,
  border as br,
  Box,
  box,
  color,
  grid,
  size,
} from 'src/stacka';
import stringWidth from 'string-width';
import * as HE from '../helpers';

/**
 * Report on all built-in box backdrops and a pair of custom backdrop
 * examples
 */

const { semiGray, semiWhite, lightCrimson, darkCrimson, darkGray } = HE.colors;

const bricksExample = FN.pipe(
  [bitmap.tee.bottom, bitmap.tee.top],
  dup<[string, string]>,
  TU.mapSnd(TU.swap),
  mapBoth(join('')),
  AR.map(color.of(['white', 0x89_00_35_8a])),
  curry2(grid.parseRows)('center'),
  bd.repeat,
);

const moonPhase: Backdrop = FN.pipe(
  AR.replicate(7, '🌘🌘🌗🌖🌕🌔🌓🌒🌑'),
  FN.pipe('center', curry2(grid.parseRows)),
  bd.center,
);

const colors = {
  evenOdd: [darkGray, semiWhite],
  altCells: FN.pipe(
    [
      semiWhite,
      HE.grays[88],
      HE.grays[82],
      HE.grays[74],
      HE.grays[60],
      HE.grays[75],
      HE.grays[90],
    ],
    AR.map(HE.glass),
  ),
  rainbow: FN.pipe(
    color.rainbow8,
    AR.map(FN.flow(color.desaturate(0.25), color.lighten(0.1), HE.glass)),
  ),
} as const;

const backdrops = {
  empty: bd.empty,
  visible: bd.visible,
  coloredChar: FN.pipe('⁺', bd.coloredChar(lightCrimson)),
  solidFg: bd.solidBg(HE.grays[75]),
  solidBg: bd.solidBg(HE.grays[25]),
  grid: bd.grid,
  charGrid: bd.charGrid,
  evenOddRows: bd.evenOddRows([...colors.evenOdd]),
  evenOddColumns: bd.evenOddColumns([...colors.evenOdd]),
  altRows: bd.altRows(colors.rainbow),
  altColumns: bd.altColumns(colors.rainbow),
  altCells: bd.altCells(colors.altCells),
  halfCheckers: bd.halfCheckers,
  checkers1x1: bd.checkers1x1,
  checkersMxN: bd.checkersMxN([4, 2]),
  cmykQuadrants: bd.cmykQuadrants,
  'custom🧱bricks': bricksExample,
  'custom\nmoon  box': moonPhase,
} as const;

type Name = keyof typeof backdrops;

const names = Object.keys(backdrops) as Name[];

const labelStyle: Partial<Record<Name, Endo<string>>> = {
  coloredChar: color.fg('white'),
  solidFg: color.fg('black'),
  grid: color.fg('black'),
  charGrid: color.fg('black'),

  altCells: color.fg('black'),
  checkers1x1: color.of([darkCrimson, semiGray]),
  checkersMxN: color.bg('gray'),

  ...(FN.pipe(
    ['evenOddRows', 'evenOddColumns', 'altRows', 'altColumns'],
    AR.map(withSnd(color.of(['black', semiWhite]))),
    Object.fromEntries,
  ) as Partial<Record<Name, Endo<string>>>),

  cmykQuadrants: color.fg('black'),
};

const blends: Partial<Record<Name, BlendMode>> = {
  checkersMxN: 'multiply',
  altRows: 'darken',
  altColumns: 'darken',
  evenOddRows: 'multiply',
  evenOddColumns: 'darken',
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
    apply: br.withFg('roundDotted', HE.grays[20]),
    blend: blends[name] ?? 'screen',
    backdrop,
  });
};

FN.pipe(
  FN.pipe(backdrops, RC.mapWithIndex(report), Object.entries) as [Name, Box][],
  AR.map(TU.snd),
  HE.colorGallery([1, 0])('Built-in & Custom Backdrops'),
  box.print,
);
