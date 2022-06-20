import { array as AR, function as FN, option as OP } from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import { MaybeColor } from 'src/color';
import { typedFromEntries } from 'src/util/object';

const _decorations = [
  'bold',
  'italic',
  'underline',
  'inverse',
  'strikethrough',
] as const;

export type Decoration = typeof _decorations[number];

export type DecoMap = Record<Decoration, boolean>;

export const decorations = [..._decorations] as Decoration[];

export const emptyDeco: DecoMap = FN.pipe(
  decorations,
  FN.pipe(withSnd(false)<Decoration>, AR.map),
  typedFromEntries,
);

/**
 * Cell style data
 *
 * Every possible combination of ANSI SGR styling can be encoded in one `Style`.
 */
export interface Style extends DecoMap {
  fg: MaybeColor;
  bg: MaybeColor;
}

export type MaybeStyle = OP.Option<Style>;

export const empty: Style = {
  fg: OP.none,
  bg: OP.none,
  ...emptyDeco,
};
