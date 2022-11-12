import { RgbaColor } from 'colord';
import { function as FN, predicate as PRE } from 'fp-ts';
import { BinaryC, Endo, Unary } from 'util/function';
import { ModLens } from 'util/lens';
import { fromKeys } from 'util/object';
import * as OPA from './opacity';
import { Level } from './opacity';
import * as RGB from './rgba';
import { asColord, Color, normalize, normalized } from './types';

const opacityOps: Record<Level, Endo<Color>> = OPA.opacityRecord(level =>
  FN.flow(normalize, FN.pipe(level, OPA.levelAt, RGB.a.set)),
);

export const { opaque, semiOpaque, semiTransparent, transparent } = opacityOps;

export const isEmpty: PRE.Predicate<Color> = normalized(c => c === 0),
  isTransparent: PRE.Predicate<Color> = normalized(RGB.isTransparent);

// there are 3 types of colord ops we delegate: those with 0 args, 1 arg, and
// those with 0 OR 1 args
const nullary = ['grayscale', 'invert'] as const,
  unary = ['hue'] as const,
  optional = ['darken', 'desaturate', 'lighten', 'rotate', 'saturate'] as const;

type NullaryOp = typeof nullary[number];
type UnaryOp = typeof unary[number];
type OptionalOp = typeof optional[number];

const nullaryOp: Unary<NullaryOp, Unary<Color, RgbaColor>> = op => c =>
    asColord(c)[op]().rgba,
  unaryOp: Unary<UnaryOp, BinaryC<number, Color, RgbaColor>> = op => n => c =>
    asColord(c)[op](n).rgba,
  optionalOp =
    (op: OptionalOp) =>
    (n?: number): Unary<Color, RgbaColor> =>
    c =>
      asColord(c)[op](n).rgba;

/**
 * ### [Colord](https://github.com/omgovich/colord#api) Conversion,
 * Manipulation, and Analysis
 *
 * See [colord docs](https://github.com/omgovich/colord#api) for more
 * information about these operations.
 */
export const ops = {
  ...FN.pipe(nullaryOp, fromKeys(nullary)),
  ...FN.pipe(unaryOp, fromKeys(unary)),
  ...FN.pipe(optionalOp, fromKeys(optional)),
};

export type OpName = keyof typeof ops;

export const {
  darken,
  desaturate,
  grayscale,
  hue,
  invert,
  lighten,
  rotate,
  saturate,
} = ops;

export const delegateMods = <T>(mod: Unary<Endo<Color>, Endo<T>>) => ({
  ...FN.pipe(FN.flow(nullaryOp, mod), fromKeys(nullary)),
  ...fromKeys(unary)(op => FN.flow(unaryOp(op), mod)),
  ...fromKeys(optional)(op => FN.flow(optionalOp(op), mod)),
  ...fromKeys(OPA.levelNames)(k => mod(opacityOps[k])),
});

/**
 * Given a lens from `T` to `Color`, returns a record of color queries and
 * operations on `T`
 */
export const delegateOps = <T>(lens: ModLens<T, Color>) => ({
  ...delegateMods(lens.mod),
  isEmpty: FN.flow(lens.get, isEmpty),
  isTransparent: FN.flow(lens.get, isTransparent),
});
