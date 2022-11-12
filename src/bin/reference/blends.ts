import { array as AR, function as FN } from 'fp-ts';
import {
  BlendMode,
  box,
  Box,
  boxes,
  color,
  Color,
  Level,
  pos,
  Pos,
  size,
} from 'src/stacka';
import { colorGallery } from '../helpers';

type BlendColors = Record<'over' | 'under' | 'middle', Color>;

const colors = {
  blend: [
    {
      over: 0x1f_00_ff_ff,
      middle: 0x90_c0_c0_00,
      under: 0xe0_90_00_90,
    },
    {
      over: 0x1f_ff_00_00,
      middle: 0x90_00_ff_00,
      under: 0xe0_00_00_ff,
    },
  ],
} as const;

const blendBox = ([lvl, c, pos]: [Level, Color, Pos]) =>
  box({
    size: size.square(3),
    gridFg: FN.pipe(c, FN.pipe(lvl, color.levelAt, color.opacity.set)),
    pos,
  });

const opacityReport =
  (colors: BlendColors) => (blend: BlendMode) => (lvl: Level) =>
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
  color.levelNames,
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
      box.colorBg('white'),
      FN.pipe(blend, color.fg('lightgray'), boxes.labeled),
    );
  };

const blendReports = (blendColors: BlendColors) =>
  FN.pipe(
    [...color.blendModes],
    AR.filter(
      mode => !mode.startsWith('combine') && !mode.startsWith('default'),
    ),
    FN.pipe(blendColors, blendReport, AR.map),
  );

const report = FN.pipe(
  [...colors.blend],
  AR.chain(blendReports),
  FN.pipe(
    'Blend Modes: 2 Color Sets ˣ Opacity Levels: ' +
      FN.pipe(
        opacityLevels,
        AR.reverse,
        AR.map(l => (color.levelAt(l) / 255).toFixed(1)),
      ).join(', '),
    colorGallery([2, 1]),
  ),
);

box.print(report);
