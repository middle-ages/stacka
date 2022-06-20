import { array as AR, function as FN, option as OP } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { chunk4x } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { flattenPair, Pair } from 'util/tuple';
import { Matrix, Px } from './data';

/** Show a matrix more efficiently using half-character pixels */
export const quadResWith: BinaryC<Endo<string>, Matrix, string[]> =
  pixelColor => bm => {
    const foldPx = OP.fold(
      () => 'F',
      px => (px === '#' ? 'T' : 'F'),
    );

    const quadToGlyph = {
      FFFF: ' ',
      FFFT: '▗',
      FFTF: '▝',
      FFTT: '▐',
      FTFF: '▖',
      FTFT: '▄',
      FTTF: '▞',
      FTTT: '▟',
      TFFF: '▘',
      TFFT: '▚',
      TFTF: '▀',
      TFTT: '▜',
      TTFF: '▌',
      TTFT: '▙',
      TTTF: '▛',
      TTTT: '█',
    } as const;

    const quadMapper: Unary<Pair<Pair<OP.Option<Px>>>[], string> = FN.flow(
      AR.map(
        FN.flow(
          flattenPair,
          AR.map(foldPx),
          join(''),
          q => quadToGlyph[q as keyof typeof quadToGlyph] ?? `?`,
          pixelColor,
        ),
      ),
      join(''),
    );

    return FN.pipe(bm, chunk4x, AR.map(quadMapper));
  };

export const quadRes = quadResWith(FN.identity);
