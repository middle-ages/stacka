import { membershipTest } from 'util/array';

/**
 * These are lines wheres knowing the line group of snug lines is all you need to
 * compute the correct elbow.
 *
 * For example, consider the thin centered line group called `line`. If you know
 * that the left line is in this group, then you can find the correct elbow
 * given nothing but the group of the snug top line. If it is `thick`, for
 * example, we can compute the elbow `┍` (vertical thin, horizontal thick).
 *
 * On the other hand if we know the left line is in the `halfSolid` group,
 * knowing the group of the snug top line is insufficient information. If
 * it is also `halfSolid`, for example, we need to study the actual line, not
 * just the group. If the left line is `halfSolid` and the top
 * `halfSolid`, the elbow could be:
 *
 * 1. `▄` - in case left is `halfSolid.right`, top is `halfSolid.top`
 * 1. `▗` - in case left is `halfSolid.right`, top is `halfSolid.bottom`
 * 1. `▛` or `▞` - in case left is `halfSolid.left`, top is `halfSolid.top`.
 * Borders, for example, could require either, depending on how they are build
 *
 * Thus the `halfSolid` line group is not included in this group.
 */
export const basicGroups = [
  'space',
  'solid',
  'line',
  'thick',
  'double',
] as const;

export type BasicGroup = typeof basicGroups[number];

const basicGroupCheck = membershipTest(basicGroups);
export const isBasicGroup = (s: string): s is BasicGroup => basicGroupCheck(s);

/**
 * These are lines are have less directional symmetry than the basic lines and
 * require
 */
export const lineGroups = [...basicGroups, 'near', 'halfSolid'] as const;

export type LineGroup = typeof lineGroups[number];

export const elbowGroups = [
  ...lineGroups,
  'round',

  'hThick',
  'vThick',

  'beveled',

  'hMcGugan',
  'vMcGugan',

  'hDouble',
  'vDouble',

  'halfSolidNear',
  'halfSolidFar',

  'hHalfSolid',
  'vHalfSolid',
] as const;

export type ElbowGroup = typeof elbowGroups[number];

const elbowGroupCheck = membershipTest(elbowGroups);
export const isElbowGroup = (s: string): s is ElbowGroup => elbowGroupCheck(s);
