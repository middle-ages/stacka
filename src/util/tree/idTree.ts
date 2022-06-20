import { array as AR, function as FN, state as ST, tuple as TU } from 'fp-ts';
import { curry2, fork } from 'fp-ts-std/Function';
import { withFst, withSnd } from 'fp-ts-std/Tuple';
import { apply1, BinaryC, Unary } from 'util/function';
import { Pair, pairApply } from 'util/tuple';
import * as BU from './build';
import * as LN from './lens';
import { mapTree, mapTreePostOrder } from './ops';
import { treeAna, treeCata } from './schemes';
import { HTree, Tree, TreeF } from './types';

/** A tree where each node is tagged with an ID */

export type Identified<A> = [A, number];
export type IdPair<A> = [IdTree<A>, number];

export type IdTree<A> = Tree<Identified<A>>;
export type IdTreeF<A> = HTree<Identified<A>>;
export type Unfixed<A, E> = TreeF<Identified<A>, E>;

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
    BU.treeF([[value, id], nodes]);

const fromId = <A>(a: A, nodes: IdTree<A>[]): Unary<number, IdTree<A>> =>
  FN.flow(FN.pipe(nodes, fromIdF(a)), BU.fixTree);

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

export const [getIdF, getValueF] = [
  <A, E>(tree: Unfixed<A, E>): number =>
    FN.pipe(tree, LN.valueF<Identified<A>, E>().get, TU.snd),
  <A, E>(tree: Unfixed<A, E>): A =>
    FN.pipe(tree, LN.valueF<Identified<A>, E>().get, TU.fst),
];

export const [getId, getValue, getNodes] = [
  <A>(tree: IdTree<A>): number =>
    FN.pipe(tree, LN.value<Identified<A>>().get, TU.snd),
  <A>(tree: IdTree<A>): A =>
    FN.pipe(tree, LN.value<Identified<A>>().get, TU.fst),
  <A>(tree: IdTree<A>): IdTree<A>[] =>
    FN.pipe(tree, LN.nodes<Identified<A>>().get),
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

export const edgeListAlgebra: IdAlgebraOf<Identified<EdgeList>> = <A>(
  term: Unfixed<A, Identified<EdgeList>>,
) => {
  const id = getIdF(term),
    addId = withFst(id);
  const edges = FN.pipe(
    term,
    LN.nodesF<Identified<A>, Identified<EdgeList>>().get,
    fork([
      FN.flow(AR.map(TU.fst), AR.flatten),
      FN.flow(AR.map(FN.flow(TU.snd, addId)), AR.concat),
    ]),
    pairApply,
  );

  return FN.pipe(edges, withSnd(id));
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

  return BU.treeF([id, FN.pipe(nodeIds, AR.map(withFst(map)))]);
};

export const fromEdgeMap: BinaryC<number, EdgeMap, Tree<number>> =
  rootId => idMap =>
    FN.pipe([idMap, rootId], treeAna(edgeListCoalgebra));

export const fromEdgeList: BinaryC<number, EdgeList, Tree<number>> = rootId =>
  FN.flow(edgeListMap, fromEdgeMap(rootId));
