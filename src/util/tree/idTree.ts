import { array as AR, function as FN, state as ST, tuple as TU } from 'fp-ts';
import { curry2, fork } from 'fp-ts-std/Function';
import { unfix } from 'util/fix/kind2';
import { apply1, BinaryC, Unary } from 'util/function';
import { leftTupleWith, Pair, pairApply, tupleWith } from 'util/tuple';
import { mapTree, mapTreePostOrder } from './ops';
import { treeAna, treeCata } from './schemes';
import {
  fixTree,
  getNodesF,
  getValue as getTreeValue,
  getValueF as getTreeValueF,
  HTree,
  Tree,
  TreeF,
} from './TreeF';

/** A tree where each node is tagged with an ID */

export type Identified<A> = [A, number];
export type IdPair<A> = [IdTree<A>, number];

export type IdTree<A> = Tree<Identified<A>>;
export type IdTreeF<A> = HTree<Identified<A>>;
export type Unfixed<A, E> = TreeF<Identified<A>, E>;

export type Type<A> = IdTree<A>;

/** `number ⇒ [A, number] */
export type State<A> = ST.State<number, A>;
export type TreeState<A> = State<IdTree<A>>;

export type EdgeList = Pair<number>[];
export type EdgeMap = Map<number, EdgeList>;
export type IdEdgeMap = Identified<EdgeMap>;

export type IdAlgebraOf<E> = <A>(term: Unfixed<A, E>) => E;
export type IdCoalgebra<A, E> = (term: E) => TreeF<A, E>;

const withNextId = <A>(f: Unary<number, A>): State<A> =>
  fork([f, FN.increment]);

const fromIdF =
  <A>(value: A) =>
  <E>(nodes: E[]): Unary<number, Unfixed<A, E>> =>
  (id: number) =>
    TreeF.of([[value, id], nodes]);

const fromId = <A>(a: A, nodes: IdTree<A>[]): Unary<number, IdTree<A>> =>
  FN.flow(FN.pipe(nodes, fromIdF(a)), fixTree);

export const idTree: <A>(value: A, nodes: IdTree<A>[]) => TreeState<A> =
  FN.flow(fromId, withNextId);

export const idTreeF = <A, E>(value: A, nodes: E[]): State<Unfixed<A, E>> =>
  FN.pipe(nodes, fromIdF(value), withNextId);

export const fromNodes: <A>(nodes: IdTree<A>[]) => Unary<A, TreeState<A>> =
  curry2(FN.flip(idTree));

export const branch = <A>(value: A): Unary<IdTree<A>[], TreeState<A>> =>
  FN.flow(fromNodes, apply1(value));

export const branchOfOne = <A>(value: A): Unary<IdTree<A>, TreeState<A>> =>
    FN.flow(AR.of, fromNodes, apply1(value)),
  leaf = <A>(value: A): TreeState<A> => FN.pipe(value, fromNodes([])),
  firstLeaf: <A>(a: A) => IdPair<A> = FN.flow(leaf, apply1(1));

export const [getIdF, getValueF]: [
  <A, E>(tree: Unfixed<A, E>) => number,
  <A, E>(tree: Unfixed<A, E>) => A,
] = [FN.flow(getTreeValueF, TU.snd), FN.flow(getTreeValueF, TU.fst)];

export const [getId, getValue, getNodes]: [
  <A>(tree: IdTree<A>) => number,
  <A>(tree: IdTree<A>) => A,
  <A>(tree: IdTree<A>) => IdTree<A>[],
] = [
  FN.flow(getTreeValue, TU.snd),
  FN.flow(getTreeValue, TU.fst),
  FN.flow(unfix, getNodesF),
];

export const newIdMarker = (
  init?: number,
): (<A>(src: Tree<A>) => IdTree<A>) => {
  let nextId = init ?? 1;
  return mapTreePostOrder(<A>(a: A): Identified<A> => [a, nextId++]);
};

export const markByMap =
  <A, B>(f: Unary<A, B>) =>
  (map: Map<B, number>): Unary<Tree<A>, IdTree<A>> =>
    mapTree(a => [a, map.get(f(a)) ?? -1] as Identified<A>);

export const stripMarker: <A>(tree: IdTree<A>) => Tree<A> = mapTree(TU.fst);

export const edgeListAlgebra: IdAlgebraOf<Identified<EdgeList>> = term => {
  const id = getIdF(term),
    addId = tupleWith(id);
  const edges = FN.pipe(
    term,
    getNodesF,
    fork([
      FN.flow(AR.map(TU.fst), AR.flatten),
      FN.flow(AR.map(FN.flow(TU.snd, addId)), AR.concat),
    ]),
    pairApply,
  );

  return FN.pipe(edges, leftTupleWith(id));
};

export const asEdgeList = <A>(tree: IdTree<A>): EdgeList =>
  FN.pipe(
    tree,
    treeCata<Identified<A>, Identified<EdgeList>>(edgeListAlgebra),
    TU.fst,
  );

const edgeListMap: Unary<EdgeList, EdgeMap> = edges => {
  const map = new Map<number, EdgeList>();
  edges.forEach(([from, to]) =>
    map.set(from, (map.get(from) ?? []).concat([[from, to]])),
  );
  return map;
};

const getMapList = ([map, id]: IdEdgeMap): [number[], IdEdgeMap] => {
  const ownEdges = map.get(id) ?? [];
  return [FN.pipe(ownEdges, AR.map(TU.snd)), [map, id]];
};

export const edgeListCoalgebra: IdCoalgebra<number, IdEdgeMap> = idMap => {
  const [nodeIds, [map, id]] = getMapList(idMap);

  return nodeIds.length
    ? TreeF.of([id, FN.pipe(nodeIds, AR.map(tupleWith(map)))])
    : TreeF.leafOf<IdEdgeMap>()(id);
};

export const fromEdgeMap: BinaryC<number, EdgeMap, Tree<number>> =
  rootId => idMap =>
    FN.pipe([idMap, rootId], treeAna(edgeListCoalgebra));

export const fromEdgeList: BinaryC<number, EdgeList, Tree<number>> = rootId =>
  FN.flow(edgeListMap, fromEdgeMap(rootId));
