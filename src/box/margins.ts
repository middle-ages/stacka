import { function as FN } from 'fp-ts';
import { Orientation, Directed } from 'src/geometry';
import { Pair } from 'util/tuple';
import { buildBox } from './build';
import { above, below, leftOf, rightOf } from './place';
import { BoxSet } from './types';

export const [marginLeft, marginRight]: Pair<BoxSet<number>> = [
    width => FN.pipe({ width }, buildBox, rightOf),
    width => FN.pipe({ width }, buildBox, leftOf),
  ],
  [marginTop, marginBottom]: Pair<BoxSet<number>> = [
    height => FN.pipe({ height }, buildBox, above),
    height => FN.pipe({ height }, buildBox, below),
  ];

export const margins: BoxSet<Directed<number>> = ({
  top,
  right,
  bottom,
  left,
}) =>
  FN.flow(
    marginTop(top),
    marginRight(right),
    marginBottom(bottom),
    marginLeft(left),
  );

export const axisMargins: BoxSet<Partial<Record<Orientation, number>>> = ({
  horizontal = 0,
  vertical = 0,
}) =>
  margins({
    top: vertical,
    right: horizontal,
    bottom: vertical,
    left: horizontal,
  });

export const margin: BoxSet<number> = m =>
  margins({ top: m, right: m, bottom: m, left: m });

export const [hMargins, vMargins]: Pair<BoxSet<number>> = [
  n => axisMargins({ horizontal: n }),
  n => axisMargins({ vertical: n }),
];
