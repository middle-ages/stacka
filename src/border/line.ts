import { array as AR, function as FN } from 'fp-ts';
import { Tuple4 } from 'util/tuple';
import { dirs, mapDirs, snugDirs } from '../dir';
import { corners } from './corner';
import { cornerDirsOf } from './dir';
import { pickDir, pickDirs, stackBorderParts } from './transform';
import { Border, monoBorder } from './types';
import { partMapFor } from './sets';

export const partMap = partMapFor('thin');

export const line: Border = monoBorder(partMap);

export const noLines: Border = FN.pipe([...corners], pickDirs(line));

export const lines: Border = FN.pipe([...dirs], pickDirs(line));

export const dirBorders: Tuple4<Border> = FN.pipe(line, pickDir, mapDirs),
  [lineTop, lineRight, lineBottom, lineLeft] = dirBorders;

export const openBorders: Tuple4<Border> = mapDirs(dir =>
    FN.pipe([dir, ...snugDirs(dir), ...cornerDirsOf(dir)], pickDirs(line)),
  ),
  [openBottom, openLeft, openTop, openRight] = openBorders;

export const onlyBorders: Tuple4<Border> = mapDirs(
    FN.flow(AR.of, pickDirs(line)),
  ),
  [onlyTop, onlyRight, onlyBottom, onlyLeft] = onlyBorders;

export const [vBorder, hBorder] = [
  stackBorderParts(lineLeft, lineRight),
  stackBorderParts(lineTop, lineBottom),
];

export const [hPara, vPara] = [
  stackBorderParts(onlyTop, onlyBottom),
  stackBorderParts(onlyLeft, onlyRight),
];
