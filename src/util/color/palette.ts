import { toGen } from 'util/array';
import { Lazy, Unary } from 'util/function';
import { hex } from 'util/hex';
import { Color } from './types';

export type Palette = Color[];

export const rainbow: Palette = [
  hex('#f00'),
  hex('#e90'),
  hex('#dd0'),
  hex('#0f0'),
  hex('#0df'),
  hex('#00f'),
  hex('#b0e'),
  hex('#f0d'),
];

export const paletteGen: Unary<Palette, Lazy<Color>> = palette => {
  const make = () => toGen(palette);

  let gen = make();

  const reset = () => {
    gen = make();
  };

  return () => {
    const res = gen();
    if (res === undefined) reset();
    else return res;

    const defined = gen();
    if (defined === undefined) throw new Error('no rotation');

    return defined;
  };
};

export const rainbowGen: Lazy<Lazy<Color>> = () => paletteGen(rainbow);
