import {
  array as AR,
  function as FN,
  option as OP,
  string as STR,
} from 'fp-ts';
import { BinaryC, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { registry as reg } from '../../registry';
import * as SK from '../stack';

const checkStackWith =
  (fstChar: string) => (sndChar: string, expect: string) => {
    const [fst, snd] = FN.pipe([fstChar, sndChar], AR.map(reg.matrixByChar));
    test(`“${fstChar}” ⊕ “${sndChar}” = “${expect}”`, () =>
      assert.deepEqual(SK.tryStacks([fst, snd]), OP.some(expect)));
  };

const checkTupled: BinaryC<string, string, void> = fst => rest =>
  FN.pipe(
    rest,
    STR.split(/\s+/) as Unary<string, Pair<string>>,
    FN.pipe(fst, checkStackWith, FN.tupled),
  );

const checkN = FN.flow(checkTupled, AR.map);

const check = (char: string, cases: string[]) =>
  suite(`stack with “${char}”`, () => void FN.pipe(cases, checkN(char)));

suite('bitmap stacking', () => {
  const fiveElbows = FN.pipe('elbow', reg.charsByRole, AR.takeLeft(5));

  suite('∀g ∈ glyphs: “█” ⊕ g = “█”', () => {
    for (const char of fiveElbows) checkStackWith('█')(char, '█');
  });

  suite('∀g ∈ glyphs: “ ” ⊕ g = g', () => {
    for (const char of fiveElbows) checkStackWith(' ')(char, char);
  });

  suite('∀g ∈ glyphs: g ⊕ g = g', () => {
    for (const char of [' ', '█', ...fiveElbows])
      checkStackWith(char)(char, char);
  });

  checkStackWith('╵')('╷', '│');
  checkStackWith('│')('─', '┼');
  checkStackWith('┿')('╄', '╇');
  checkStackWith('▖')('▘', '▌');
  checkStackWith('╸')('╺', '━');

  check('▛', ['▗ █', '▚ █', '▄ █', '▐ █', '▖ ▛', '▝ ▛', '▘ ▛', '▀ ▛', '▌ ▛']);

  check('═', ['║ ╬', '╚ ╩', '┶ ┷', '│ ╪', '─ ━', '┼ ┿', '━ ━', '╾ ━']);

  check('▌', ['▗ ▙', '▝ ▛', '▄ ▙']);

  check('┕', ['└ ┕', '╘ ┕', '┗ ┗', '┖ ┗', '╚ ┗', '┑ ┿', '┍ ┝', '┃ ┣']);
});
