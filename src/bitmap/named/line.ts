import assert from 'assert';
import { array as AR, function as FN } from 'fp-ts';
import { dir, Direct, Orient } from 'src/geometry';
import { Unary } from 'util/function';
import { solid, space } from './other';

const direct: Unary<string, Direct> = quad => {
  assert(quad.length === 4, `quad with length≠4: ${quad}`);
  const [top, right, bottom, left] = Array.from(quad);
  return { top, right, bottom, left };
};

const orient: Unary<string, Orient> = pair => {
  assert(pair.length === 2, `orient with length≠2: ${pair}`);
  const [horizontal, vertical] = Array.from(pair);
  return { horizontal, vertical };
};

const mono = dir.singleton;

const [lineDash, dot, wide, thickDash, thickDot, thickWide] = FN.pipe(
  ['┄┆', '┈┊', '╌╎', '┅┇', '┉┋', '╍╏'],
  AR.map(orient),
);

const dashed = {
    ...lineDash,
    thick: { ...thickDash, wide: thickWide },
  } as const,
  dotted = { ...dot, thick: thickDot } as const,
  dashedWide = { ...wide, thick: thickWide } as const,
  dash = { ...dashed, dot: dotted, wide: dashedWide } as const,
  thick = {
    ...orient('━┃'),
    dash: thickDash,
    dot: thickDot,
    wide: thickWide,
  } as const;

export const line = {
  ...direct('▔▕▁▏'),
  ...orient('─│'),
  thick,
  dash,
  double: orient('═║'),
  halfSolid: direct('▀▐▄▌'),
  space: mono(space),
  solid: mono(solid),
} as const;
