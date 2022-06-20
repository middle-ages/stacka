import { head, last } from 'util/array';
import { Unary } from 'util/function';
import { Solid, Space } from './other';
import { BasicCornerLine, Direct, Orient } from './types';

const dirs: Unary<string, Direct> = quad => {
  const [top, right, bottom, left] = Array.from(quad);
  return { top, right, bottom, left };
};

const near = { top: '▔', right: '▕', bottom: '▁', left: '▏' } as const;

export type HNearLine = typeof near['top' | 'bottom'];
export type VNearLine = typeof near['left' | 'right'];

/**
 * Automatic corner from orthogonal border line pair is only supported for
 * certain horizontal/vertical line characters, and not for all combinations of
 * supported line characters.
 * */
export type VCornerLine =
  | BasicCornerLine
  | '▌'
  | '▐'
  | Solid
  | VNearLine
  | Space;

export type HCornerLine =
  | BasicCornerLine
  | '▀'
  | '▄'
  | Solid
  | HNearLine
  | Space;

const hv: Unary<string, Orient> = pair =>
  ({
    horizontal: head(Array.from(pair)),
    vertical: last(Array.from(pair)),
  } as const);

const thinThick: Unary<string, Orient & { thick: Orient }> = quad => {
  const [h, v, H, V] = Array.from(quad),
    [thin, thick] = [hv(h + v), hv(H + V)] as const;
  return { ...thin, thick } as const;
};

const [dotted, wide] = [thinThick('┈┊┉┋'), thinThick('╌╎╍╏')],
  dashed = {
    ...hv('┄┆'),
    thick: { ...hv('┅┇'), wide: wide.thick },
    wide,
  } as const;

const halfSolid = dirs('▀▐▄▌');

const thin = hv('─│');

const thick = {
  ...hv('━┃'),
  dotted: dotted.thick,
  dashed: dashed.thick,
} as const;

export const dash = {
  none: thin,
  dot: dotted,
  line: dashed,
  wide: wide,
  thick: {
    none: thick,
    dot: dotted.thick,
    line: dashed.thick,
    wide: wide.thick,
  },
};

export const line = {
  ...near,
  ...thin,
  thick,
  double: hv('═║'),
  dotted,
  dashed,
  near,
  halfSolid,
} as const;
