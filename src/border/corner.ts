import { array as AR, function as FN, show as SH } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { ObjectEntries, typedFromEntries } from 'util/object';
import { Tuple4 } from 'util/tuple';

export const corners = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
] as const;

export type Corners = typeof corners;
export type Corner = string & Corners[number];

export type CornerMap = { [K in Corner]: K };

export const Corner: CornerMap = typedFromEntries(
  corners.map(dup) as ObjectEntries<CornerMap>,
);

export const mapCorners = <R>(f: Unary<Corner, R>) =>
  FN.pipe([...corners], AR.map(f)) as Tuple4<R>;

export const cornerSym = {
  topLeft: '↖',
  topRight: '↗',
  bottomLeft: '↙',
  bottomRight: '↘',
} as const;

export const showCorner: SH.Show<Corner> = {
  show: corner => cornerSym[corner],
};
