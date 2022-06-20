import { function as FN, readonlyArray as RA } from 'fp-ts';
import { ObjectEntries, typedFromEntries, typedKeys } from 'util/object';
import * as PL from './placements';

export const placements = typedKeys(PL);

export type Placement = typeof placements[number];

type PlacementEntry<P extends Placement> = [P, typeof PL[P]];

export type PlacementMap = { [P in Placement]: typeof PL[P] };

export const placementMap: PlacementMap = typedFromEntries(
  FN.pipe(
    placements,
    RA.map(<P extends Placement>(p: P): PlacementEntry<P> => [p, PL[p]]),
  ) as ObjectEntries<PlacementMap>,
);
