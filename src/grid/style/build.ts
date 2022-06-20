import { AnserJsonEntry, DecorationName } from 'anser';
import { array as AR, function as FN, option as OP } from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import { color, Color } from 'src/color';
import { typedFromEntries } from 'util/object';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { Decoration, empty, Style } from './types';

export const buildStyle: Unary<Partial<Style>, Style> = st => ({
  ...empty,
  ...st,
});

export const fromFg: Unary<Color, Style> = c => buildStyle({ fg: OP.some(c) }),
  fromBg: Unary<Color, Style> = c => buildStyle({ bg: OP.some(c) }),
  colored: Unary<Pair<Color>, Style> = ([fg, bg]) =>
    buildStyle({
      fg: OP.some(fg),
      bg: OP.some(bg),
    });

const parsedColor: Unary<string, Color> = s => {
  const [r, g, b] = FN.pipe(s.split(', '), AR.map(parseInt));
  return color.rgba([r, g, b, 0.6]);
};

const decoMap: Record<DecorationName, Decoration | undefined> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  reverse: 'inverse',
  strikethrough: 'strikethrough',
  dim: undefined,
  blink: undefined,
  hidden: undefined,
};

const decoration: Unary<DecorationName, Decoration[]> = name => {
  const deco = decoMap[name];
  return deco === undefined ? [] : [deco];
};

export const fromParsed: Unary<AnserJsonEntry, Style> = ({
  decorations,
  bg,
  fg,
}) =>
  buildStyle({
    fg: FN.pipe(fg, OP.fromNullable, OP.map(parsedColor)),
    bg: FN.pipe(bg, OP.fromNullable, OP.map(parsedColor)),
    ...FN.pipe(
      decorations,
      AR.chain(decoration),
      AR.map(withSnd(true)),
      typedFromEntries,
    ),
  });
