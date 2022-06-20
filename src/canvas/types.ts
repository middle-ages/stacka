import { option as OP } from 'fp-ts';
import { Pos, Rect, rect, Size } from 'src/geometry';
import { RowList } from 'src/types';
import { Unary } from 'util/function';
import { MaybeChar } from 'util/string';

export type Canvas<T> = {
  nodes: T[];
};

export interface Painter<T> {
  fillChar: MaybeChar;
  pos: Unary<T, Pos>;
  size: Unary<T, Size>;
  paint: Unary<T, RowList>;
}

export const paintRect: Painter<Rect> = {
  fillChar: OP.none,
  pos: rect.pos.get,
  size: rect.size.get,
  paint: rect.paint,
};
