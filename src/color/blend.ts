import * as BLE from 'color-blend';
import { function as FN, option as OP } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { BinOpT, Unary } from 'util/function';
import { normalize } from './convert';
import { Color, MaybeColor } from './named';
import { BlendMode } from './types';

export const modes: BlendMode[] = [
  'over',
  'under',
  'combineOver',
  'combineUnder',
  'normal',
  'colorBurn',
  'colorDodge',
  'darken',
  'difference',
  'exclusion',
  'hardLight',
  'hue',
  'lighten',
  'luminosity',
  'multiply',
  'overlay',
  'saturation',
  'screen',
  'softLight',
];

type CssBlendMode = keyof typeof BLE;

export const blend: Unary<CssBlendMode, BinOpT<Color>> = mode =>
  FN.flow(mapBoth(normalize), FN.tupled(BLE[mode]));

export const blendColor: Unary<BlendMode, BinOpT<Color>> =
  mode =>
  ([below, above]) =>
    mode === 'under' || mode === 'combineUnder'
      ? below
      : mode === 'over' || mode === 'combineOver'
      ? above
      : FN.pipe([below, above], blend(mode));

export const blendMaybeColor: Unary<BlendMode, BinOpT<MaybeColor>> =
  mode =>
  ([below, above]) =>
    FN.pipe(
      above,
      OP.fold(FN.constant(below), aboveColor =>
        FN.pipe(
          below,
          OP.fold(FN.constant(above), belowColor =>
            FN.pipe([belowColor, aboveColor], blendColor(mode), OP.some),
          ),
        ),
      ),
    );

export const defaultBlendMode = 'combineOver';

export const defaultBlend = blendColor(defaultBlendMode);
