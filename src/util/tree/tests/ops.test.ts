import { array as AR, function as FN, number as NU } from 'fp-ts';
import { Unary } from 'util/function';
import { Tuple3 } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { getShow } from '../instances';
import { flattenTree, mapTree, sequenceTree } from '../ops';
import { showTree } from '../schemes';
import { leaf, tree, Tree } from 'util/tree';

type NTree = Tree<number>;
const show = showTree(NU.Show);

const iut1: NTree = leaf(2),
  iut2: NTree = tree(4)([iut1, iut1]),
  iut3: NTree = tree(8)([iut2, iut2]);

suite('ops', () => {
  suite('map', () => {
    const checkMap = (iut: NTree, expect: string) =>
      assert.equal(FN.pipe(iut, mapTree(FN.increment), show), expect);

    const tree3 = 'leaf(3)',
      tree5 = `tree(5)([${tree3}, ${tree3}])`,
      tree9 = `tree(9)([${tree5}, ${tree5}])`;

    test('depth=1', () => checkMap(iut1, tree3));
    test('depth=2', () => checkMap(iut2, tree5));
    test('depth=3', () => checkMap(iut3, tree9));
  });

  suite('flatten', () => {
    const checkFlat = (iut: Tree<NTree>, expect: string) =>
      assert.equal(FN.pipe(iut, flattenTree, show), expect);

    suite('no nodes', () => {
      const [depth1, depth2, depth3] = FN.pipe(
        [iut1, iut2, iut3],
        AR.map(mapTree(leaf)),
      ) as Tuple3<Tree<NTree>>;

      test('depth1', () => checkFlat(depth1, show(iut1)));
      test('depth2', () => checkFlat(depth2, show(iut2)));
      test('depth3', () => checkFlat(depth3, show(iut3)));
    });

    suite('with nodes', () => {
      const showNested: Unary<Tree<NTree>, string> = FN.pipe(
        NU.Show,
        getShow,
        showTree,
      );

      const check = (actual: Tree<NTree>, expect: string) =>
        test(showNested(actual), () => checkFlat(actual, expect));

      const t1 = tree(2)([leaf(1)]);

      const iut1: Tree<NTree> = leaf(t1),
        iut2: Tree<NTree> = FN.pipe(iut1, AR.of, tree(t1));

      check(iut1, show(t1));
      check(iut2, 'tree(2)([tree(2)([leaf(1)]), leaf(1)])');
    });
  });

  suite('sequence', () => {
    const iut: Tree<number[]> = FN.pipe(3, AR.of, leaf, AR.of, tree([1, 2])),
      actual = FN.pipe(iut, sequenceTree(AR.Applicative));

    test('Tree<number[]>⇒Tree<number>[]', () =>
      assert.equal(
        actual.map(show).join(', '),
        'tree(1)([leaf(3)]), tree(2)([leaf(3)])',
      ));
  });
});
