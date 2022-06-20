import { function as FN, number as NU, state as ST } from 'fp-ts';
import { head } from 'util/array';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import {
  asEdgeList,
  branchOfOne,
  EdgeList,
  fromEdgeList,
  getId,
  getValue,
  Identified,
  IdTree,
  leaf,
  newIdMarker,
  stripMarker,
  TreeState,
} from '../idTree';
import { getEq } from '../instances';
import { treeCata } from '../schemes';
import {
  degree,
  depth,
  nodeId,
  preorder,
  PreorderId,
  preorderId,
} from '../transform';
import { nodes, Tree, tree } from 'util/tree';

type StrTree = IdTree<string>;
type State = TreeState<string>;
type StrId = Identified<string>;

const chainOne = FN.flow(branchOfOne, ST.chain);

const treeEquals = getEq(NU.Eq).equals;

suite('idTree', () => {
  const state: State = FN.pipe(
    'leaf-1.1.1',
    leaf,
    chainOne('branch-1.1'),
    chainOne('branch-1'),
  );

  const iut: StrTree = FN.pipe(state, ST.evaluate(100)),
    level1 = FN.pipe(iut, nodes<Identified<string>>().get, head),
    level2 = FN.pipe(level1, nodes<Identified<string>>().get, head);

  suite('getId', () => {
    const checkId = (name: string, iut: StrTree, expect: number) =>
      test(name, () => assert.equal(getId(iut), expect));
    checkId('root', iut, 102);
    checkId('level1', level1, 101);
    checkId('level2', level2, 100);
  });

  suite('getValue', () => {
    const checkValue = (iut: StrTree, expect: string) =>
      test(expect, () => assert.equal(getValue(iut), expect));

    checkValue(iut, 'branch-1');
    checkValue(level1, 'branch-1.1');
    checkValue(level2, 'leaf-1.1.1');
  });

  test('add/strip marker', () => {
    const iut = tree(1)([tree(2)([tree(3)([])]), tree(4)([])]);
    assert.isTrue(treeEquals(FN.pipe(iut, newIdMarker(), stripMarker), iut));
  });

  suite('transform', () => {
    test('depth', () => {
      assert.deepEqual(
        FN.pipe(iut, treeCata<StrId, number[]>(depth)),
        [2, 1, 0],
      );
    });
    test('degree', () => {
      assert.deepEqual(
        FN.pipe(iut, treeCata<StrId, number[]>(degree)),
        [0, 1, 1],
      );
    });
    test('nodeId', () => {
      assert.deepEqual(
        FN.pipe(iut, treeCata<StrId, number[]>(nodeId)),
        [100, 101, 102],
      );
    });
    test('preorder', () => {
      assert.deepEqual(
        FN.pipe(iut, treeCata<StrId, Pair<number[]>>(preorder)),
        [
          [2, 1, 0],
          [0, 1, 1],
        ],
      );
    });
    test('preorderId', () => {
      assert.deepEqual(FN.pipe(iut, treeCata<StrId, PreorderId>(preorderId)), {
        depth: [2, 1, 0],
        degree: [0, 1, 1],
        nodeId: [100, 101, 102],
      });
    });
    suite('edge list', () => {
      const edges: EdgeList = [
          [101, 102],
          [101, 103],
          [100, 101],
          [100, 104],
        ],
        actual: Tree<number> = fromEdgeList(100)(edges),
        expect: Tree<number> = tree(100)([
          tree(101)([tree(102)([]), tree(103)([])]),
          tree(104)([]),
        ]),
        markedActual = FN.pipe(actual, newIdMarker(100));

      test('from edges', () => assert.isTrue(treeEquals(actual, expect)));
      test('as edges', () => assert.deepEqual(asEdgeList(markedActual), edges));
    });
  });
});
