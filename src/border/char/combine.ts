import { function as FN } from 'fp-ts';
import { and } from 'fp-ts-std/Boolean';
import { uncurry2 } from 'fp-ts-std/Function';
import { BinOpT } from 'util/function';
import { pluck } from 'util/object';
import { Char } from 'util/string';
import { pairMap } from 'util/tuple';
import { glyphByChar, glyphByKey, hasGlyph } from './map';
import { stackToKey } from './stack';

// should try cut in half and paste before stacking
export const combine: BinOpT<Char> = charPair => {
  const [, snd] = charPair;
  if (!FN.pipe(charPair, pairMap(hasGlyph), uncurry2(and))) return snd;

  const key = FN.pipe(
    charPair,
    pairMap(glyphByChar),
    FN.pipe('display', pluck, pairMap),
    stackToKey,
  );

  return glyphByKey(key)?.char ?? snd;
};
