import { bold, grey, underline } from 'ansis/colors';
import { array as AR } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { flow, identity, pipe } from 'fp-ts/lib/function';
import { align, BlendMode, border, Box, box, boxes, color } from 'src/stacka';

type Pair<A> = [A, A];

type ModPair = (bs: Pair<Box>) => Pair<Box>;

type MixConfig = { glyph: boolean; style: boolean };

const [aboveColor, belowColor] = [color.hex('#a00f'), color.hex('#0c0f')];

const bool = (f: boolean): string => (f ? '✅' : '❌') + ' ';

//const reorder: ModPair = TU.mapFst(box.incZOrder);

const allMixes = [
  { glyph: true, style: false },
  { glyph: false, style: false },
  { glyph: true, style: true },
];

const mixBlends: Pair<BlendMode>[] = pipe(
  allMixes,
  AR.map<MixConfig, Pair<BlendMode>>(({ glyph, style }) =>
    glyph === true
      ? style === true
        ? ['hue', 'screen']
        : ['combineOver', 'combineUnder']
      : ['over', 'under'],
  ),
);

/*
          ┌┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┐
          ┊  myBlendMode   ┊
          ├┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┤
          ┊┏━━━━━━━━━┓     ┊
blender = ┊┃↑ above  ┃     ┊  blenders = blends ∘ blender 
          ┊┃    ┏━━━━╋━━━━┓┊
          ┊┗━━━━╋━━━━┛    ┃┊
          ┊     ┃  ↓ below┃┊
          ┊     ┗━━━━━━━━━┛┊
          └┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┘
*/

const blenders =
  (mod: ModPair) =>
  (blends: BlendMode[]): Box => {
    const blender = (blend: BlendMode): Box => {
      const blended = (row: string) => {
        const isBelow = row.endsWith('below'),
          borderColor = isBelow ? belowColor : aboveColor,
          thick = pipe(border.sets.thick, border.setFg(borderColor), border);

        return box({
          row: pipe(row, pipe(color.hex(isBelow ? '#6b6' : '#b66'), color)),
          align: isBelow ? align.bottomRight : align.topLeft,
          apply: flow(box.addHeight(1), box.addWidth(4), thick),
        });
      };

      const [under, over] = pipe(['↓ below', '↑ above'], mapBoth(blended), mod);

      return pipe(
        over,
        box.marginTop(2),
        pipe(under, box.leftOfGap(-6)),
        box.blend.set(blend),
        boxes.labeled(grey`blend=` + underline(blend)),
      );
    };

    return pipe(blends, AR.map(blender), box.catRightOfMiddle);
  };

const mixHeaders = pipe(
  allMixes,
  AR.map(({ glyph, style }: MixConfig) =>
    pipe(
      [bool(glyph) + 'glyphs combined', bool(style) + 'styles mixed'],
      box.fromRows,
      box.height.set(10),
      box.alignM,
    ),
  ),
  box.catBelow,
);

const rows = pipe(mixBlends, AR.map(blenders(identity)), box.catBelow);

const table = pipe(rows, pipe(mixHeaders, box.rightOfGap(2)));

const title = pipe(
  bold`Controling Composition` + ': Blend Modes, Opacity, and ZOrder',
  color.of(['light', 'darker']),
  box.of,
  pipe(border.sets.near, border.setFg('darkest'), border),
);

pipe(title, pipe(table, box.aboveCenterGap(1)), box.print);

/*

const zOrderHeader = (f: boolean): [Box, ModPair] => [
  box.of(`${bool(f)} zOrderFlipped`),
  f ? TU.mapSnd(box.incZOrder) : identity,
];

*/
