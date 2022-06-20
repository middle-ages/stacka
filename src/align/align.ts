import { Lens } from 'monocle-ts/lib/Lens';
import { Unary } from 'util/function';
import { alignColumn, alignColumns } from './columns';
import { hLens, vLens } from './lens';
import { alignRows, alignRowsWith } from './rows';
import {
  Align,
  hvAlign,
  HAlign,
  VAlign,
  Alignments,
  alignments,
} from './types';

export interface align extends Alignments {
  (hAlign: HAlign): Unary<VAlign, Align>;
  hLens: Lens<Align, HAlign>;
  vLens: Lens<Align, VAlign>;
  rowsWith: typeof alignRowsWith;
  rows: typeof alignRows;
  column: typeof alignColumn;
  columns: typeof alignColumns;
}

export const align = hvAlign as align;

Object.assign(align, {
  hLens,
  vLens,
  rowsWith: alignRowsWith,
  rows: alignRows,
  column: alignColumn,
  columns: alignColumns,
  ...alignments,
});
