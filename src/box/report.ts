import { array as AR, function as FN, monoid as MO, number as NU } from 'fp-ts';
import { Block, block } from 'src/block';
import { Unary } from 'util/function';
import * as TR from 'util/tree';
import { Box } from './types';

/**
 * ```txt
 *                           grid   non-empty
 *        top  width align  width   cells %
 *          ↓     ↓    ↓        ↓   ↓
 *         ▲1:◀0 ↔2:↕1 ⭹ screen 2ˣ1 100%
 *             ↑     ↑    ↑       ↑
 *          left height blend  grid
 *                       mode  height
 *
 * ```
 */

const blockSummary: Unary<Block, string> = block.show;

const toStringTree: Unary<Box, TR.Tree<string>> = TR.mapTree(blockSummary);

export const drawTree: Unary<Box, string> = FN.flow(toStringTree, TR.draw);

interface Report {
  readonly nodeCount: number;
  readonly show: string[];
}

const reportMonoid = MO.struct({
  nodeCount: NU.MonoidSum,
  show: AR.getMonoid<string>(),
});

export const reportAlgebra: TR.TreeAlgebra<Block, Report> = ({
  value,
  nodes,
}) => {
  const { nodeCount, show } = FN.pipe(nodes, MO.concatAll(reportMonoid));
  return {
    nodeCount: nodeCount + 1,
    show: [...show, block.show(value) + ` nodes=${nodeCount}`],
  };
};

export const printTree = (box: Box) => console.log(drawTree(box));
