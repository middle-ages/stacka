import { italic, strike } from 'ansis/colors';
import { flip } from 'fp-ts-std/Function';
import { flow, pipe } from 'fp-ts/lib/function';
import { align, backdrop, border, Box, box, boxes, color } from 'src/stacka';

const glass = color.semiOpaque,
  lighten = flow(color.lighten(0.4), glass),
  darken = flow(color.darken(0.25), glass);

const semiGray = glass(color.grays[70]),
  magenta = glass('magenta'),
  [lightMagenta, darkMagenta] = [lighten(magenta), darken(magenta)];

const compositional = pipe(
  pipe('😐📦📝💻🔔⌚', box.of, box.hMargins(2)),
  pipe(
    color.fg(lightMagenta)('compositional'),
    pipe(
      {
        border: pipe(border.sets.thick, border.setFg(lightMagenta)),
        labelBorder: pipe(border.sets.line, border.setFg(color.grays[20])),
        vGap: -1,
      },
      boxes.labeled.of,
    ),
  ),
);

const title = pipe(`stacka`, box.of),
  titleN = (n: number) =>
    pipe(strike`stacka`, color.fg(color.grays[n]), box.fromRow),
  titlePair = (n: number) =>
    flow(pipe(n, titleN, box.above), pipe(n, titleN, box.below)),
  titles = pipe(title, titlePair(70), titlePair(50), titlePair(20));

const terminal: Box = pipe(
  {
    row: italic`terminal`,
    apply: flow(
      box.hMargins(2),
      pipe(border.sets.round, border.setFg(magenta), border),
    ),
  },
  box,
  box.margin(1),
);

const compositionalTerminal = pipe(
  terminal,
  pipe(
    titles,
    pipe(compositional, box.blendScreen, box.aboveCenterGap(-1)),
    box.rightOfGap(-3),
  ),
  box.marginTop(2),
);

const pseudographics: Box = pipe(
  {
    row: pipe('pseudographics', color.bg(darkMagenta)),
    backdrop: backdrop.checkers1x1,
    blend: 'screen',
    align: align.middleCenter,
    height: 3,
    apply: flow(box.addWidth(2), box.margin(1)),
  },
  box,
  flip(box.unaryBranchWith)({
    align: align.middleCenter,
    backdrop: backdrop.colorHalfCheckers(semiGray),
    blend: 'screen',
    apply: flow(
      box.center,
      pipe([color.grays[30], darkMagenta], border.checkeredNear, border),
      border.colored('halfSolidNear', [color.grays[20], color.grays[10]]),
      box.margin(1),
      pipe(border.sets.double, border.setFg(darkMagenta), border),
    ),
  }),
);

const res = pipe(
  compositionalTerminal,
  box.blendScreen,
  pipe(pseudographics, box.leftOfGap(-3)),
);

box.print(res);
