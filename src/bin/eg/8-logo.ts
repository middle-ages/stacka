import { bold, italic, strike } from 'ansis/colors';
import { flow, pipe } from 'fp-ts/lib/function';
import { align, backdrop, border, box, boxes, color, size } from 'src/stacka';

const compositional = pipe(
  pipe('😐📦📝💻🔔⌚', box.of, box.hMargins(2)),
  pipe(
    'compositional',
    pipe(
      {
        border: pipe(border.sets.thick, border.setFg('pink')),
        labelBorder: pipe(border.sets.line, border.setFg('darker')),
      },
      boxes.labeled.of,
    ),
  ),
);

const title = pipe(`stacka`, box.of),
  titleN = (n: number) => {
    const c = Math.floor(255 / (n + 1) ** 2);
    return pipe(
      strike`stacka`,
      pipe([c, c, c, 0.5], color.rgba, color.fg),
      box.of,
    );
  },
  titlePair = (n: number) =>
    flow(pipe(n, titleN, box.above), pipe(n, titleN, box.below)),
  titles = pipe(title, titlePair(1), titlePair(2), titlePair(3));

const withTitles = pipe(
  compositional,
  box.snugBelowCenter(titles),
  box.blendUnder,
);

const terminal = pipe(
  {
    row: italic`terminal`,
    apply: flow(
      box.hMargins(2),
      box.blend.set('multiply'),
      pipe(border.sets.round, border.setFg('magenta'), border),
    ),
  },
  box,
  border.space,
);

const compositionalTerminal = pipe(
  terminal,
  pipe(withTitles, box.rightOfGap(-3)),
);

const pseudographics = pipe(
  {
    row: pipe(bold`pseudographics`, color.of(['black', 'pink'])),
    backdrop: backdrop.checkers1x1,
    blend: 'normal',
    apply: box.addSize(size(2, 2)),
  },
  box.centered,
  box.unaryBranchWith({
    align: align.middleCenter,
    backdrop: backdrop.halfCheckers,
    apply: flow(
      pipe(2, size.square, box.addSize),
      pipe('dark', border.checkeredNear, border),
    ),
  }),
  border.nest([
    pipe(border.sets.space, border.setBg('darker')),
    pipe(border.sets.double, border.setFg('pink')),
  ]),
);

const res = pipe(
  compositionalTerminal,
  pipe(pseudographics, box.leftOfMiddleGap(-3)),
);

box.print(res);
