import { array as AR, function as FN } from 'fp-ts';
import { applyEvery } from 'fp-ts-std/Function';
import { lines } from 'fp-ts-std/String';
import * as AL from 'src/align';
import { backdrop } from 'src/backdrop';
import { color } from 'src/color';
import * as GE from 'src/geometry';
import { Rect } from 'src/geometry';
import { grid as GR, Grid } from 'src/grid';
import { Endo, Unary } from 'util/function';
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
  const grid: Grid =
    givenGrid !== undefined
      ? givenGrid
      : text !== undefined
      ? GR.parseRows([...lines(text)])
      : rows !== undefined
      ? GR.parseRows(rows)
      : row !== undefined
      ? GR.parseRow(row)
      : words !== undefined
      ? GR.parseRow(words.join(''))
      : [];

  const rectRes = FN.pipe(
    rect || GE.rect.empty,
    GE.rect.size.set(
      size === undefined
        ? AR.isEmpty(grid)
          ? GE.size.empty
          : GR.measure(grid)
        : size,
    ),

    FN.pipe(
      [...(['top', 'left', 'width', 'height', 'zOrder'] as const)],
      AR.map(k => set(GE.rect[k].set, rectArgs[k])),
      applyEvery,
    ),

    set(GE.rect.pos.set, pos),
  );

  const alignRes = FN.pipe(
    align ?? defaultAlign,
    horizontal ? set(AL.align.hLens.set, horizontal) : FN.identity,
    vertical ? set(AL.align.vLens.set, vertical) : FN.identity,
  );

  const actualBackdrop = FN.pipe(
    gridFg !== undefined
      ? backdrop.solidFg(gridFg)
      : gridBg !== undefined
      ? backdrop.solidBg(gridBg)
      : backdropImage
      ? backdrop.stretch(backdropImage)
      : givenBackdrop ?? backdrop.empty,
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
  fromRows: Unary<string[], Block> = rows => build({ rows });
