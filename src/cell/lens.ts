import { function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import * as color from 'src/color';
import { Color, ComposedColorLenses } from 'src/color';
import { ModLens, modLens } from 'util/lens';
import { Pair } from 'util/tuple';
import * as ST from 'src/style';
import { Deco, DecoList, Style } from 'src/style';
import { CellType } from './type';
import {
  Cell,
  getBg,
  getCellType,
  getDeco,
  getFg,
  getRune,
  getStyle,
  setBg,
  setCellType,
  setDeco,
  setFg,
  setRune,
  setStyle,
} from './types';

export const style: ModLens<Cell, Style> = modLens({
    get: getStyle,
    set: setStyle,
  }),
  rune: ModLens<Cell, string> = modLens({ get: getRune, set: setRune }),
  cellType: ModLens<Cell, CellType> = modLens({
    get: getCellType,
    set: setCellType,
  }),
  [fgColor, bgColor]: Pair<ModLens<Cell, Color>> = [
    modLens({ get: getFg, set: setFg }),
    modLens({ get: getBg, set: setBg }),
  ],
  deco: ModLens<Cell, Deco> = modLens({ get: getDeco, set: setDeco }),
  decoList: ModLens<Cell, DecoList> = FN.pipe(
    style,
    LE.composeLens(ST.decoList),
    modLens,
  );

export type LayerLens = ComposedColorLenses<Cell> &
  Record<'color', ModLens<Cell, Color>>;

export const [fgLens, bgLens]: Pair<LayerLens> = [
  { ...color.composeColorLens(fgColor), color: fgColor },
  { ...color.composeColorLens(bgColor), color: bgColor },
];

export const add = ST.deco.decoRecord(FN.flow(ST.deco.add, deco.mod));
