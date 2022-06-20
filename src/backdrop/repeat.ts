import { Size } from 'src/geometry';
import { Grid } from 'src/grid';
import { repeatSubgrid } from 'util/array';
import { Endo, Unary } from 'util/function';

export const repeat: Unary<Size, Endo<Grid>> = ({ width, height }) =>
  repeatSubgrid([width, height]);
