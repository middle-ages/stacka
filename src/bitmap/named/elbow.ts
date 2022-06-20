import {
  function as FN,
  option as OP,
  predicate as PRE,
  record as RC,
} from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { corner, Cornered, dir, HDir, VDir } from 'src/geometry';
import { BinaryC, Unary } from 'util/function';
import { mapValues, typedFromEntries, typedValues } from 'util/object';
import { Pair } from 'util/tuple';
import { classifyHChar, classifyVChar } from './group';
import { HCornerLine, line as LN, VCornerLine } from './line';
import * as JU from './other';
import { Direct, isDirect, Orient } from './types';

type LineMap = Record<
  HDir,
  Record<VCornerLine, Record<VDir, Partial<Record<HCornerLine, string>>>>
>;

const solidMap: Record<JU.Solid, JU.Solid> = { [JU.solid]: JU.solid },
  spaceMap: Record<JU.Space, JU.Space> = { [JU.space]: JU.space },
  nearMap = {
    top: { [LN.near.top]: JU.space },
    bottom: { [LN.near.bottom]: JU.space },
  } as const;

const solid = { [JU.solid]: FN.pipe(solidMap, dup, dir.withVDirs) } as const,
  space = { [JU.space]: FN.pipe(spaceMap, dup, dir.withVDirs) } as const,
  near = { [LN.near.right]: nearMap, [LN.near.left]: nearMap } as const;

const other = { ...near, ...solid, ...space } as const;

const line: LineMap = {
  left: {
    line: {
      top: { line: '┌', thick: '┍', double: '╒' },
      bottom: { line: '└', thick: '┕', double: '╘' },
    },

    thick: {
      top: { line: '┎', thick: '┏' },
      bottom: { line: '┖', thick: '┗' },
    },

    double: {
      top: { double: '╔', line: '╓' },
      bottom: { double: '╚', line: '╙' },
    },

    '▌': { top: { '▀': '▛' }, bottom: { '▄': '▙' } },
    '▐': { top: { '▄': '▗' }, bottom: { '▀': '▝' } },

    ...other,
  },
  right: {
    line: {
      top: { line: '┐', thick: '┑', double: '╕' },
      bottom: { line: '┘', thick: '┙', double: '╛' },
    },

    thick: {
      top: { line: '┒', thick: '┓', double: '' },
      bottom: { line: '┚', thick: '┛', double: '' },
    },

    double: {
      top: { double: '╗', line: '╖', thick: '' },
      bottom: { double: '╝', line: '╜', thick: '' },
    },

    '▌': { top: { '▄': '▖' }, bottom: { '▀': '▘' } },
    '▐': { top: { '▀': '▜' }, bottom: { '▄': '▟' } },

    ...other,
  },
};

const lineToRound = {
  '┌': '╭',
  '┐': '╮',
  '└': '╰',
  '┘': '╯',
} as const;

const roundCorners = typedValues(lineToRound);

type LineCorner = keyof typeof lineToRound;

type GetElbow = BinaryC<[HDir, VDir], Pair<string>, OP.Option<string>>;

const getElbow: GetElbow =
  ([hDir, vDir]) =>
  ([vChar, hChar]) =>
    FN.pipe(
      line[hDir],
      OP.fromNullable,
      OP.chain(h => FN.pipe(h[classifyVChar(vChar)], OP.fromNullable)),
      OP.chain(v => FN.pipe(v[vDir], OP.fromNullable)),
      OP.chain(c => FN.pipe(c[classifyHChar(hChar)], OP.fromNullable)),
    );

const dirElbows: Unary<Direct, Cornered<OP.Option<string>>> = ({
  top,
  right,
  bottom,
  left,
}) => ({
  topLeft: getElbow(['left', 'top'])([left, top]),
  topRight: getElbow(['right', 'top'])([right, top]),
  bottomLeft: getElbow(['left', 'bottom'])([left, bottom]),
  bottomRight: getElbow(['right', 'bottom'])([right, bottom]),
});

const orientElbows: Unary<Orient, Cornered<OP.Option<string>>> = ({
  horizontal,
  vertical,
}) =>
  dirElbows({
    top: horizontal,
    right: vertical,
    bottom: horizontal,
    left: vertical,
  });

const hvNearElbows: Unary<Direct, Cornered<OP.Option<string>>> = ({ left }) =>
  FN.pipe(
    left === LN.right
      ? ({
          topLeft: LN.right,
          topRight: LN.left,
          bottomLeft: LN.right,
          bottomRight: LN.left,
        } as Cornered<string>)
      : ({
          topLeft: LN.bottom,
          topRight: LN.bottom,
          bottomLeft: LN.top,
          bottomRight: LN.top,
        } as Cornered<string>),
    RC.map(OP.some),
  );

const isHVNear: PRE.Predicate<Direct> = ({ left, top }) =>
  (left === LN.right && top === LN.top) ||
  (left === LN.left && top === LN.bottom);

export const elbowsFor: Unary<
  Orient | Direct,
  Cornered<OP.Option<string>>
> = od =>
  isDirect(od)
    ? isHVNear(od)
      ? hvNearElbows(od)
      : dirElbows(od)
    : orientElbows(od);

export const roundElbowsFor: Unary<
  Orient | Direct,
  Cornered<OP.Option<string>>
> = FN.flow(
  elbowsFor,
  mapValues(OP.chain(c => OP.fromNullable(lineToRound[c as LineCorner]))),
);

export const elbowsOrSpace: Unary<Orient | Direct, Cornered<string>> = od =>
  FN.pipe(od, elbowsFor, mapValues(FN.pipe(' ', FN.constant, OP.getOrElse)));

export const roundElbowsOrSpace: Unary<
  Orient | Direct,
  Cornered<string>
> = od =>
  FN.pipe(
    od,
    roundElbowsFor,
    mapValues(FN.pipe(' ', FN.constant, OP.getOrElse)),
  );

export const round: Cornered<string> = typedFromEntries(
  corner.zip(roundCorners),
);

export const innerCheckers: Cornered<string> = {
  topLeft: '▞',
  bottomLeft: '▚',
  topRight: '▚',
  bottomRight: '▞',
};
