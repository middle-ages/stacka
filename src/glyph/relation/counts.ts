import { array as AR, function as FN, show as SH } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { fork } from 'fp-ts-std/Function';
import { bitmap } from 'src/bitmap';
import { Binary, Unary } from 'util/function';
import { max, min } from 'util/number';
import { typedValues } from 'util/object';
import { Pair } from 'util/tuple';

export const countKeys = [
  /** Number of pairs that are members of the relation */
  'pair',
  /** Number of unique characters */
  'char',
  /** Percent of total registered characters that are in this relation */
  'charPercent',
  /** Chain count */
  'chain',
  /** Unique character count of all chains */
  'chainChars',
  /** Percent of characters in relation that are members of some chain */
  'chainPercent',
  /** Shorted chain length */
  'minChain',
  /** Longest chain length */
  'maxChain',
] as const;

export type CountKey = typeof countKeys[number];

export type Counts = Record<CountKey, number>;

const collectChains: Unary<string[][], string[]> = chains => {
  const chars = AR.flatten(chains);
  const charSet = new Set<string>();
  for (const c of chars) charSet.add(c);
  return Array.from(charSet.keys());
};

export const relationCounts: Binary<Pair<string>[], string[][], Counts> = (
  pairs,
  chains,
) => {
  const char = bitmap.collectPairs(pairs).length,
    chainChars = collectChains(chains).length,
    [minChain, maxChain] = FN.pipe(chains, AR.map(AR.size), fork([min, max]));

  return {
    pair: pairs.length,
    char,
    charPercent: Math.floor((char / bitmap.chars.length) * 100),
    chain: chains.length,
    chainChars,
    chainPercent: Math.floor(char ? (chainChars / char) * 100 : 0),
    minChain,
    maxChain,
  };
};

export const showCounts: SH.Show<Counts> = {
  show: counts => {
    const zipped = FN.pipe([...countKeys], AR.zip(typedValues(counts))) as [
      CountKey,
      number,
    ][];
    return FN.pipe(
      zipped,
      AR.map(([k, v]) => `${k}:${v.toLocaleString()}`),
      join(' '),
    );
  },
};
