import { array as AR, function as FN, option as OP } from 'fp-ts';
import { toSnd } from 'fp-ts-std/Tuple';
import { makeRegistry as makeBitmapRegistry } from 'src/bitmap/registry';
import { glyph } from 'src/stacka';
import { computePairs } from 'src/glyph/relation';
import { Pair } from 'src/util/tuple';

const bitmapRegistry = makeBitmapRegistry();

const [charPairs] = computePairs(bitmapRegistry);

const combined: [Pair<string>, OP.Option<string>][] = FN.pipe(
  charPairs,
  FN.pipe(glyph.tryCombine, toSnd, AR.map),
);

const res = FN.pipe(
  combined,
  AR.map(([[fst, snd], resOp]) =>
    FN.pipe(
      resOp,
      OP.chain(res =>
        fst !== snd && fst !== res && snd !== res
          ? OP.some(`${fst} ⊕ ${snd} = ${res}`)
          : OP.none,
      ),
    ),
  ),
  AR.compact,
  AR.chunksOf(7),
);

for (const chunk of res) {
  console.log(chunk.join('  '));
  console.log();
}
