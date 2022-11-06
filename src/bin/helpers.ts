import { function as FN, option as OP } from 'fp-ts';
import { toSnd } from 'fp-ts-std/Tuple';
import { border, box, Box, boxes, color, MaybeColor } from 'src/stacka';

export const addDarkBorder = border.withFg('dotted', 'dark');

const [outerBorder, outerBorderWidth] = FN.pipe(
  border.sets.halfSolidNear,
  border.setColor(['lighterGrey', 'darker']),
  toSnd(border.width),
);

const titleBox = (s: string): Box =>
  box({
    row: FN.pipe(s, color.of(['darkRed', 'white'])),
    apply: FN.flow(
      FN.pipe(
        border.sets.solid,
        border.mask.noHEdges,
        border.setFg('lighter'),
        border,
      ),
      boxes.win.marginsToTerm(outerBorderWidth),
      box.setSolidBg('light'),
      box.alignC,
    ),
  });

export const title: (s: string, bg: MaybeColor) => (b: Box) => Box = (s, bg) =>
  FN.flow(
    FN.pipe(s, titleBox, box.belowCenter),
    box.maybeSolidBg(bg),
    border(outerBorder),
  );

const blendSnug =
  (bg: MaybeColor) => (place: typeof box.catBelowGap, gap: number) =>
    FN.flow(
      place(gap),
      gap === -1 ? box.blendNormal : box.blendOver,
      box.maybeSolidBg(bg),
    );

/** Layout given boxes and add a label on top */
export const colorGallery =
  (gap: number, bg: MaybeColor) =>
  (label: string) =>
  (bs: Box[] | readonly Box[]): Box => {
    const place = blendSnug(bg);

    return FN.pipe(
      [...bs],
      boxes.win.flow.of({
        hGap: gap,
        placeH: place(box.catRightOfGap, gap),
        placeV: place(box.catBelowGap, gap),
        shrink: outerBorderWidth,
      }),
      title(label, bg),
    );
  };
export const gapGallery = (gap: number) => colorGallery(gap, OP.none),
  snugGallery = gapGallery(-1),
  gallery = colorGallery(1, OP.none);
