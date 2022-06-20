import { function as FN, readonlyArray as RA } from 'fp-ts';
import { toSnd } from 'fp-ts-std/Tuple';
import { bitmap, Direct, Orient } from 'src/bitmap';
import { dir } from 'src/geometry';
import { BinaryC, Endo, Unary } from 'util/function';
import { picksT, pluckF, typedFromEntries } from 'util/object';
import { Tuple3, tuple3Map } from 'util/tuple';
import { fromNarrowChars } from './build';
import { Border, BorderName, borderNames, CharParts } from './types';

const [line, thick] = [bitmap.line, bitmap.line.thick];

const orientDirs = ({ horizontal, vertical }: Orient): Direct => ({
    top: horizontal,
    right: vertical,
    bottom: horizontal,
    left: vertical,
  }),
  fstHorizontal = (fst: Orient, snd: Orient) => ({
    top: fst.horizontal,
    right: snd.vertical,
    left: snd.vertical,
    bottom: fst.horizontal,
  }),
  flipH: Endo<Direct> = ({ right, left, ...rest }) => ({
    right: left,
    left: right,
    ...rest,
  }),
  flipV: Endo<Direct> = ({ bottom, top, ...rest }) => ({
    top: bottom,
    bottom: top,
    ...rest,
  }),
  flipOrient: Endo<Direct> = FN.flow(flipH, flipV);

const near: Direct = FN.pipe(line, picksT(dir.all), flipOrient);

const borderSetLines: Record<BorderName, Direct> = {
  space: dir.singleton(bitmap.space),
  line: orientDirs(line),
  round: orientDirs(line),
  thick: orientDirs(thick),
  hThick: fstHorizontal(thick, line),
  vThick: fstHorizontal(line, thick),
  double: orientDirs(line.double),
  hDouble: fstHorizontal(line.double, line),
  vDouble: fstHorizontal(line, line.double),
  near,
  hNear: flipV(near),
  vNear: flipH(near),
  halfSolidNear: flipOrient(line.halfSolid),
  halfSolidFar: line.halfSolid,
  halfSolidStep: line.halfSolid,
  solid: dir.singleton(bitmap.solid),
};

const borderChars: BinaryC<BorderName, Direct, CharParts> = name => lines => ({
  ...lines,
  ...(name === 'round'
    ? bitmap.roundElbowsOrSpace(lines)
    : name === 'halfSolidStep'
    ? { ...lines, ...bitmap.innerCheckers }
    : bitmap.elbowsOrSpace(lines)),
});

export const basicBorderChars: Unary<BorderName, CharParts> = name =>
  FN.pipe(borderSetLines[name], borderChars(name));

const basicSetByName: Unary<BorderName, Border> = FN.flow(
  basicBorderChars,
  fromNarrowChars,
);

const basicSets: Record<BorderName, Border> = FN.pipe(
  borderNames,
  FN.pipe(basicSetByName, toSnd, RA.map),
  typedFromEntries,
);

const dashWith: BinaryC<Orient, BorderName, Border> = orient => name =>
    FN.pipe(orient, orientDirs, borderChars(name), fromNarrowChars),
  [thinDashChars, thickDashChars] = [
    [line.dotted, line.dashed, line.dashed.wide],
    [thick.dotted, thick.dashed, thick.dashed.wide],
  ] as const,
  [dot, lineDash, wide]: Tuple3<Unary<BorderName, Border>> = FN.pipe(
    [...thinDashChars],
    tuple3Map(dashWith),
  ),
  [thickDot, thickLineDash, thickWide]: Tuple3<Unary<BorderName, Border>> =
    FN.pipe([...thickDashChars], tuple3Map(dashWith)),
  [dashes, thickDashes] = [
    (name: BorderName) =>
      ({
        dot: dot(name),
        line: lineDash(name),
        wide: wide(name),
      } as const),
    (name: BorderName) =>
      ({
        dot: thickDot(name),
        line: thickLineDash(name),
        wide: thickWide(name),
      } as const),
  ];

/** Tree of named borders in a dictionary by group */
export const sets = {
  ...basicSets,
  dash: {
    ...dashes('line'),
    thick: thickDashes('thick'),
    round: dashes('round'),
  },
  halfSolid: {
    near: basicSets.halfSolidNear,
    far: basicSets.halfSolidFar,
  },
} as const;

const named = FN.pipe(
  borderNames,
  FN.pipe(sets, pluckF, toSnd, RA.map),
  Object.fromEntries,
) as Record<BorderName, Border>;

const dash = sets.dash;
const dashedFlat = {
  'dash.dot': dash.dot,
  'dash.line': dash.line,
  'dash.wide': dash.wide,

  'dash.round.dot': dash.round.dot,
  'dash.round.line': dash.round.line,
  'dash.round.wide': dash.round.wide,

  'dash.thick.dot': dash.thick.dot,
  'dash.thick.line': dash.thick.line,
  'dash.thick.wide': dash.thick.wide,
} as const;

/** Flat dictionary border sets by name` */
export const all = { ...named, ...dashedFlat } as const;

export type NamedSets = typeof all;

export type SetName = keyof NamedSets;

export const isSetName = (o: string): o is SetName => o in all;
