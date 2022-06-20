import {
  makeRegistry as makeBitmapRegistry,
  Registry as BitmapRegistry,
} from 'src/bitmap/registry';

type BitmapMaps =
  | 'matrixByChar'
  | 'charByMatrix'
  | 'rolesByChar'
  | 'charsByRole';

type MapOf<M extends BitmapMaps> = BitmapRegistry[M];
type EntryOf<M extends BitmapMaps> = [
  MapOf<M> extends Map<infer K, any> ? K : never,
  MapOf<M> extends Map<any, infer V> ? V : never,
];

const getBitmaps = (bitmapReg: BitmapRegistry) => {
  const entries = <M extends BitmapMaps>(m: M): EntryOf<M>[] =>
    Array.from(bitmapReg[m].entries() as IterableIterator<EntryOf<M>>);

  return {
    chars: bitmapReg.chars,
    roles: bitmapReg.roles,
    matrixByChar: entries('matrixByChar'),
    charByMatrix: entries('charByMatrix'),
    rolesByChar: entries('rolesByChar'),
    charsByRole: entries('charsByRole'),
  };
};

const bitmapRegistry = makeBitmapRegistry();

const bitmaps = getBitmaps(bitmapRegistry);

console.log(JSON.stringify({ bitmaps }));
