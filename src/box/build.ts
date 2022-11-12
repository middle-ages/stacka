import { function as FN, record as RC } from 'fp-ts';
import { Size } from 'src/geometry';
import * as AL from 'src/align';
import { Backdrop } from 'src/backdrop';
import * as BL from 'src/block';
import { Color } from 'src/color';
import { Grid } from 'src/grid';
import * as GR from 'src/grid';
import { BinaryC, Endo, Unary } from 'util/function';
import { tree } from 'util/tree';
import { Box, BoxArgs, BuildBox } from './types';

/** Create a box from a partial list of properties */
export const buildBox: BuildBox = ({
  block: givenBlock,
  nodes,
  apply,
  ...rest
}) =>
  FN.pipe(
    nodes ?? [],
    tree<BL.Block>(
      BL.block(givenBlock === undefined ? rest : { ...givenBlock, ...rest }),
    ),
    apply !== undefined ? apply : FN.identity,
  );

export const leaf: Unary<BL.BlockArgs & { apply?: Endo<Box> }, Box> = ({
  apply,
  ...blockArgs
}) => buildBox({ block: BL.block(blockArgs), apply: apply ?? FN.identity });

export const centered: Unary<
    Omit<BoxArgs, 'gridAlign' | 'gridHorizontal' | 'gridVertical'>,
    Box
  > = args => buildBox({ ...args, align: AL.align.middleCenter }),
  hCentered: Unary<Omit<BoxArgs, 'gridAlign' | 'gridHorizontal'>, Box> = args =>
    buildBox({ ...args, horizontal: 'center' }),
  vCentered: Unary<Omit<BoxArgs, 'gridAlign' | 'gridVertical'>, Box> = args =>
    buildBox({ ...args, vertical: 'middle' });

export const unsizedBranch: Unary<Box[], Box> = nodes => buildBox({ nodes });

export const empty: Box = unsizedBranch([]);

/**
 * Create a childless box from one row of text.
 *
 * ```ts
 * const myBox = box.fromRow('foo');
 * ```
 */

export const fromRow: Unary<string, Box> = row => buildBox({ row });

/**
 * Create a single row box from a list of strings that will be joined.

 * ```ts
 * const myBox = box.fromWords(['foo', 'bar']);
 * ```
 */
export const fromWords: Unary<string[], Box> = s =>
  FN.pipe(RC.singleton('words', s), buildBox);

/**
 * Create a multiline childless box.
 *
 * ```ts
 * const myBox = box.fromRows(['foo', 'bar']);
 * ```
 */
export const fromRows: Unary<string[], Box> = rows => buildBox({ rows });

/**
 * Split text by newlines and create a multiline childless box.
 *
 * ```ts
 * const myBox = box.of('foo\nbar');
 * ```
 */
export const of: Unary<string, Box> = text => buildBox({ text });

/** A 1x1 empty box */
export const cell: Box = fromRow(' ');

/** A sized box of colored spaced */
export const repeatBg: BinaryC<Size, Color, Grid> = size =>
  FN.flow(GR.spaceBg, GR.repeat(size));

export const fromBackdrop: Unary<Backdrop, Box> = backdrop =>
    buildBox({ backdrop }),
  fromBackdropImage: Unary<Grid, Box> = backdropImage =>
    buildBox({ backdropImage });
