import { function as FN } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { append, prepend } from 'fp-ts-std/String';
import { withFst } from 'fp-ts-std/Tuple';
import { bitmap } from 'src/bitmap';
import { Box, box } from 'src/box';
import { color as co, Color } from 'src/color';
import { glyph, Relation, RelationName } from 'src/glyph';
import { BinaryC, Unary } from 'util/function';
import { around } from 'util/string';
import { Pair } from 'util/tuple';
import { relationChainsReport } from './chain';

const [digits2, digits3]: Pair<Unary<number, string>> = [
  n => n.toLocaleString().padStart(2),
  n => n.toLocaleString().padStart(3),
];

const [leftHeadBg, rightHeadBg]: Pair<Color> = ['darkest', 'darker'];

const color = {
  name: FN.flow(append(' '), co.of(['orange', leftHeadBg])),
  label: FN.flow(prepend(' '), co.of(['grey', rightHeadBg])),
  dim: co('dim'),
  dimmer: co('dimmer'),
  num: co('yellow'),
  idx: (idx: number) =>
    FN.pipe(
      idx.toLocaleString(),
      append('.'),
      co.fg('dim'),
      FN.pipe(bitmap.line.halfSolid.left, co.of(['black', leftHeadBg]), append),
    ),
};

const stat: BinaryC<string, number, string> = s =>
  FN.flow(digits3, color.num, append(` ${s} `));

const deco = {
  parens: around(color.dimmer('('), color.dimmer(')')),
  charCount: stat('chars'),
  chainCount: stat('chains'),
  percentCharCount: (n: number) => deco.parens(color.dim('%') + digits3(n)),
  slash: FN.pipe('/', color.dim, join),
  name: (i: number, name: string) => color.idx(i) + color.name(name),
  label: (label: string | undefined) =>
    label === undefined ? '' : color.label(label),
};

export const relationSummary =
  (width: number) =>
  ([
    i,
    {
      def: { name, label },
      counts: { char, charPercent, chain, minChain, maxChain },
    },
  ]: [number, Relation]): Box => {
    const leftHead = box({ row: deco.name(i, name) + deco.label(label) });

    const minMax = FN.pipe(
      deco.slash(['min', 'max']) +
        deco.slash([digits2(minChain), digits3(maxChain)]),
      deco.parens,
    );

    const rightHead = box({
      horizontal: 'right',
      gridBg: rightHeadBg,
      blend: 'over',
      row: [
        deco.charCount(char),
        deco.percentCharCount(charPercent),
        deco.chainCount(chain),
        minMax,
      ].join(''),
    });

    const available = width - box.width.get(leftHead) - 1;

    if (box.width.get(rightHead) <= available)
      return FN.pipe(
        [leftHead, FN.pipe(rightHead, box.width.set(available))],
        box.catRightOf,
      );

    const stacked = FN.pipe([leftHead, rightHead], box.catBelow);

    return box.width.get(stacked) <= width
      ? stacked
      : FN.pipe(stacked, box.width.set(width));
  };

export const relationReport: BinaryC<number, [number, RelationName], string> =
  width =>
  ([idx, relationName]) => {
    const relation = glyph.registry.relations[relationName];

    const summary: Box = FN.pipe(
      relation,
      withFst(idx + 1),
      relationSummary(width),
    );

    return FN.pipe(
      summary,
      FN.pipe(relation.chains, relationChainsReport(width), box.above),
      box.blendOver,
      box.setSolidBg(leftHeadBg),
      box.asString,
    );
  };
