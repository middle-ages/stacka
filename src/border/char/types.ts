import { Char } from 'util/string';
import { BorderSet } from './basicBorderSets';

export type T5<T> = [T, T, T, T, T];

export type Pixel = '#' | '.';

export type PixelRow = `${Pixel}${Pixel}${Pixel}${Pixel}${Pixel}`;

export type PixelMat = string;

export type Mat = T5<PixelRow>;

export interface Glyph {
  key: string;
  char: Char;
  display: Mat;
}

export type GlyphName = typeof glyphNames[number];

/** Per border set map of glyph name ⇒ glyph */
export type GlyphMap = Record<GlyphName, Glyph>;

/** Global map of glyph display matrix ⇒ glyph */
export type KeyMap = Record<string, Glyph>;

/** Global map of glyph char ⇒ glyph */
export type CharMap = Record<string, Glyph>;

export interface Registry {
  glyphMap: Record<BorderSet, GlyphMap>;
  keyMap: KeyMap;
  charMap: CharMap;
}

export const glyphNames = [
  'topLeftCorner',
  'topTee',
  'topRightCorner',
  'vLine',
  'leftTee',
  'cross',
  'rightTee',
  'hLine',
  'bottomLeftCorner',
  'bottomTee',
  'bottomRightCorner',
] as const;
