import ansis, { Ansis } from 'ansis';
import { function as FN, option as OP } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Color, color } from 'src/color';
import { Endo, Unary } from 'util/function';
import { pluck } from 'util/object';
import { pairFlow } from 'util/tuple';
import { Decoration, Style } from './types';

const ifDeco = <D extends Decoration>(deco: D, flag: boolean) =>
  flag ? pluck(deco) : FN.identity;

const applyDecos: Unary<Style, Endo<Ansis>> = ({
  bold,
  italic,
  underline,
  inverse,
  strikethrough,
}) =>
  FN.flow(
    ifDeco('bold', bold),
    ifDeco('italic', italic),
    ifDeco('underline', underline),
    ifDeco('inverse', inverse),
    ifDeco('strikethrough', strikethrough),
  );

const applyColor =
  (meth: 'rgb' | 'bgRgb'): Unary<Color, Endo<Ansis>> =>
  clr =>
  ansi =>
    FN.pipe(clr, color.getRgb, FN.tupled(ansi[meth]));

const applyColors: Unary<Style, Endo<Ansis>> = ({ fg, bg }) => {
  const ansisFg = FN.pipe(fg, FN.pipe('rgb', applyColor, OP.map)),
    ansisBg = FN.pipe(bg, FN.pipe('bgRgb', applyColor, OP.map));

  return FN.pipe(
    [ansisFg, ansisBg],
    mapBoth(OP.getOrElse<Endo<Ansis>>(() => FN.identity)),
    pairFlow,
  );
};

export const paint: Unary<Style, Endo<string>> = style =>
  FN.pipe(ansis, applyColors(style), applyDecos(style));
