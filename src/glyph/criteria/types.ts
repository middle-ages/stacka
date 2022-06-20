import { predicate as PRE } from 'fp-ts';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { RelCheck } from '../../bitmap';
import { defineChains, definePairs } from './char';

export type CharCheck = PRE.Predicate<Pair<string>>;

export interface MatrixCriteria {
  matrixCheck: RelCheck;
}

export interface CharCriteria {
  charCheck: CharCheck;
}

export interface FixedCriteria {
  pairs: Pair<string>[];
  chains: string[][];
}

export type Criteria = MatrixCriteria | CharCriteria | FixedCriteria;

export const matrixCriteria: Unary<RelCheck, MatrixCriteria> = matrixCheck => ({
    matrixCheck,
  }),
  charCriteria: Unary<CharCheck, CharCriteria> = charCheck => ({ charCheck }),
  fixedCriteria: Unary<Pair<string[]>, FixedCriteria> = ([pairs, chains]) => ({
    pairs: definePairs(pairs),
    chains: defineChains(chains),
  });

const isMatrixCriteria = (c: Criteria): c is MatrixCriteria =>
    'matrixCheck' in c,
  isCharCriteria = (c: Criteria): c is CharCriteria => 'charCheck' in c;

export const matchCriteria =
  <R>(
    matrix: Unary<RelCheck, R>,
    char: Unary<CharCheck, R>,
    fixed: Unary<[Pair<string>[], string[][]], R>,
  ): Unary<Criteria, R> =>
  c =>
    isMatrixCriteria(c)
      ? matrix(c.matrixCheck)
      : isCharCriteria(c)
      ? char(c.charCheck)
      : fixed([c.pairs, c.chains]);
