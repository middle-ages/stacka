import { underline } from 'ansis/colors';
import { array as AR, readonlyArray as RA } from 'fp-ts';
import { flip, fork } from 'fp-ts-std/Function';
import { mapBoth, toSnd } from 'fp-ts-std/Tuple';
import { pipe } from 'fp-ts/lib/function';
import {
  align,
  border,
  box,
  Color,
  color,
  HAlign,
  OpC,
  VAlign,
} from 'src/stacka';
import { colorGallery, glass, semiOpaque } from '../helpers';

const {
  basicNames,
  gapNames,
  hAlignNames,
  vAlignNames,
  hAlignGapNames,
  vAlignGapNames,
} = box.placements;

const colors = { anchor: 'cyan' as Color, it: 'magenta' as Color };

const hAlignName = (name: string, append?: string) => (hAlign: HAlign) =>
    name + ' ' + align.hAlignSym[hAlign] + (append ?? ''),
  vAlignName = (name: string, append?: string) => (vAlign: VAlign) =>
    name + ' ' + align.vAlignSym[vAlign] + (append ?? '');

const boxBorder = (type: 'anchor' | 'it') =>
  border.colored('beveled', [
    semiOpaque(color.darken(1 / 15)(colors[type])),
    glass(color.darken(0.2)(colors[type])),
  ]);

const reportBorder = pipe(
  border.sets.halfSolidNear,
  border.mask.openT,
  border.setColor([color.grays[5], color.grays[7]]),
  border,
);

type Places = readonly [string, OpC][];

const basicPlacements: Places = pipe(basicNames, RA.map(toSnd(n => box[n]))),
  gapPlacements: Places = pipe(
    gapNames,
    RA.map(n => [`${n} 1`, box[n](1)]),
  ),
  hAlignPlacements: Places = pipe(
    hAlignNames,
    RA.chain(name =>
      pipe(
        ['center', 'right'] as const,
        RA.map(fork([hAlignName(name), box[name]])),
      ),
    ),
  ),
  vAlignPlacements: Places = pipe(
    vAlignNames,
    RA.chain(name =>
      pipe(
        ['top', 'middle'] as const,
        RA.map(fork([vAlignName(name), box[name]])),
      ),
    ),
  ),
  hAlignGapPlacements: Places = pipe(
    hAlignGapNames,
    RA.chain(name =>
      pipe(
        ['center', 'right'] as const,
        RA.map(fork([hAlignName(name, ' 1'), flip(box[name])(1)])),
      ),
    ),
  ),
  vAlignGapPlacements: Places = pipe(
    vAlignGapNames,
    RA.chain(name =>
      pipe(
        ['top', 'middle'] as const,
        RA.map(fork([vAlignName(name, ' 1'), flip(box[name])(1)])),
      ),
    ),
  );

const reportBox = (type: keyof typeof colors) =>
  box.centered({
    row: pipe(type, color.of(['black', colors[type]])),
    gridBg: colors[type],
    height: type === 'anchor' ? 3 : 1,
    apply: boxBorder(type),
  });

const placementReport = ([name, op]: [string, OpC]) => {
  const [anchor, it] = pipe(['anchor', 'it'], mapBoth(reportBox));

  const panel = pipe(it, op(anchor), box.blend.set('multiply'));

  const report = pipe(
    name,
    underline,
    color.fg('lightgray'),
    box.fromRow,
    box.width.set(19),
    box.center,
    box.aboveCenter(panel),
    box.setSolidBg(color.grays[3]),
  );

  return pipe(report, box.height.set(10), box.blendScreen, reportBorder);
};

const report = pipe(
  [
    ...basicPlacements,
    ...gapPlacements,
    ...hAlignPlacements,
    ...vAlignPlacements,
    ...hAlignGapPlacements,
    ...vAlignGapPlacements,
  ],
  AR.map(placementReport),
  AR.chunksOf(4),
  AR.map(box.catSnugRightOf),
  pipe('Binary Placement Combinators', colorGallery([0, 0])),
);

box.print(report);
