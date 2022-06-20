import { array as AR, function as FN } from 'fp-ts';
import { cartesian } from 'fp-ts-std/Array';
import { flip } from 'fp-ts-std/Function';
import { mapBoth, toSnd } from 'fp-ts-std/Tuple';
import {
  bitmap,
  Matrix,
  Registry as BitmapRegistry,
  RelCheck,
} from 'src/bitmap';
import { callWith, Unary } from 'util/function';
import { pluck, typedEntries } from 'util/object';
import { Pair } from 'util/tuple';
import { matchCriteria } from '../criteria';
import { buildRelation, buildWithChains } from './build';
import { relations as allRelations } from './defs';
import { linkChains } from './link';
import { CharRelation, Relation, RelationDef } from './types';

export const computePairs = ({
  chars,
  matrixByChar,
}: BitmapRegistry): [Pair<string>[], Pair<Matrix>[]] =>
  FN.pipe(
    chars,
    callWith<string[], Pair<string>[]>(cartesian),
    toSnd(AR.map(mapBoth(c => matrixByChar.get(c) ?? bitmap.emptyMatrix))),
  );

const createDefs: FN.Lazy<RelationDef[]> = () =>
  FN.pipe(
    allRelations,
    typedEntries,
    AR.map(([name, def]) => ({ name, ...def } as RelationDef)),
  );

export const createRelations = (): [Relation, CharRelation[]][] => {
  const [charPairs, matrixPairs] = computePairs(bitmap.registry);

  const createCharRelations: Unary<Relation, CharRelation[]> = relation =>
    FN.pipe(relation.pairs, bitmap.collectPairs, linkChains(relation));

  const filterMatrices: Unary<RelCheck, Pair<string>[]> = check =>
    FN.pipe(matrixPairs, AR.filter(check), AR.map(bitmap.pairMatrixToChar));

  const createRelation: Unary<RelationDef, Relation> = callWith(
    FN.flow(
      pluck('criteria'),
      matchCriteria(
        check => def => FN.pipe(check, filterMatrices, buildRelation(def)),

        check => def =>
          FN.pipe(charPairs, AR.filter(check), buildRelation(def)),

        flip(buildWithChains),
      ),
    ),
  );

  return FN.pipe(
    createDefs(),
    AR.map(FN.flow(createRelation, toSnd(createCharRelations))),
  );
};
