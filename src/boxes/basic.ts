import { function as FN } from 'fp-ts';
import { border } from 'src/border';
import { box } from 'src/box';

export const buildLine: typeof box.buildBox = FN.flow(box, border.line);

const lineFns = {
  of: FN.flow(box.of, border.line),
  fromRow: FN.flow(box.fromRow, border.line),
  fromWords: FN.flow(box.fromWords, border.line),
  fromRows: FN.flow(box.fromRows, border.line),
  centered: FN.flow(box.centered, border.line),
} as const;

export type line = typeof buildLine & typeof lineFns;
export const line = buildLine as line;

Object.assign(line, lineFns);
