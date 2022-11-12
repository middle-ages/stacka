import { function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import * as color from 'src/color';
import { BlendMode } from 'src/color';
import { BinOpT, Unary } from 'util/function';
import * as DE from './deco';
import * as LE from './lens';
import * as TY from './types';
import { Style } from './types';

export const blend: Unary<BlendMode, BinOpT<Style>> =
  mode =>
  ([lower, upper]) => {
    if (TY.isEmpty(upper)) return lower;
    else if (TY.isEmpty(lower)) return upper;
    else if (mode === 'under' || mode === 'combineUnder') return lower;
    else if (mode === 'over' || mode === 'combineOver') return upper;

    const [[lowerFg, lowerBg], [upperFg, upperBg]] = FN.pipe(
        [lower, upper],
        mapBoth(TY.asColorPair),
      ),
      [lowerDeco, upperDeco] = FN.pipe([lower, upper], mapBoth(LE.deco.get)),
      blendColor = color.blend(mode);

    const fgRes = blendColor([lowerFg, upperFg]),
      bgRes = blendColor([lowerBg, upperBg]),
      decoRes = DE.monoid.concat(lowerDeco, upperDeco);

    const res: Style = [
      color.normalize(fgRes),
      color.normalize(bgRes),
      decoRes,
    ];

    return res;
  };
