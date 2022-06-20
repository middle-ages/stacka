import {
  array as AR,
  function as FN,
  option as OP,
  readonlyArray as RA,
} from 'fp-ts';
import {
  BlendMode,
  box,
  Box,
  boxes,
  color,
  Color,
  hex,
  OpacityLevel,
  pos,
  Pos,
  size,
} from 'src/stacka';
import { colorGallery } from '../helpers';

type BlendColors = Record<'over' | 'under' | 'middle', Color>;

const colors = {
  blend: [
    {
      over: hex('#0ff'),
      middle: hex('#cc0'),
      under: hex('#909'),
    },
    {
      over: hex('#f00'),
      middle: hex('#0f0'),
      under: hex('#00f'),
    },
  ],
  borderFg: 'darkGrey',
  innerBg: hex('#f8f8f8ff'),
  outerBg: hex('#d8d8d801'),
  labelFg: 'black',
} as const;

const blendBox = ([lvl, c, pos]: [OpacityLevel, Color, Pos]) =>
  box({
    size: size.square(3),
    gridFg: FN.pipe(c, color.setOpacityLevel(lvl)),
    pos,
  });

const opacityReport =
  (colors: BlendColors) => (blend: BlendMode) => (lvl: OpacityLevel) =>
    FN.pipe(
      [
        [lvl, colors.over, pos(2, 1)],
        [lvl, colors.middle, pos(1, 2)],
        [lvl, colors.under, pos.origin],
      ],
      AR.map(blendBox),
      box.branch,
      box.blend.set(blend),
    );

const opacityLevels = FN.pipe(
  color.opacityLevelNames,
  AR.filter(s => s !== 'transparent'),
);
const blendReport =
  (blendColors: BlendColors) =>
  (blend: BlendMode): Box => {
    const report = FN.pipe(blend, opacityReport(blendColors));

    return FN.pipe(
      opacityLevels,
      AR.map(report),
      box.catLeftOfGap(1),
      box.setSolidBg('white'),
      FN.pipe(blend, color(colors.labelFg), boxes.labeled),
    );
  };

const blendReports = (blendColors: BlendColors): Box[] =>
  FN.pipe(
    color.modes,
    AR.filter(mode => !mode.startsWith('combine')),
    FN.pipe(blendColors, blendReport, AR.map),
  );

const report = FN.pipe(
  colors.blend,
  RA.chain(blendReports),
  FN.pipe(
    'Blend Modes: 2 Color Sets ˣ Opacity Levels: ' +
      FN.pipe(opacityLevels, AR.reverse, AR.map(color.opacityLevelAt)).join(
        ', ',
      ),
    colorGallery(-1, OP.some(colors.outerBg)),
  ),
);

box.print(report);
