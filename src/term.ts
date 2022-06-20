import { function as FN, readonlyArray as RA, tuple as TU } from 'fp-ts';
import { lines, unlines } from 'fp-ts-std/String';
import stringWidth from 'string-width';
import { Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';

const defaultSize: Pair<number> = [78, 24];

export const termSize: FN.Lazy<Pair<number>> = () => {
  const { isTTY, rows, columns } = process.stdout;
  return isTTY ? [Math.max(1, columns), Math.max(1, rows)] : defaultSize;
};

export const termWidth: FN.Lazy<number> = () => TU.fst(termSize());

const cropLine: Unary<number, Endo<string>> = available => line => {
  const rem = available - stringWidth(line) - 1;
  return rem < 0 ? line.slice(0, available - 2) + '…' : line;
};

export const cropToTermWidth: Endo<string> = ss => {
  const [width] = termSize();
  return FN.pipe(ss, lines, RA.map(cropLine(width)), unlines);
};
