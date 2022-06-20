import { array as AR, function as FN } from 'fp-ts';
import { BlendMode } from 'src/color';
import { BinOpT, Unary } from 'util/function';
import { cell as CE } from '../cell/cell';
import { Row } from './types';
import { zipWidth } from './zipWidth';

const isNone = AR.every(CE.isNone),
  isSpace = AR.every(CE.isSpace);

export const stackAtomic: Unary<BlendMode, BinOpT<Row>> =
  blend =>
  ([below, above]) => {
    const [[belowHead], [aboveHead]] = [below, above],
      stack = CE.stackChar(blend);

    return FN.pipe(
      belowHead,
      CE.matchCell(
        () => above,
        ([,], fstChar) =>
          CE.isChar(aboveHead)
            ? [stack([fstChar, aboveHead])]
            : CE.isNone(aboveHead)
            ? below
            : blend === 'under'
            ? below
            : above,
        () =>
          CE.isNone(aboveHead)
            ? below
            : isSpace(above)
            ? blend === 'over'
              ? above
              : below
            : blend === 'under'
            ? below
            : above,
        () => [],
      ),
    );
  };

export const stack: Unary<BlendMode, BinOpT<Row>> =
  blend =>
  ([below, above]): Row => {
    if (AR.isEmpty(below)) return above;
    else if (AR.isEmpty(above)) return below;
    else if (isNone(below)) return above;
    else if (isNone(above)) return below;

    return FN.pipe(
      [below, above],
      zipWidth,
      FN.pipe(blend, stackAtomic, AR.chain),
    );
  };
