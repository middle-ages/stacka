import { Align, HAlign, VAlign } from 'src/align';
import { Backdrop } from 'src/backdrop';
import * as BD from 'src/backdrop';
import { defaultBlendMode, BlendMode, Color } from 'src/color';
import { Pos, rect, Rect, Size } from 'src/geometry';
import { Grid, empty as emptyGrid } from 'src/grid';

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
  grid: emptyGrid(),
  rect: rect.empty,
  align: defaultAlign,
  blend: defaultBlendMode,
  backdrop: BD.empty,
};

/** Block constructor arguments  */
export interface BlockArgs extends Partial<Block & Rect & Pos & Size> {
  /** Join strings and parse grid from single row */
  words?: string[];
  /** Parse grid from single row*/
  row?: string;
  /**  Parse grid from multiple rows*/
  rows?: string[];
  /** Break newlines and parse into multiple rows*/
  text?: string;
  /**  If `gridFg` is set, backdrop is set to “█” in given fg color */
  gridFg?: Color;
  /**  When set, every cell, empty or not, has bg set to this color */
  gridBg?: Color;
  /** Optional `backdropImage` is used as the background image behind content */
  backdropImage?: Grid;
  /** Content horizontal alignment */
  horizontal?: HAlign;
  /** Content vertical alignment */
  vertical?: VAlign;
}
