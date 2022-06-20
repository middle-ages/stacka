import { Align, HAlign, VAlign } from 'src/align';
import { Backdrop, backdrop } from 'src/backdrop';
import { BlendMode, color, Color } from 'src/color';
import { Pos, rect, Rect, Size } from 'src/geometry';
import { Grid } from 'src/grid';

export const defaultHAlign: HAlign = 'left',
  defaultVAlign: VAlign = 'bottom',
  defaultAlign: Align = { horizontal: defaultHAlign, vertical: defaultVAlign };

export interface Block {
  /** Block content */
  grid: Grid;
  /** Block position and size */
  rect: Rect;
  /** Block align of internal content */
  align: Align;
  /** Blend mode for blending in child content */
  blend: BlendMode;
  /** Block background grid */
  backdrop: Backdrop;
}

export const empty: Block = {
  grid: [],
  rect: rect.empty,
  align: defaultAlign,
  blend: color.defaultBlendMode,
  backdrop: backdrop.empty,
};

/** Block constructor arguments  */
export interface BlockArgs extends Partial<Block & Rect & Pos & Size> {
  /** join strings and parse grid from single row */
  words?: string[];
  /** parse grid from single row*/
  row?: string;
  /**  parse grid from multiple rows*/
  rows?: string[];
  /** break newlines and parse into multiple rows*/
  text?: string;
  /**  if `gridFg` is set, backdrop is set to “█” in given fg color */
  gridFg?: Color;
  /**  if `gridBg` is set, set backdrop to bg colored space char */
  gridBg?: Color;
  /** optional `backdropImage` is used as the background image behind content */
  backdropImage?: Grid;
  /** Content horizontal alignment */
  horizontal?: HAlign;
  /** Content vertical alignment */
  vertical?: VAlign;
}
