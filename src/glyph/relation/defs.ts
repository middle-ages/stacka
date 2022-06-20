import { record as RC } from 'fp-ts';
import { bitmap } from 'src/bitmap';
import { dash, matrixCriteria, weight, shift } from '../criteria';

export const relations = {
  turn: {
    label: 'Clockwise turn 90ᵒ',
    note: '∀ g⯈* ∈ turn : turn(turn(g))=g' + ' ∨ turn(turn(turn(turn(g))))=g',
    criteria: matrixCriteria(bitmap.query.turnEq),
  },

  invert: {
    label: 'Invert every pixel',
    note: 'Symmetric',
    criteria: matrixCriteria(bitmap.query.invertEq),
  },

  hFlip: {
    label: 'Flip on vertical axis',
    criteria: matrixCriteria(bitmap.query.hFlipEq),
  },

  vFlip: {
    label: 'Flip on horizontal axis',
    criteria: matrixCriteria(bitmap.query.vFlipEq),
  },

  weight: {
    label: 'Glyph weight',
    criteria: weight,
  },

  shift: {
    label: 'Glyph translates top→down/left→right',
    criteria: shift,
  },

  dash: {
    label: 'Increase in dashing level',
    criteria: dash,
  },
} as const;

export const allRelationNames = RC.keys(relations);
