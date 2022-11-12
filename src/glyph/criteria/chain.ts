import { array as AR, function as FN } from 'fp-ts';
import { head, last } from 'util/array';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';

type Edge = Record<'from' | 'to', string>;

/**
 * A chain is a inked list of characters, where any pair you pick is found in
 * the same relation.
 *
 * ```txt
 * ∀e₁,e₂ ∈ Chain ∧ index(e₁)+1=index(e₂): e₁.to=e₂.from
 * ```
 */
type Chain = Edge[];

type ChainMap = Map<string, Chain>;

const chainMap: FN.Lazy<ChainMap> = () => new Map<string, Chain>();

/** Reduce ordered pairs into ordered chains */
export const extractChains: Unary<Pair<string>[], string[][]> = pairs => {
  const [fromMap, toMap]: Pair<ChainMap> = [chainMap(), chainMap()],
    [fromKey, toKey]: Pair<Unary<Edge[], string>> = [
      e => last(e).to,
      e => head(e).from,
    ];

  const addTo = (edge: Edge, chain: Chain) => {
    const withEdge = [...chain, edge];

    toMap.delete(edge.from);
    toMap.set(edge.to, withEdge);
    fromMap.set(toKey(withEdge), withEdge);
  };

  const addFrom = (edge: Edge, chain: Chain) => {
    const withEdge = [edge, ...chain];

    fromMap.delete(edge.to);
    fromMap.set(edge.from, withEdge);
    toMap.set(fromKey(withEdge), withEdge);
  };

  const connectChains = (edge: Edge, fromChain: Chain, toChain: Chain) => {
    const withEdge = [...toChain, edge, ...fromChain];

    fromMap.delete(edge.to);
    fromMap.set(toKey(withEdge), withEdge);
    toMap.delete(edge.from);
    toMap.set(fromKey(withEdge), withEdge);
  };

  const addEdge = (edge: Edge): void => {
    const { from, to } = edge,
      [fromTo, toFrom] = [fromMap.get(to), toMap.get(from)];

    if (from === to) return; // no reflexive edges

    if (fromTo !== undefined && toFrom !== undefined)
      connectChains(edge, fromTo, toFrom);
    else if (fromTo !== undefined) addFrom(edge, fromTo);
    else if (toFrom !== undefined) addTo(edge, toFrom);
    else {
      fromMap.set(from, [edge]);
      toMap.set(to, [edge]);
    }
  };

  pairs.forEach(([from, to]) => addEdge({ from, to }));

  const decodeChain: Unary<Chain, string[]> = chain => {
    // character cannot appear more than once in one chain
    const [seen, fst] = [new Set<string>(), head(chain).from],
      res = [fst];
    seen.add(fst);
    for (const node of chain) {
      if (seen.has(node.to)) break;
      res.push(node.to);
    }
    return res;
  };

  return FN.pipe(Array.from(toMap.values()), AR.map(decodeChain));
};
