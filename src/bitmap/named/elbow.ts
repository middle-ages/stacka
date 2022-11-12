//import assert from 'assert';
import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { corner, Corners } from 'src/geometry';
import { Unary } from 'util/function';
import { typedEntries, typedFromEntries, typedValues } from 'util/object';
import { line } from './line';
import { solid as solidChar, space as spaceChar } from './other';
import { ElbowGroup } from './types';

export const diagonals = { fromTop: '╲', fromBottom: '╱' } as const;

export const roundBySharp = {
  '┌': '╭',
  '┐': '╮',
  '└': '╰',
  '┘': '╯',
} as const;

export const sharpByRound = FN.pipe(
  roundBySharp,
  typedEntries,
  AR.map(TU.swap),
  typedFromEntries,
);

/** The round corners by direction */
export const round = FN.pipe(roundBySharp, typedValues, corner.fromTuple);

/** The sharp corners by direction */
export const sharp = FN.pipe(sharpByRound, typedValues, corner.fromTuple);

const fromQuad: Unary<string, Corners> = quad => {
  // assert(quad.length === 4, `quad with length≠4: “${quad}”`);
  const [topLeft, topRight, bottomLeft, bottomRight] = Array.from(quad);
  return { topLeft, topRight, bottomLeft, bottomRight };
};

const fromPair: Unary<string, Corners> = pair => {
  // assert(pair.length === 4, `quad with length≠4: “${pair}”`);
  const [topLeft, topRight] = Array.from(pair);
  return { topLeft, topRight, bottomLeft: topRight, bottomRight: topLeft };
};

const singleton: Unary<string, Corners> = corner.singleton;

const halfSolid = line.halfSolid,
  dup = (s: string) => s + s;

export const elbows: Record<ElbowGroup, Corners> = {
  space: singleton(spaceChar),
  solid: singleton(solidChar),

  line: fromQuad('┌┐└┘'),
  round: fromQuad('╭╮╰╯'),

  thick: fromQuad('┏┓┗┛'),
  hThick: fromQuad('┍┑┕┙'),
  vThick: fromQuad('┎┒┖┚'),

  near: singleton(spaceChar),
  beveled: fromPair(dup(diagonals.fromBottom + diagonals.fromTop)),

  hMcGugan: fromQuad(dup(line.bottom) + dup(line.top)),
  vMcGugan: fromQuad(dup(line.right + line.left)),

  double: fromQuad('╔╗╚╝'),
  hDouble: fromQuad('╒╕╘╛'),
  vDouble: fromQuad('╓╖╙╜'),

  halfSolid: fromQuad('▞▚▚▞'),
  halfSolidNear: fromQuad('▗▖▝▘'),
  halfSolidFar: fromQuad('▛▜▙▟'),

  hHalfSolid: fromQuad(dup(halfSolid.bottom) + dup(halfSolid.top)),
  vHalfSolid: fromQuad(dup(halfSolid.right + halfSolid.left)),
} as const;

export const elbowByGroup: Unary<ElbowGroup, Corners> = g => elbows[g];
