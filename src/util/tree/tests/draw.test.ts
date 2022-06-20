import { function as FN } from 'fp-ts';
import { Effect, Endo, Unary } from 'util/function';
import { nChars, nSpaces } from 'util/string';
import { assert, suite, test } from 'vitest';
import { defaultConfig, draw, drawFromConfig, WithConfig } from '../draw';
import { leaf, Tree, tree } from '../TreeF';

suite('draw', () => {
  const buildExpected: Unary<number, Endo<string>> = indent => expectInner => {
    const nLine = FN.pipe(indent, nChars('─')),
      nSpace = nSpaces(indent);
    return `${nLine}┬─1
${nSpace}├${nLine}┬─1.1
 ${expectInner}
${nSpace}└${nLine}─1.2`;
  };

  const checkDrawConfig: WithConfig<Unary<Tree<string>, Effect<string>>> =
    config => inner => expectInner => {
      const iut = FN.pipe([tree('1.1')([inner]), leaf('1.2')], tree('1')),
        actual = FN.pipe(iut, drawFromConfig(config));

      assert.equal(actual, buildExpected(config.indent)(expectInner));
    };

  const checkDraw: Unary<Tree<string>, Effect<string>> = checkDrawConfig(
    defaultConfig,
  );

  test('depth=3', () => checkDraw(leaf('1.1.1'))('│ └──1.1.1'));

  test('indent=4', () =>
    checkDrawConfig({ ...defaultConfig, indent: 4 })(leaf('1.1.1'))(
      '   │    └─────1.1.1',
    ));

  suite('multiline leaf', () => {
    test('one newline', () => checkDraw(leaf('1.1.1\n'))('│ └──1.1.1\n │'));

    test('multiple newlines', () =>
      checkDraw(leaf('1.1.1\n\n\n'))('│ └──1.1.1\n │\n │\n │'));

    test('multiple text lines', () =>
      checkDraw(leaf('1.1.1\n1.1.2\n1.1.3'))(`│ └──1.1.1
 │    1.1.2
 │    1.1.3`));

    test('on final leaf', () => {
      const iut = tree('1')([tree('1.1')([leaf('1.1.1')]), leaf(`1.2\n1.3`)]);
      assert.equal(
        draw(iut),
        `─┬─1
 ├─┬─1.1
 │ └──1.1.1
 └──1.2
    1.3`,
      );
    });
  });

  suite('multiline branch', () => {
    test('one newline', () =>
      checkDraw(tree('1.1.1\n')([leaf('1.1.1.1'), leaf('1.1.1.2')]))(
        `│ └─┬─1.1.1
 │   │
 │   ├──1.1.1.1
 │   └──1.1.1.2`,
      ));
  });
});
