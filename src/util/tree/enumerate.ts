import {
  array as AR,
  function as FN,
  nonEmptyArray as NE,
  readonlyArray as RA,
  string as STR,
  tuple as TU,
} from 'fp-ts';
import { last } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { EdgeList, fromEdgeList } from './idTree';
import { Tree } from './types';

/** How many rooted planar trees with N nodes? */
export const treeCountAt: Endo<number> = nodeCount =>
  nodeCount ** (nodeCount - 2);

export const prüferToEdges: Unary<number[], EdgeList> = seq => {
  const edges: EdgeList = [],
    nodes = NE.range(0, seq.length + 1),
    degrees = AR.replicate(nodes.length, 1);

  seq.forEach(i => degrees[i]++);
  for (const input of seq) {
    for (const node of nodes) {
      if (degrees[node] === 1) {
        edges.push([input, node]);
        degrees[input]--;
        degrees[node]--;
        break;
      }
    }
  }

  return FN.pipe(
    edges,
    AR.append(
      FN.pipe(
        nodes,
        AR.filter(node => degrees[node] === 1),
      ) as Pair<number>,
    ),
  );
};

export const prüferToTree: Unary<number[], Tree<number>> = seq => {
  const edges = prüferToEdges(seq),
    root = FN.pipe(edges, last, TU.fst);

  return FN.pipe(edges, fromEdgeList(root));
};

/**
 * Given a node count N and an index 0≤i≤Tⁿ where Tⁿ is the number of
 * possible rooted planar trees of N nodes, returns the iᵗʰ tree.
 */
export const getNthTree: BinaryC<number, number, Tree<number>> =
  nodeCount => n => {
    const radix = nodeCount,
      digits = FN.pipe(n.toString(radix), STR.split(''), RA.map(parseInt)),
      seq = [...AR.replicate(radix - digits.length - 2, 0), ...digits];

    return prüferToTree(seq);
  };
