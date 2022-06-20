import { option as OP } from 'fp-ts';
import { Endo } from 'util/function';
import { MaybeRow, Row } from 'util/string';

export type RowList = Row[];

export type RowMapper = Endo<RowList>;

export const strNone: MaybeRow = OP.none;
