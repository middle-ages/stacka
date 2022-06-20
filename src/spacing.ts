import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  number as NU,
  predicate as PRE,
  show as SH,
} from 'fp-ts';
import { curry2, flip } from 'fp-ts-std/Function';
import { prepend } from 'fp-ts-std/String';
import stringWidth from 'string-width';
import { BinaryC, callWith, Endo, Unary } from 'util/function';
import { objectMono, setPropOf, typedFromEntries } from 'util/object';
import { around, Char, nChars } from 'util/string';
import { Pair, pairMap, Tuple4 } from 'util/tuple';
import { Dir, dirs, mapDirs, showDir } from './dir';
import { fillSize, size, Size } from './geometry/size';
import { RowMapper } from './types';
import { maxPositiveMonoid } from './util/fp-ts';

export type Spacing = Record<Dir, number>;
export type Padding = Spacing;
export type Margin = Spacing;

export const spacingAt: BinaryC<Dir, Spacing, number> = dir => sp => sp[dir];

export const setSpacingAt: BinaryC<
    Dir,
    number,
    Endo<Spacing>
  > = setPropOf<Spacing>(),
  unsetSpacingAt: Unary<Dir, Endo<Spacing>> = flip(setSpacingAt)(0);

export const modSpacingAt: BinaryC<Dir, Endo<number>, Endo<Spacing>> =
  dir => f =>
    callWith(FN.flow(spacingAt(dir), f, setSpacingAt(dir)));

const showDirToNum: SH.Show<Spacing> = {
  show: spacing => mapDirs(d => showDir.show(d) + ':' + spacing[d]).join(' '),
};

export const showPadding: SH.Show<Padding> = {
    show: FN.flow(showDirToNum.show, prepend('padding=')),
  },
  showMargin: SH.Show<Margin> = {
    show: FN.flow(showDirToNum.show, prepend('margin=')),
  };

export const spacingFromTuple: Unary<Tuple4<number>, Spacing> = (
  t: Tuple4<number>,
) => FN.pipe([...dirs], AR.zip([...t]), typedFromEntries);

export const monoSpacing: Unary<number, Spacing> = n =>
  spacingFromTuple([n, n, n, n]);

export const spacingMonoid: Unary<MO.Monoid<number>, MO.Monoid<Spacing>> = (
  monoid: MO.Monoid<number>,
) => FN.pipe(monoid, objectMono(dirs), MO.struct);

/** Spacing is always positive */
export const spacingMax: MO.Monoid<Spacing> = spacingMonoid(maxPositiveMonoid);

export const emptySpacing: Spacing = spacingMonoid(NU.MonoidSum).empty;

export const spacingEq: EQ.Eq<Spacing> = EQ.struct({
  top: NU.Eq,
  right: NU.Eq,
  bottom: NU.Eq,
  left: NU.Eq,
});

export const isSpacingZero: PRE.Predicate<Spacing> = FN.pipe(
  emptySpacing,
  curry2(spacingEq.equals),
);

export const measureSpacing: Unary<Spacing, Size> = ({
  top,
  right,
  bottom,
  left,
}) => FN.pipe([right + left, top + bottom], size);

/**
 * `hChar` is used for filling top/bottom spacing rows
 * `vChar` is used for filling left/right spacing columns
 */
export const paintSpacingOf: BinaryC<Pair<Char>, Spacing, RowMapper> =
  ([hChar, vChar]) =>
  ({ top, right, bottom, left }) =>
  lines => {
    const width = stringWidth(lines[0]);
    const vFill: Unary<number, string[]> = n =>
        n ? FN.pipe([left + right + width, n], size, fillSize(hChar)) : [],
      [leftFill, rightFill] = FN.pipe(
        [left, right],
        FN.pipe(vChar, nChars, pairMap),
      );

    return [
      ...vFill(top),
      ...FN.pipe(lines, AR.map(around(leftFill, rightFill))),
      ...vFill(bottom),
    ];
  };

export const paintSpacing = paintSpacingOf([' ', ' ']);
