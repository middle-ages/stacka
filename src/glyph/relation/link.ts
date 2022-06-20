import { array as AR, function as FN } from 'fp-ts';
import { buildCharRelation } from 'src/glyph/relation/build';
import { withAdjacent } from 'util/array';
import { BinaryC } from 'util/function';
import { CharRelation, Relation } from './types';

/** Create all the `CharacterRelation`s for a relation */
export const linkChains: BinaryC<Relation, string[], CharRelation[]> =
  relation => chars => {
    const prevMap = new Map<string, string[]>(),
      nextMap = new Map<string, string[]>();

    for (const chain of relation.chains) {
      for (const [char, [prev, next]] of withAdjacent(chain)) {
        if (prev.length)
          prevMap.set(char, [...(prevMap.get(char) ?? []), ...prev]);
        if (next.length)
          nextMap.set(char, [...(nextMap.get(char) ?? []), ...next]);
      }
    }

    return FN.pipe(
      chars,
      AR.map(char =>
        buildCharRelation(
          char,
          relation.def.name,
        )([prevMap.get(char) ?? [], nextMap.get(char) ?? []]),
      ),
    );
  };
