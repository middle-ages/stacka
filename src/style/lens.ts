import { function as FN } from 'fp-ts';
import * as color from 'src/color';
import { Color, ComposedColorLenses } from 'src/color';
import { Endo, Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import * as DE from './deco';
import { Deco, DecoList, Decoration } from './deco';
import * as TY from './types';
import { Layer, Style } from './types';

export type DecoAdders = Record<Decoration, Endo<Style>>;

export interface DecoLenses extends DecoAdders {
  deco: ModLens<Style, Deco>;
  decoList: ModLens<Style, DecoList>;
}

/*
 * ### Layer Color Lenses
 *
 * `style.fg` and `style.bg` provide the same record of color lenses for both
 * layers, foreground and background.
 *
 * This includes:
 *
 * 1. `r`, `g`, `b` - lenses for RGB color channels, for example `style.fg.r` is
 *     the lens for the foreground color red component
 * 1. `h`, `s`, `l` - lenses for HSL color channels
 * 1. `a`, `opacity` - lenses for alpha channel. `a` is in range 0-255 and `opacity` 0-1
 * 1. `rgb` and `hsl` lens for opaque colors, for example `style.bg.rgb.get`
 *     will get the background color as a (colord)[https://github.com/omgovich/colord]
 *     `RgbColor` type
 * 1. `color` - a lens for get/set/mod of the entire layer color. For example
 *     to get the foreground color: `style.fg.color.get`
 */
export type LayerLens = ComposedColorLenses<Style> &
  Record<'color', ModLens<Style, Color>>;

const fgColor = modLens({ get: TY.getFg, set: TY.setFg }),
  bgColor = modLens({ get: TY.getBg, set: TY.setBg });

export const deco = modLens({ get: TY.getDeco, set: TY.setDeco }),
  decoAdders: DecoAdders = DE.decoRecord(FN.flow(DE.add, deco.mod));

const composeLayer: Unary<Layer, ComposedColorLenses<Style>> = layer =>
  color.composeColorLens(layer === 'fg' ? fgColor : bgColor);

export const layerLenses: Record<Layer, LayerLens> = {
  fg: { ...composeLayer('fg'), color: fgColor },
  bg: { ...composeLayer('bg'), color: bgColor },
};

export const decoLenses: DecoLenses = {
  ...decoAdders,
  deco,
  decoList: modLens({ get: TY.getDecoList, set: TY.setDecoList }),
};

export const { bold, inverse, italic, strikethrough, underline, decoList } =
  decoLenses;

export const { fg: fgLens, bg: bgLens } = layerLenses;
