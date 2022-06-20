import assert from 'assert';
import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { bitmap } from 'src/bitmap';
import { Box, box } from 'src/box';
import { color as co, Color } from 'src/color';
import { glyph } from 'src/glyph';
import { head } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair, Tuple3 } from 'util/tuple';
import { mapBoth } from 'fp-ts-std/Tuple';

const groupIndentWidth = 3;

const color = {
  bg: { char: 'white', inner: 'light', group: 'dark' },
  fg: { char: 'darkBlue', inner: 'darkGrey' },
} as const;

const outerBorderPair: Pair<Color> = [color.bg.group, color.bg.inner];

const style = {
  char: co.of([color.fg.char, color.bg.char]),
  innerBorder: co.of([color.fg.inner, color.bg.inner]),
  outerBorder: co.of(outerBorderPair),
  outerInverse: FN.pipe(outerBorderPair, TU.swap, co.of),
} as const;

const bl = bitmap.line,
  halfSolid = bl.halfSolid;

const chars = {
  halfSolid,
  innerBorder: '▸',
  hBorder: bl.vertical,
  vBorder: bl.horizontal,
  chunkBorder: halfSolid.bottom,
  cross: bitmap.cross,
};

const deco = {
  innerBorder: style.innerBorder(chars.innerBorder),
  hBorder: style.outerBorder(chars.hBorder),
  vBorder: style.outerBorder(chars.vBorder),
  chunkUpperBorder: style.outerBorder(chars.chunkBorder),
  chunkLowerBorder: style.outerInverse(chars.chunkBorder),
  cross: style.outerBorder(chars.cross),
};

const indent: Endo<Box> = b =>
    FN.pipe(b, FN.pipe(box({ width: groupIndentWidth }), box.rightOf)),
  strut: BinaryC<string, number, Box> = c => width =>
    FN.pipe(AR.replicate(width, c), box.fromWords),
  [innerStrut, upperStrut, lowerStrut]: Tuple3<Unary<number, Box>> = [
    width =>
      FN.pipe(
        AR.replicate(width - 1, deco.vBorder),
        AR.prepend(deco.cross),
        box.fromWords,
      ),
    ...FN.pipe([deco.chunkUpperBorder, deco.chunkLowerBorder], mapBoth(strut)),
  ];

/*
const chainInGroupReport: Unary<string[], Box> = FN.flow(
  AR.map(bitmap.matrixByChar),
  AR.map(framedQuadRes([style.char, ...dup(co.of(['light', 'light']))])),
  AR.map(box.fromRows),
  box.catRightOf,
);
*/

const chainInGroupReport: Unary<string[], Box> = FN.flow(
  AR.map(style.char),
  AR.intersperse(deco.innerBorder),
  AR.prepend(deco.hBorder),
  box.fromWords,
);

const chunkReport: BinaryC<number, string[][], Box[]> = width => chains => {
  const chainBoxes: Box[] = FN.pipe(chains, AR.map(chainInGroupReport)),
    groupWidth = FN.pipe(chainBoxes, head, box.width.get),
    columns = Math.floor(width / (groupWidth || 1)),
    chunk = Math.ceil(chainBoxes.length / (columns || 1));

  assert(groupWidth < width, 'terminal narrower than single chain');

  return FN.pipe(
    chainBoxes,
    AR.chunksOf(chunk),
    FN.pipe(groupWidth, innerStrut, AR.intersperse, AR.map),
    AR.map(box.catBelow),
    AR.map(b =>
      box.catBelow([lowerStrut(groupWidth), b, upperStrut(groupWidth)]),
    ),
  );
};

export const relationChainsReport: BinaryC<number, string[][], Box> =
  width => chains => {
    const groupReport: Unary<string[][], Box> = FN.flow(
      chunkReport(width - groupIndentWidth - 1),
      box.catRightOfTop,
    );

    return FN.pipe(
      chains,
      glyph.chainsBySize,
      AR.map(groupReport),
      box.catBelow,
      box.setSolidBg(color.bg.group),
      indent,
    );
  };
