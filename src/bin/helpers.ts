import { function as FN } from 'fp-ts';
import { toSnd } from 'fp-ts-std/Tuple';
import { border, box, Box, boxes, Cat, color } from 'src/stacka';

export const semiOpaque = color.semiOpaque,
  glass = color.semiTransparent,
  lighten = FN.flow(color.lighten(0.4), semiOpaque),
  lightenMost = FN.flow(color.lighten(0.47), semiOpaque),
  darken = FN.flow(color.darken(0.25), semiOpaque),
  darkenMore = FN.flow(color.darken(0.3), semiOpaque),
  darkenMost = FN.flow(color.darken(0.45), semiOpaque);

export const colors = {
  darkestGray: semiOpaque(color.grays[5]),
  darkGray: semiOpaque(color.grays[35]),
  semiGray: semiOpaque(color.grays[80]),
  semiWhite: semiOpaque(color.grays[98]),
  lightOrange: lighten('orange'),
  darkOrange: darken('orange'),
  lightCrimson: lighten('crimson'),
  lightestCrimson: lightenMost('crimson'),
  crimson: semiOpaque('crimson'),
  darkCrimson: darken('crimson'),
  darkerCrimson: darkenMore('crimson'),
  darkestCrimson: darkenMost('crimson'),
};

export const grays = color.grays;

const [outerBorder, outerMargins] = FN.pipe(
    border.sets.vHalfSolid,
    border.setColor([grays[80], grays[15]]),
    toSnd(border.width),
  ),
  labelBorder = FN.pipe(outerBorder, border.mask.noHEdges);

export const panel = ([hGap, vGap]: [number, number]): Cat =>
  FN.pipe(
    {
      hGap,
      placeH: box.catAlignRightOfGap('middle')(hGap),
      placeV: box.catBelowGap(vGap),
      shrink: outerMargins,
    },
    boxes.win.flow.of,
  );

/** Layout given boxes and add a label on top */
export const colorGallery =
  (gaps: [number, number]) =>
  (label: string) =>
  (bs: Box[]): Box => {
    const body = FN.pipe(bs, panel(gaps));

    return boxes.labeled.of({
      border: outerBorder,
      labelBorder,
      bg: grays[3],
      labelBg: grays[92],
    })(color.of([colors.darkerCrimson, 'white'])(label))(body);
  };

export const snugGallery = colorGallery([-1, -1]),
  gallery = colorGallery([0, 0]);
