import { tuple as TU, function as FN, option as OP } from 'fp-ts';
import { uncurry2 } from 'fp-ts-std/Function';
import { mapBoth } from 'fp-ts-std/Tuple';
import { HAlign } from 'src/align';
import { border as BO, Border } from 'src/border';
import { box, Box } from 'src/box';
import { Color, MaybeColor } from 'src/color';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';

export interface LabeledConfig {
  horizontal: HAlign;
  border: Border;
  bg: MaybeColor;
  labelBorder: Border;
  labelBg: MaybeColor;
  vGap: number;
}

const defaultBorder = FN.pipe(BO.sets.dash.dot, BO.setFg('dark'));

const config: Unary<Partial<LabeledConfig>, LabeledConfig> = ({
  horizontal = 'center',
  border = defaultBorder,
  bg = OP.none,
  labelBorder = defaultBorder,
  labelBg = OP.none,
  vGap = -1,
}) => ({ horizontal, border, bg, labelBorder, labelBg, vGap });

const of: BinaryC<Partial<LabeledConfig>, string, Endo<Box>> =
  partialConfig => row => content => {
    const { horizontal, border, vGap, bg, labelBorder, labelBg } =
      config(partialConfig);

    const parts: Pair<Box> = FN.pipe([content, box({ row, horizontal })]);

    return FN.pipe(
      parts,
      FN.pipe(parts, box.maxWidth, box.width.set, mapBoth),
      TU.bimap(box.maybeSolidBg(bg), box.maybeSolidBg(labelBg)),
      TU.bimap(BO(labelBorder), BO(border)),
      uncurry2(box.aboveGap(vGap)),
    );
  };

const buildLabeled: Unary<string, Endo<Box>> = of({}),
  border: Unary<Border, typeof buildLabeled> = border =>
    of({ border, labelBorder: border }),
  hSep: typeof buildLabeled = of({ border: BO.empty, labelBorder: BO.topHSep }),
  colored: Unary<Pair<Color>, typeof buildLabeled> = ([labelBg, bg]) =>
    of({
      border: BO.empty,
      labelBorder: BO.empty,
      bg: OP.some(bg),
      labelBg: OP.some(labelBg),
    });

const fns = {
  config,
  of,
  border,
  hSep,
  colored,
} as const;

type labeled = typeof buildLabeled & typeof fns;

export const labeled = buildLabeled as labeled;

Object.assign(labeled, fns);
