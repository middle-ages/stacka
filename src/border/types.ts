import { function as FN, option as OP } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import { noColor, TextColor } from 'util/color';
import { BinaryC, Endo, Unary } from 'util/function';
import { lensAt } from 'util/lens';
import { monoObject } from 'util/object';
import { MaybeChar } from 'util/string';
import { BorderDir, borderDirs } from './dir';

export interface Border {
  parts: PartMap;
  style: StyleMap;
}

export type PartMap = Record<BorderDir, MaybeChar>;
export type StyleMap = Record<BorderDir, TextColor>;
export type Part = [MaybeChar, TextColor];
export type DirTo<T> = Unary<BorderDir, T>;
export type DirGet<R> = DirTo<Unary<Border, R>>;
export type DirSet<R> = DirTo<Unary<R, Endo<Border>>>;

export const emptyPart: Part = [OP.none, noColor];

export const monoStyleMap: Unary<TextColor, StyleMap> = c =>
  FN.pipe(borderDirs, monoObject(c));

export const buildBorder: BinaryC<TextColor, PartMap, Border> =
  style => parts => ({
    parts,
    style: monoStyleMap(style),
  });

export const emptyPartMap: PartMap = FN.pipe(borderDirs, monoObject(OP.none));

export const monoBorder: Unary<PartMap, Border> = buildBorder(noColor),
  emptyBorder: Border = monoBorder(emptyPartMap);

export const modBorderParts: BinaryC<Border, Endo<PartMap>, Border> = b => f =>
  FN.pipe(b, FN.pipe(borderLens.parts, LE.modify(f)));

const lens = lensAt<Border>();

export const borderLens = {
  parts: lens('parts'),
  style: lens('style'),
} as const;

export type BorderLens = typeof borderLens;

export const [partMapLens, styleMapLens]: [
  DirTo<Lens<Border, MaybeChar>>,
  DirTo<Lens<Border, TextColor>>,
] = [
  dir => FN.pipe(borderLens.parts, LE.prop(dir)),
  dir => FN.pipe(borderLens.style, LE.prop(dir)),
];

export const partLens = fork([partMapLens, styleMapLens]);

export const getBorderAt: DirGet<Part> = dir => {
    const [parts, style] = partLens(dir);
    return fork([parts.get, style.get]);
  },
  setBorderAt: DirSet<Part> =
    dir =>
    ([c, s]) => {
      const [parts, style] = partLens(dir);
      return FN.flow(parts.set(c), style.set(s));
    };

export type DirMod = DirTo<
  Unary<[Endo<MaybeChar>, Endo<TextColor>], Endo<Border>>
>;

export const modBorderAt: DirMod =
  dir =>
  ([f, g]) => {
    const [parts, style] = partLens(dir);
    return FN.flow(FN.pipe(parts, LE.modify(f)), FN.pipe(style, LE.modify(g)));
  };

interface border extends BorderLens {
  (style: TextColor): Unary<PartMap, Border>;
  get: DirGet<Part>;
  set: DirSet<Part>;
  mod: DirMod;
}

export const border = buildBorder as border;

border['get'] = getBorderAt;
border['set'] = setBorderAt;
border['mod'] = modBorderAt;

Object.assign(border, borderLens);
