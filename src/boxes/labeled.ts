import { function as FN } from 'fp-ts';
import { HAlign } from 'src/align';
import { border as BO, Border } from 'src/border';
import { box, Box } from 'src/box';
import * as color from 'src/color';
import { Color } from 'src/color';
import { backdrop } from 'src/stacka';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';

export interface LabeledConfig {
  horizontal: HAlign;
  border: Border;
  bg: Color;
  labelBorder: Border;
  labelBg: Color;
  vGap: number;
}

const config: Unary<Partial<LabeledConfig>, LabeledConfig> = ({
  horizontal = 'center',
  border = BO.empty,
  bg = color.empty,
  labelBorder = BO.empty,
  labelBg = color.empty,
  vGap = 0,
}) => ({ horizontal, border, bg, labelBorder, labelBg, vGap });

const of: BinaryC<Partial<LabeledConfig>, string, Endo<Box>> =
  partialConfig => row => body => {
    const { horizontal, border, vGap, bg, labelBorder, labelBg } =
      config(partialConfig);

    const label = box({ row, horizontal }),
      bodyWidth = box.width.get(body) + BO.width(border),
      labelWidth = bodyWidth - BO.width(labelBorder);

    const labelPanel = FN.pipe(
      label,
      box.width.set(labelWidth),
      box.addBg(labelBg),
      BO(labelBorder),
    );

    const bodyPanel = FN.pipe(
      body,
      BO(border),
      FN.pipe(bg, backdrop.solidBg, box.backdrop.set),
    );

    return FN.pipe(labelPanel, FN.pipe(bodyPanel, box.aboveGap(vGap)));
  };

const buildLabeled: Unary<string, Endo<Box>> = of({}),
  border: Unary<Border, typeof buildLabeled> = border =>
    of({ border, labelBorder: border }),
  hSep: typeof buildLabeled = of({ border: BO.empty, labelBorder: BO.topHSep }),
  colored: Unary<Pair<Color>, typeof buildLabeled> = ([labelBg, bg]) =>
    of({
      border: BO.empty,
      labelBorder: BO.empty,
      bg,
      labelBg,
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
