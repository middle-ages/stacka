import { array as AR, function as FN } from 'fp-ts';
import { applyEvery } from 'fp-ts-std/Function';
import { lines } from 'fp-ts-std/String';
import * as AL from 'src/align';
import { Align } from 'src/align';
import * as BD from 'src/backdrop';
import * as color from 'src/color';
import * as GE from 'src/geometry';
import { Rect } from 'src/geometry';
import * as GR from 'src/grid';
import { Grid } from 'src/grid';
import { BinaryC, Endo, Unary } from 'util/function';
import { Block, BlockArgs, defaultAlign } from './types';

const set = <T, R>(f: Unary<T, Endo<R>>, t: T | undefined): Endo<R> =>
  t === undefined ? FN.identity : f(t);

export const build: Unary<BlockArgs, Block> = ({
  grid: givenGrid,
  words,
  row,
  rows,
  text,

  rect,
  align,
  blend,

  horizontal,
  vertical,

  backdrop: givenBackdrop,
  gridFg,
  gridBg,
  backdropImage,

  pos,
  size,
  ...rectArgs
}) => {
  const alignRes = FN.pipe(
    align ?? defaultAlign,
    horizontal ? set(AL.align.hLens.set, horizontal) : FN.identity,
    vertical ? set(AL.align.vLens.set, vertical) : FN.identity,
  );

  const preBgGrid: Grid =
    givenGrid !== undefined
      ? givenGrid
      : text !== undefined
      ? GR.parseRows(alignRes.horizontal, [...lines(text)])
      : rows !== undefined
      ? GR.parseRows(alignRes.horizontal, rows)
      : row !== undefined
      ? GR.parseRow(row)
      : words !== undefined
      ? GR.parseRow(words.join(''))
      : GR.empty();

  const grid = FN.pipe(
    preBgGrid,
    gridBg !== undefined ? GR.setBg(gridBg) : FN.identity,
  );

  const actualBackdrop = FN.pipe(
    gridFg !== undefined
      ? BD.solidFg(gridFg)
      : gridBg !== undefined
      ? BD.solidBg(gridBg)
      : backdropImage
      ? BD.stretch(backdropImage)
      : givenBackdrop ?? BD.empty,
  );

  const rectRes = FN.pipe(
    rect || GE.rect.empty,
    GE.rect.size.set(
      size === undefined
        ? GR.isEmpty(grid)
          ? GE.size.empty
          : GR.size(grid)
        : size,
    ),

    FN.pipe(
      [...(['top', 'left', 'width', 'height', 'zOrder'] as const)],
      AR.map(k => set(GE.rect[k].set, rectArgs[k])),
      applyEvery,
    ),

    set(GE.rect.pos.set, pos),
  );

  return {
    grid,
    rect: rectRes,
    align: alignRes,
    blend: blend ?? color.defaultBlendMode,
    backdrop: actualBackdrop,
  };
};

export const fromRect: Unary<Rect, Block> = rect => build({ rect }),
  fromGrid: Unary<Grid, Block> = grid => build({ grid }),
  fromRow: Unary<string, Block> = row => build({ row }),
  fromRows: Unary<string[], Block> = rows => build({ rows }),
  alignRows: BinaryC<Align, string[], Block> = align => rows =>
    build({ align, rows });
