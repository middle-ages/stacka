import { function as FN } from 'fp-ts';
import { add, negate } from 'fp-ts-std/Number';
import { Box, box, BoxSet, BuildBox, Cat } from 'src/box';
import { Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { termWidth as getTermWidth } from 'src/term';
import * as FL from './flow';

/** Sets the given box width to terminal width minus given margin */
export const marginsToTerm: BoxSet<number> = n =>
  FN.pipe(n, negate, add(getTermWidth()), box.width.set);

/** Sets the given box width to terminal width */
export const sizeToTerm: Endo<Box> = marginsToTerm(0);

/**
 * Given a box constructor, transforms it so that the boxes it creates will be
 * as wide as the terminal
 */
export const termWidth: Endo<BuildBox> = build => FN.flow(build, sizeToTerm);

export type WinFlowConfig = Partial<Omit<FL.FlowConfig, 'available'>>;

/** A `boxes.flow` box with terminal width as available size */
const of: Unary<WinFlowConfig, Cat> = args =>
  FL.flow.of({ ...args, available: getTermWidth() });

const gap: Unary<Pair<number>, Cat> = gaps =>
  FN.pipe(getTermWidth(), FL.flow.gap(gaps));

const [hGap, vGap]: Pair<Unary<number, Cat>> = [
  hGap => gap([hGap, 0]),
  vGap => gap([0, vGap]),
];

const snug = gap([-1, -1]);

const flowImp = hGap(0);

const fns = { of, gap, hGap, vGap, snug } as const;

export type flow = typeof flowImp & typeof fns;

export const flow = flowImp as flow;

Object.assign(flow, fns);
