import { function as FN, option as OP, predicate as PRE } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import * as DA from './data';
import * as RO from './role';

type MatrixByChar = Map<string, DA.Matrix>;
type CharByMatrix = Map<string, string>;

type RolesByChar = Map<string, RO.BitmapRole[]>;
type CharsByRole = Map<RO.BitmapRole, string[]>;

export interface Registry {
  roles: RO.BitmapRole[];
  chars: string[];

  matrixByChar: MatrixByChar;
  charByMatrix: CharByMatrix;

  rolesByChar: RolesByChar;
  charsByRole: CharsByRole;
}

export const makeRegistry: FN.Lazy<Registry> = () => {
  const matrixByChar = new Map<string, DA.Matrix>();
  const charByMatrix = new Map<string, string>();

  const rolesByChar: RolesByChar = new Map<string, RO.BitmapRole[]>();
  const charsByRole: CharsByRole = new Map<RO.BitmapRole, string[]>();

  const parsed = RO.parseRoles();
  for (const [role, matrices] of parsed) {
    for (const [char, matrix] of matrices) {
      const key = DA.toBin(matrix);
      matrixByChar.set(char, matrix);
      charByMatrix.set(key, char);

      rolesByChar.set(char, [...(rolesByChar.get(char) ?? []), role]);
      charsByRole.set(role, [...(charsByRole.get(role) ?? []), char]);
    }
  }

  const chars: string[] = Array.from(matrixByChar.keys());

  return {
    chars,
    roles: RO.bitmapRoles,

    matrixByChar,
    charByMatrix,

    rolesByChar,
    charsByRole,
  };
};

const reg: Registry = makeRegistry();

const hasChar: PRE.Predicate<string> = c => reg.matrixByChar.has(c),
  hasCharPair: PRE.Predicate<Pair<string>> = ([fst, snd]) =>
    reg.matrixByChar.has(fst) && reg.matrixByChar.has(snd),
  hasMatrix: PRE.Predicate<DA.Matrix> = m => reg.charByMatrix.has(DA.toBin(m)),
  matrixByChar: Unary<string, DA.Matrix> = c =>
    reg.matrixByChar.get(c) ?? DA.emptyMatrix,
  charByMatrix: Unary<DA.Matrix, OP.Option<string>> = ma =>
    FN.pipe(ma, DA.toBin, k => reg.charByMatrix.get(k), OP.fromNullable),
  rolesByChar: Unary<string, RO.BitmapRole[]> = c =>
    reg.rolesByChar.get(c) ?? [],
  charsByRole: Unary<RO.BitmapRole, string[]> = r =>
    reg.charsByRole.get(r) ?? [],
  { chars, roles } = reg;

const collectPairs: Unary<Pair<string>[], string[]> = pairs => {
  const charSet = new Set<string>();
  for (const [fst, snd] of pairs) {
    charSet.add(fst);
    charSet.add(snd);
  }
  return Array.from(charSet.keys());
};

const pairMatrixToChar: Unary<Pair<DA.Matrix>, Pair<string>> = mapBoth(
  FN.flow(charByMatrix, FN.pipe(' ', FN.constant, OP.getOrElse)),
);

const pairCharToMatrix: Unary<Pair<string>, Pair<DA.Matrix>> = mapBoth(
  matrixByChar,
);

export const registry = {
  chars,
  roles,
  reg,

  hasChar,
  hasCharPair,
  hasMatrix,

  matrixByChar,
  charByMatrix,

  rolesByChar,
  charsByRole,

  collectPairs,
  pairMatrixToChar,
  pairCharToMatrix,

  solid: '█',
} as const;
