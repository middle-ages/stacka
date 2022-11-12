import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { unlines } from 'fp-ts-std/String';
import { block } from 'src/block';
import * as GR from 'src/grid';
import { Grid, stackChildren } from 'src/grid';
import { zipU } from 'util/array';
import { BinaryC, callWith, Effect, Endo, Unary } from 'util/function';
import * as AL from './align';
import * as builders from './build';
import * as NO from './nodes';
import { exportRect as RCT } from './rect';
import { Box, BoxArgs, BoxGet, BoxRAlgebra } from './types';

const paintRAlgbebra: BoxRAlgebra<Grid> = ({ value, nodes }) => {
  const parentGrid = block.paint(value);
  if (nodes.length === 0) return parentGrid;

  return FN.pipe(
    nodes,
    NO.sortZOrder,
    AR.unzip,
    TU.mapFst(RCT.translateToPositive),
    FN.tupled(zipU),
    AR.map(TU.mapSnd(RCT.rect.get)),
    FN.pipe(
      parentGrid,
      stackChildren(value.align, value.rect.size, value.blend),
    ),
  );
};

export const paint: Unary<Box, Grid> = NO.para(paintRAlgbebra);

export const asStringsWith: Unary<string, BoxGet<string[]>> = s =>
    FN.flow(paint, GR.paintWith(s)),
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
export const branchWith: BinaryC<BoxArgs, Box[], Box> =
  ({ apply, ...blockArgs }) =>
  nodes =>
    builders.buildBox({
      ...blockArgs,
      nodes: [...(blockArgs.nodes ?? []), ...nodes],
      apply: FN.flow(AL.sizeToContent, apply ?? FN.identity),
    });

/** Create a parent box from an array of child boxes */
export const branch: Unary<Box[], Box> = branchWith({});

export const unaryBranchWith: BinaryC<Box, BoxArgs, Box> = b => args =>
  FN.pipe(b, AR.of, branchWith(args));

export const unaryBranch: Endo<Box> = FN.pipe({}, flip(unaryBranchWith));
