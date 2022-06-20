import { function as FN, number as NU } from 'fp-ts';
import { leaf, tree, Tree, treeF } from 'util/tree';
import { fix } from 'util/fix/kind2';
import { Unary } from 'util/function';
import { assert, suite, test } from 'vitest';
import {
  filterTree,
  flattenNodes,
  maxDepth,
  nodeCount,
  showTree,
  TreeUnfolderOf,
  unfoldTree,
} from '../schemes';

suite('recursion schemes', () => {
  const fixTree = (n: number, nodes: Tree<number>[]): Tree<number> =>
    fix(treeF([n, nodes]));

  const node1: Tree<number> = fix(treeF([1, []]));
  const node2: Tree<number> = fixTree(2, [node1, node1]);
  const node3: Tree<number> = fixTree(3, [node1, node2]);

  const unfolder: TreeUnfolderOf<number> = n => {
    if (n === 1) return [];
    else {
      const smaller = Math.floor(n / 2);
      return [smaller, n - smaller];
    }
  };

  const unfolded: Unary<number, Tree<number>> = unfoldTree(unfolder);

  test('unfold', () => {
    const actual = JSON.stringify(unfolded(5)),
      expect = JSON.stringify(fixTree(5, [node2, node3]));

    assert.equal(actual, expect);
  });

  test('flattenNodes', () =>
    assert.deepEqual(flattenNodes(unfolded(3)), [3, 1, 2, 1, 1]));

  test('nodeCount', () => assert.equal(nodeCount(unfolded(3)), 5));
  test('maxDepth', () => assert.equal(maxDepth(unfolded(4)), 3));

  test('show', () =>
    assert.equal(
      showTree(NU.Show)(unfolded(3)),
      'tree(3)([leaf(1), tree(2)([leaf(1), leaf(1)])])',
    ));

  test('filter', () => {
    const iut = FN.pipe(
      tree(11)([leaf(1), tree(3)([leaf(4)]), tree(6)([leaf(7), leaf(8)])]),
      filterTree(({ unfixed: { value } }) => value % 2 === 0),
    );
    assert.equal(showTree(NU.Show)(iut), 'tree(11)([tree(6)([leaf(8)])])');
  });
});
