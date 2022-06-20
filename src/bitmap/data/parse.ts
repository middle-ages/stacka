import { array as AR, function as FN } from 'fp-ts';
import { transpose } from 'fp-ts-std/Array';
import { tail } from 'util/array';
import { Unary } from 'util/function';
import { lines, split } from 'util/string';
import { Matrix, Px, PxRow, resolution } from './types';

const linesPerRow = resolution + 1; // line with actual glyphs

const parsePx: Unary<string, Px> = char => (char === '#' ? '#' : '⁺'),
  parseLine = (line: string) =>
    FN.pipe(line, Array.from, AR.map(parsePx)) as PxRow;

export const parseDef = (lines: string[]) =>
  FN.pipe(lines, AR.map(parseLine)) as Matrix;

const parseRow: Unary<string[], [string, Matrix][]> = ([
  labelLine,
  ...bitmapLines
]) => {
  const labels = FN.pipe(
      labelLine,
      split(/\s+/),
      AR.filter(s => s.length > 0),
      AR.map(s => s.replace('␠', ' ')),
    ),
    matrices = FN.pipe(
      bitmapLines,
      AR.map(split(/\s/)),
      transpose,
      AR.map(parseDef),
    );

  return FN.pipe(labels, AR.zip(matrices));
};

export const parse: Unary<string, [string, Matrix][]> = FN.flow(
  lines,
  tail,
  AR.chunksOf(linesPerRow),
  AR.chain(parseRow),
);
