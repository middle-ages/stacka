import { function as FN } from 'fp-ts';
import { Unary } from 'util/function';
import { FromKeys, fromKeys, mapValues, typedKeys } from 'util/object';
import { Tuple4 } from 'util/tuple';

/**
 * A record of named opacity levels.
 *
 * The values are floats in range of 0-1. Higher values mean _more opaque_.
 */
export const levels = FN.pipe(
  {
    opaque: 1,
    semiOpaque: 0.6,
    semiTransparent: 0.2,
    transparent: 0,
  },
  mapValues(o => Math.floor(o * 255)),
);

/** A named opacity level. */
export type Level = keyof typeof levels;

export const levelNames: Tuple4<Level> = typedKeys(levels);

/**
 * Given an opacity level, return the opacity level as a number between 0 and 255.
 */
export const levelAt: Unary<Level, number> = l => levels[l];

/**
 * Given a function of type `OpacityLevel ⇒ R`, will return a record of
 * `OpacityLevel` to `R`.
 */
export const opacityRecord: FromKeys<Level> = fromKeys(levelNames);
