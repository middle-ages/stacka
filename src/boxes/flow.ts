import assert from 'assert';
import {
  array as AR,
  function as FN,
  reader as RE,
  readonlyArray as RA,
} from 'fp-ts';
import { box, Box, BoxSet, Cat } from 'src/box';
import { BlendMode, color } from 'src/color';
import { BinaryC, Endo, Unary } from 'util/function';
import { pluck } from 'util/object';
import { delay, final, tco, Tco } from 'util/tco';
import { Pair } from 'util/tuple';

export interface FlowConfig {
  /**
   * `Cat` function that will be used for horizontal layout, for example:
   * `box.catRightOf`
   */
  placeH: Cat;
  /**
   * `Cat` function that will be used for vertical layout, for example:
   * `box.catBelow`
   */
  placeV: Cat;
  /**
   * The horizontal gap that will be created by `placeH`, where zero means you
   * are using a gap-less function like `box.catRightOf`
   */
  hGap: number;
  /**
   * Available width in row. Boxes will flow to new row when they overflow this
   * width
   */
  available: number;
  /**
   * Removed from available row width, useful if box has margins, borders, etc.
   */
  shrink: number;
  /** Parent blend mode to override the default `combineOver` */
  blend: BlendMode;
  /**
   * An optional function from `Box` to `Box` that will be called after clipping
   * a flowed box. Clipping happens when a box is wider than the full available
   * space of the row. This will be called only if a box was clipped with one
   * parameter: the recently clipped box. Use this to visually mark a box as
   * clipped.
   */
  clipMark: Endo<Box>;
}

export type MinFlowConfig = Partial<FlowConfig> & { available: number };

export const defaultConfig: Unary<MinFlowConfig, FlowConfig> = config => ({
  placeH: box.catRightOf,
  placeV: box.catBelow,
  hGap: 0,
  shrink: 0,
  blend: color.defaultBlendMode,
  clipMark: FN.identity,
  ...config,
});

interface FlowState extends FlowConfig {
  todo: Box[]; // items that have not been positioned yet
  done: Box[][]; // positioned items, except current row
  current: Box[]; // positioned items in current row
  used: number; // width of items in current row
}

const clip: Unary<Endo<Box>, BoxSet<number>> = clipMark => available => bx => {
  const boxWidth = box.width.get(bx),
    res = Math.min(available, boxWidth);

  return FN.pipe(
    bx,
    box.width.set(res),
    boxWidth > available ? clipMark : FN.identity,
  );
};

const init: BinaryC<FlowConfig, Box[], FlowState> = config => todo => ({
  ...config,
  todo: FN.pipe(todo, FN.pipe(config.available, clip(config.clipMark), AR.map)),
  done: [],
  current: [] as Box[],
  used: 0,
});

const step: Unary<FlowState, Tco<FlowState>> = state => {
  const { hGap, available, todo, done, current, used, ...config } = state,
    isNewRow = AR.isEmpty(current);

  if (AR.isEmpty(todo)) return final({ ...state, done: [...done, current] });

  const [currentBox, ...nextTodo] = todo,
    boxWidth = box.width.get(currentBox),
    nextUsed = used + boxWidth + (isNewRow ? 0 : hGap),
    canFit = nextUsed <= available - state.shrink;

  assert(!isNewRow || (isNewRow && used === 0), 'non-zero “used” in new row');

  return delay(() =>
    step({
      ...config,
      available,
      hGap,
      todo: nextTodo,
      current: [...(canFit ? current : []), currentBox],
      ...(canFit
        ? { done, used: nextUsed }
        : { done: [...done, current], used: boxWidth }),
    }),
  );
};

const run: BinaryC<FlowConfig, Box[], Box[][]> = FN.flow(
  init,
  RE.map(FN.flow(step, tco, pluck('done'))),
);

const of: Unary<MinFlowConfig, Cat> = partial => boxes => {
  const config = defaultConfig(partial),
    setBlend = box.blend.set(config.blend);

  return FN.pipe(
    boxes as Box[],
    run(config),
    RA.map(FN.flow(config.placeH, setBlend)),
    config.placeV,
    setBlend,
  );
};

const gap: BinaryC<Pair<number>, number, Cat> =
  ([hGap, vGap]) =>
  available =>
    of({
      available,
      hGap,
      placeH: box.catRightOfGap(hGap),
      placeV: box.catBelowGap(vGap),
    });

const [hGap, vGap]: Pair<BinaryC<number, number, Cat>> = [
  hGap => gap([hGap, 0]),
  vGap => gap([0, vGap]),
];

const snug = gap([-1, -1]);

/**
 * An N-ary placement combinators, like `hcat`, but flows overflowing content
 * over multiple rows from top left to bottom right, with rows aligned to the
 * bottom and cells to the left.
 */
const flowImp = hGap(0);

const fns = { of, gap, hGap, vGap, snug } as const;

export type flow = typeof flowImp & typeof fns;

export const flow = flowImp as flow;

Object.assign(flow, fns);
