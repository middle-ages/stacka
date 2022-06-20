import { array as AR, function as FN, monoid as MO } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { unlines } from 'fp-ts-std/String';
import { block } from 'src/block';
import { grid as GR, Grid } from 'src/grid';
import { BinaryC, callWith, Effect, Endo, Unary } from 'util/function';
import * as AL from './align';
import * as builders from './build';
import * as NO from './nodes';
import { exportRect as RCT } from './rect';
import { Box, BoxArgs, BoxGet, BoxRAlgebra } from './types';

const prepareNodes: Unary<[Box, Grid][], Grid[]> = unsorted => {
  if (unsorted.length === 0) return [];

  const [sorted, grids] = FN.pipe(unsorted, NO.sortZOrder, AR.unzip),
    [headBox, ...tailBoxes] = sorted,
    normalized = RCT.translateToPositive(headBox, ...tailBoxes),
    bounds = NO.bounds(normalized);

  const expand: Unary<[Box, Grid], Grid> = ([b, g]) =>
    FN.pipe(g, GR.expandGrid(RCT.pos.get(b), bounds));

  const expanded = FN.pipe(normalized, AR.zip(grids), AR.map(expand));

  return expanded;
};

const paintRAlgbebra: BoxRAlgebra<Grid> = ({ value, nodes }) => {
  const [blend, size, align, parentGrid] = FN.pipe(
    value,
    fork([block.blend.get, block.size.get, block.align.get, block.paint]),
  );

  if (nodes.length === 0) return parentGrid;

  const concat = FN.pipe(blend, GR.getMonoid, MO.concatAll);

  const childGrid = FN.pipe(
    nodes,
    prepareNodes,
    concat,
    FN.pipe(size, GR.align(align)),
  );

  return concat([parentGrid, childGrid]);
};

export const paint: Unary<Box, Grid> = NO.para(paintRAlgbebra);

export const asStringsWith: Unary<string, BoxGet<string[]>> = s =>
    FN.flow(paint, GR.asStringsWith(s)),
  asStrings: BoxGet<string[]> = asStringsWith(' '),
  asString: BoxGet<string> = FN.flow(asStrings, unlines);

export const print: Effect<Box> = b =>
  console.log(FN.pipe(b, asStrings, unlines));

export const sizeFromNodes: Endo<Box> = callWith(
  FN.flow(NO.measureNodes, RCT.size.set),
);

/**
 * Create a parent box that has both content and child boxes
 *
 * By default size is set to bounds of content and child boxes.
 */

export const branchWith: BinaryC<
  Omit<BoxArgs, 'nodes'>,
  Box[] | readonly Box[],
  Box
> =
  ({ apply, ...blockArgs }) =>
  nodes =>
    builders.buildBox({
      ...blockArgs,
      nodes: nodes as Box[],
      apply: FN.flow(AL.sizeToContent, apply ?? FN.identity),
    });

/** Create a parent box from an array of child boxes */
export const branch: Unary<Box[] | readonly Box[], Box> = branchWith({});

export const unaryBranchWith: Unary<Omit<BoxArgs, 'nodes'>, Endo<Box>> = args =>
  FN.flow(AR.of, branchWith(args));

export const unaryBranch: Endo<Box> = unaryBranchWith({});
