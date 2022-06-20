export type KeyTuple = readonly string[];
export type AnyTuple = readonly any[];

export type Tuple3<T> = [T, T, T];
export type Tuple4<T> = [T, T, T, T];

export type TupleN<T, Len extends number> = readonly [T, ...T[]] & {
  length: Len;
};

export type Pair<T> = [T, T];

/** Reverse a tuple type
 *
 *  Given these tuple types:
 *  ```
 *  type EmptyTuple = readonly [];
 *  type OneType    = readonly [number];
 *  type ThreeTypes = readonly [number, string, RegExp];
 *  ```
 *  We can reverse their order:
 *  ```
 *  type EmptyTupleReversed = Reverse<EmptyTuple>;
 *  type OneTypeReversed    = Reverse<OneType>;
 *  type ThreeTypesReversed = Reverse<ThreeTypes>;
 *  ```
 *  To get new tuple types:
 *  ```
 *  EmptyTupleReversed ≡ readonly []
 *  OneTypeReversed    ≡ readonly [number]
 *  ThreeTypesReversed ≡ readonly [RegExp, string, number]
 *  ```
 */
export type Reverse<T extends AnyTuple> = T['length'] extends 0
  ? []
  : T['length'] extends 1
  ? T
  : [...Reverse<Tail<T>>, Head<T>];

export type Head<T extends AnyTuple> = T[0];

export type Tail<T extends AnyTuple> = T extends readonly [any?, ...infer U]
  ? U
  : [...T];

export type DropLast<T extends AnyTuple> = T extends readonly [...infer L, any]
  ? L
  : [];

export type Last<T extends AnyTuple> = T extends readonly [
  ...DropLast<T>,
  infer L,
]
  ? L
  : [];
