import { readonlyArray as RA, function as FN, option as OP } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { Optional } from 'monocle-ts/lib/Optional';
import { typedKeys } from 'util/object';
import { Endo, Unary } from 'util/function';
import { ModLens, modLens, propLens } from 'util/lens';
import { Tuple3 } from 'util/tuple';
import * as CNV from './convert';
import { Color, MaybeColor } from './named';
import { opacityLevels, opacityLevelAt, OpacityLevel, Rgba } from './types';

const prop = FN.flow(propLens<Rgba>(), modLens);

export const [r, g, b, a] = [prop('r'), prop('g'), prop('b'), prop('a')];

export const getRgb: Unary<Color, Tuple3<number>> = FN.flow(
  CNV.normalize,
  fork([r.get, g.get, b.get]),
);

export const setRgb: Unary<Tuple3<number>, Endo<Color>> =
  ([r, g, b]) =>
  c => ({ r, g, b, a: CNV.normalize(c).a });

export const rgb: ModLens<Color, Tuple3<number>> = modLens({
  get: getRgb,
  set: setRgb,
});

export const opacity: ModLens<Color, number> = modLens({
  get: FN.flow(CNV.normalize, a.get),
  set: a => c => ({ ...CNV.normalize(c), a }),
});

export const maybeRgb: Optional<MaybeColor, Tuple3<number>> = {
  getOption: OP.map(getRgb),
  set: FN.flow(setRgb, OP.map),
};

export const maybeOpacity: Optional<MaybeColor, number> = {
  getOption: OP.map(opacity.get),
  set: FN.flow(opacity.set, OP.map),
};

export const setOpacityLevel: Unary<OpacityLevel, Endo<Color>> = FN.flow(
  opacityLevelAt,
  opacity.set,
);

export const [
  opaque,
  semiOpaque,
  semiTransparent,
  transparent,
]: readonly Endo<Color>[] = FN.pipe(
  opacityLevels,
  typedKeys,
  RA.map(setOpacityLevel),
);
