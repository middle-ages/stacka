import * as BLE from 'color-blend';
import { function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { typedKeys } from 'util/object';
import { Pair } from 'util/tuple';
import { Color, RgbaColor, toRgbaColor } from './types';
import { isEmpty } from './ops';

export const cssBlendModes = typedKeys(BLE);

export const blendModes = [
  ...cssBlendModes,
  'over',
  'under',
  'combineOver',
  'combineUnder',
] as const;

export type CssBlendMode = typeof cssBlendModes[number] | 'default';

/**
 * Beyond the CSS color blends, we make available _four_ helpful blend modes:
 *
 * 1. over - ignores bottom layer, only top is composited. This is an alias to
 *    the `normal` CSS blend mode
 * 2. under - ignores top layer, only bottom is composited
 * 3. combineOver - like `over` in that bottom styles are ignored, but _does_ combine runes
 * 4. combineUnder - like `under` in that top styles are ignored, but _does_ combine runes
 *
 */
export type BlendMode = typeof blendModes[number];

export const defaultBlendMode = 'combineOver';

/**
 * Wrap the CSS blend modes for handling of the _four_ special cases:
 *
 * 1. 'combineOver'
 * 1. 'over'
 * 1. 'combineUnder'
 * 1. 'under'
 *
 * @param mode The blend mode to use.
 * @returns A function that will blend two colors.
 */
export const blend: Unary<BlendMode, Unary<Pair<Color>, RgbaColor>> =
  mode =>
  ([lower, upper]) => {
    const [lowerRgba, upperRgba] = FN.pipe(
      [lower, upper],
      mapBoth(toRgbaColor),
    );

    //    console.log({ mode, lower, upper });

    return isEmpty(upper)
      ? lowerRgba
      : isEmpty(lower)
      ? upperRgba
      : mode === 'under' || mode === 'combineUnder'
      ? lowerRgba
      : mode === 'over' ||
        mode === 'combineOver' ||
        (mode as CssBlendMode) === 'default'
      ? upperRgba
      : upperRgba.a === 0
      ? lowerRgba
      : lowerRgba.a === 0
      ? upperRgba
      : BLE[mode](lowerRgba, upperRgba);
  };
