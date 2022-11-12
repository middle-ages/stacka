import {
  AnserJsonEntry,
  DecorationName as AnserDeco,
  DecorationName,
} from 'anser';
import { Ansis } from 'ansis';
import {
  array as AR,
  readonlyArray as RA,
  eq as EQ,
  function as FN,
  monoid as MO,
  number as NU,
  predicate as PRE,
  show as SH,
  string as STR,
} from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import * as IS from 'monocle-ts/Iso';
import { TupleN } from 'util/tuple';
import { indexRecord, membershipTest } from 'util/array';
import { Endo, Unary } from 'util/function';
import { ModLens } from 'util/lens';
import { FromKeys, fromKeys, mapValues } from 'util/object';

/**
 * ### Cell Decorations
 *
 * Encoded in the 1st 5 bits of a byte:
 *
 * ```txt
 *      ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
 * bit# │1     │2     │3     │4     │5     │6     │7     │8     │
 *      ┢━━━━━━╈━━━━━━╈━━━━━━╈━━━━━━╈━━━━━━╈━━━━━━╈━━━━━━╈━━━━━━┪
 *      ┃ •    ┃ •    ┃ •    ┃ •    ┃ •    ┃UNUSED│UNUSED│UNUSED┃
 *      ┗━│━━━━┻━│━━━━┻━│━━━━┻━│━━━━┻━│━━━━┻━━━━━━┻━━━━━━┻━━━━━━┛
 *        │      │      │      │      │
 *        │   inverse   │      │      │
 *      bold         italic    │   underline
 *                             │
 *                      strikethrough
 * ```
 *
 */
export type Deco = number;
export type Decoration = typeof _decorations[number];
export type DecoList = Decoration[];

const _decorations = [
  'bold',
  'inverse',
  'italic',
  'strikethrough',
  'underline',
] as const;

/** Check if we support this parsed ANSI decoration */
export const isDeco: PRE.Predicate<DecorationName> =
    membershipTest(_decorations),
  decorations = [..._decorations] as DecoList,
  mapDeco = <R>(f: Unary<Decoration, R>) =>
    FN.pipe(decorations, RA.map(f)) as TupleN<R, 5>,
  decoRecord: FromKeys<Decoration> = fromKeys(decorations),
  bitIndex = indexRecord(_decorations),
  ignore: PRE.Predicate<AnserDeco> = deco =>
    deco === 'dim' || deco === 'blink' || deco === 'hidden';

/** Test if decoration contains style */
export const hasDeco: Unary<Decoration, PRE.Predicate<Deco>> = d => deco =>
    (deco & (1 << bitIndex[d])) !== 0,
  uniqDeco: Endo<DecoList> = ds =>
    AR.uniq(STR.Eq as EQ.Eq<Decoration>)(ds.sort());

export const decoToList: Unary<Deco, DecoList> = d => {
    if (d === 0) return [];
    const has = FN.pipe(d, flip(hasDeco));
    return [
      ...(has('bold') ? ['bold'] : []),
      ...(has('inverse') ? ['inverse'] : []),
      ...(has('italic') ? ['italic'] : []),
      ...(has('strikethrough') ? ['strikethrough'] : []),
      ...(has('underline') ? ['underline'] : []),
    ] as DecoList;
  },
  listToDeco: Unary<DecoList, Deco> = decos =>
    uniqDeco(decos).reduce((acc, cur) => acc + 2 ** bitIndex[cur], 0);

/** Create a list of decorations from a parsed ANSI style */
export const listFromParsed: Unary<AnserJsonEntry, DecoList> = decos =>
    FN.pipe(
      decos.decorations,
      AR.filter(deco => !ignore(deco)),
      AR.map(deco => deco as Decoration),
    ),
  fromParsed: Unary<AnserJsonEntry, Deco> = FN.flow(listFromParsed, listToDeco);

export const add: Unary<Decoration, Endo<Deco>> = d => deco =>
    deco + (hasDeco(d)(deco) ? 0 : 2 ** bitIndex[d]),
  clear: Unary<Decoration, Endo<Deco>> = d => deco =>
    hasDeco(d)(deco) ? 2 ** bitIndex[d] : 0;

/** Modifies an `ansis` object so that it will add the given decorations */
export const addToAnsis: Unary<Deco, Endo<Ansis>> = deco => ansis => {
    if (deco === 0) return ansis;
    const list = decoToList(deco);
    return list.reduce((acc, cur) => acc[cur], ansis);
  },
  addListToAnsis: Unary<DecoList, Endo<Ansis>> = deco =>
    deco.length === 0 ? FN.identity : addToAnsis(listToDeco(deco));

const adders: Record<Decoration, Endo<Deco>> = decoRecord(add);

export const delegate = <T>(lens: ModLens<T, Deco>) =>
  ({
    add: FN.flow(add, lens.mod),
    clear: FN.flow(add, lens.mod),
    ...FN.pipe(adders, mapValues(lens.mod)),
  } as const);

export const show: SH.Show<Deco> = {
    show: d => 'deco(' + (d === 0 ? '∅' : decoToList(d).join(',')) + ')',
  },
  monoid: MO.Monoid<Deco> = {
    empty: 0,
    concat: (lower, upper) => lower | upper,
  },
  eq: EQ.Eq<Deco> = NU.Eq,
  decoIso: IS.Iso<Deco, DecoList> = IS.iso(decoToList, listToDeco);
