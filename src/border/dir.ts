import { array as AR, function as FN } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { BinaryC, Unary } from 'util/function';
import { ObjectEntries, pluck, typedFromEntries } from 'util/object';
import { Pair, Tuple3, TupleN } from 'util/tuple';
import { Dir, dirs, Dirs, matchDir } from '../dir';
import { Glyph, glyphByName, BorderSet, GlyphName } from './char';
import { Corner, corners, Corners } from './corner';

export type BorderDirs = [...Dirs, ...Corners];
export type BorderDir = (Dir | Corner) & string;

export type Borders = { [K in BorderDir]: K };

export const borderDirs: BorderDirs = [...dirs, ...corners];

export const mapBorderDirs = <R>(f: Unary<BorderDir, R>) =>
  FN.pipe([...dirs, ...corners], AR.map(f)) as TupleN<R, 8> & R[];

export const Borders: Borders = typedFromEntries(
  borderDirs.map(dup) as ObjectEntries<Borders>,
);

/**  What are the 3 border dirs required to show a border at a direction? */
export const dirToBorderDirs: Unary<Dir, Tuple3<BorderDir>> = dir => {
  const B = Borders;
  return FN.pipe(
    dir,
    matchDir<Tuple3<BorderDir>>(
      [B.topLeft, B.top, B.topRight],
      [B.topRight, B.right, B.bottomRight],
      [B.bottomLeft, B.bottom, B.bottomRight],
      [B.topLeft, B.left, B.bottomLeft],
    ),
  );
};

/** What is the corner pair that hugs this direction? */
export const cornerDirsOf: Unary<Dir, Pair<Corner>> = dir => {
  const [pre, , post] = dirToBorderDirs(dir);
  return [pre, post] as Pair<Corner>;
};

const borderDirToGlyphName: Record<BorderDir, GlyphName> = {
  topLeft: 'topLeftCorner',
  top: 'hLine',
  topRight: 'topRightCorner',
  right: 'vLine',
  bottomRight: 'bottomRightCorner',
  bottom: 'hLine',
  bottomLeft: 'bottomLeftCorner',
  left: 'vLine',
};

const dirToGlyph: BinaryC<BorderDir, BorderSet, Glyph> = (dir: BorderDir) =>
  glyphByName(borderDirToGlyphName[dir]);

export const dirToGlyphChar: BinaryC<BorderDir, BorderSet, string> = dir =>
  FN.flow(dirToGlyph(dir), pluck('char'));
