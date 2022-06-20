import {
  array as AR,
  function as FN,
  number as NU,
  ord as OD,
  predicate as PRE,
  show as SH,
  tuple as TU,
} from 'fp-ts';
import * as BL from 'src/block';
import { Block } from 'src/block';
import * as GE from 'src/geometry';
import { Endo, Unary } from 'util/function';
import { ModLens } from 'util/lens';
import * as TR from 'util/tree';
import { Pair } from 'util/tuple';
import * as BLE from './block';
import { exportRect as RCT } from './rect';
import {
  BoxCoalgebra,
  Box,
  BoxAlgebra,
  BoxGet,
  BoxRAlgebra,
  BoxSet,
} from './types';

export const nodes: ModLens<Box, Box[]> = TR.nodes<Block>();

export const hasNodes: PRE.Predicate<Box> = FN.flow(
    nodes.get,
    PRE.not(AR.isEmpty),
  ),
  nodeCount: BoxGet<number> = FN.flow(nodes.get, AR.size),
  [headNode, lastNode]: Pair<BoxGet<Box>> = [TR.headNode, TR.lastNode],
  maxDepth: Unary<Box, number> = TR.maxDepth,
  flattenNodes: Unary<Box, BL.Block[]> = TR.flattenNodes,
  Show: SH.Show<Box> = { show: TR.showTree(BL.block.Show) },
  show = Show.show;

export const [addNode, addNodes]: [BoxSet<Box>, BoxSet<Box[]>] = [
  node => parent => FN.pipe(parent, TR.addNode(node)),
  nodes => parent => FN.pipe(parent, TR.addNodes(nodes)),
];

/** Recursively filter out child boxes that fail the given predicate */
export const filterNodes: Unary<PRE.Predicate<Box>, Endo<Box>> = TR.filterTree;

/**
 * `∀b ∈ Box, ∀f ∈ Block⇒T`, map `b` into a `Tree<T>` using given `f`
 */
export const mapBlock: <T>(f: Unary<Block, T>) => Unary<Box, TR.Tree<T>> =
  TR.mapTree;

/** Compute bounding box size for a list of boxes */
export const bounds: Unary<Box[], GE.Size> = FN.flow(
  AR.map(BLE.block.get),
  BL.block.bounds,
);

/** Compute bounding box size for box children */
export const measureNodes: Unary<Box, GE.Size> = FN.flow(nodes.get, bounds);

export const sortZOrder = <T>(pairs: [Box, T][]): [Box, T][] =>
  FN.pipe(
    pairs,
    FN.pipe(
      NU.Ord,
      OD.contramap<number, [Box, T]>(FN.flow(TU.fst, RCT.zOrder.get)),
      AR.sort,
    ),
  );

export const cata = <A>(alg: BoxAlgebra<A>): Unary<Box, A> => TR.treeCata(alg),
  para = <A>(alg: BoxRAlgebra<A>): Unary<Box, A> => TR.treePara(alg),
  ana = <A>(coalg: BoxCoalgebra<A>) => TR.treeAna(coalg);
