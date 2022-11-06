import { array as AR, function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { bitmap } from 'src/bitmap';
import { dir, Direct, Orient } from 'src/geometry';
import { Unary } from 'util/function';
import { Tuple3 } from 'util/tuple';
import { BorderName, DashBorderName, NoDashBorderName } from './types';

const [byDir, byOrient, flipDir, hFlipDir, vFlipDir] = [
  dir.pickDirs<string>(),
  dir.fromOriented<string>(),
  dir.flip<string>(),
  dir.hFlip<string>(),
  dir.vFlip<string>(),
];

const bm = bitmap.line,
  dashed = bm.dash;

const [line, beveled] = FN.pipe(bm, fork([byOrient, byDir])),
  thick = byOrient(bm.thick),
  near = flipDir(beveled),
  halfSolidNear = flipDir(bm.halfSolid);

// take the horizontal lines from the 1st, vertical from the 2nd
const hFrom = (fst: Orient, snd: Orient) => ({
  top: fst.horizontal,
  right: snd.vertical,
  left: snd.vertical,
  bottom: fst.horizontal,
});

const noDash: Record<NoDashBorderName, Direct> = {
  space: bm.space,
  solid: bm.solid,

  line,
  round: line,

  thick,
  hThick: hFrom(bm.thick, bm),
  vThick: hFrom(bm, bm.thick),

  near,
  beveled,
  hMcGugan: hFlipDir(near),
  vMcGugan: vFlipDir(near),

  double: byOrient(bm.double),
  hDouble: hFrom(bm.double, bm),
  vDouble: hFrom(bm, bm.double),

  halfSolid: bm.halfSolid,
  halfSolidNear,
  halfSolidFar: bm.halfSolid,

  hHalfSolid: hFlipDir(halfSolidNear),
  vHalfSolid: vFlipDir(halfSolidNear),
};

const [orientDash, orientDot, orientWide] = FN.pipe(
  [dashed, dashed.dot, dashed.wide],
  AR.map(byOrient),
) as Tuple3<Direct>;

const dash = {
    dashed: orientDash,
    thickDashed: byOrient(dashed.thick),
    roundDashed: orientDash,
  } as const,
  dot = {
    dotted: orientDot,
    thickDotted: byOrient(dashed.dot.thick),
    roundDotted: orientDot,
  } as const,
  wide = {
    dashedWide: orientWide,
    thickDashedWide: byOrient(dashed.wide.thick),
    roundDashedWide: orientWide,
  } as const;

const dashLines: Record<DashBorderName, Direct> = { ...dash, ...dot, ...wide },
  byName: Record<BorderName, Direct> = { ...noDash, ...dashLines };

export const borderLines: Unary<BorderName, Direct> = n => byName[n];
