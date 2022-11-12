import { align as AL, VAlign } from 'src/align';
import * as CE from 'src/cell';
import { Binary, Unary } from 'util/function';
import { Tuple3 } from 'util/tuple';
import { vGaps } from './measure';
import * as TY from './types';
import { Grid } from './types';

/**
 * Given a size and alignment, vertically resize and re-align the grid so
 * that it is sized and aligned as requested, regardless of the original
 * height or vertical alignment. Returns the new vertically aligned grid tupled
 * with 3 numbers: the read+write top offsets of the 1st content cell, and the
 * content height.
 *
 * Content height is grid height minus top and bottom gaps.
 *
 */
export const vAlignGrid: Binary<
  VAlign,
  number,
  Unary<Grid, [Grid, Tuple3<number>]>
> = (align, writeH) => grid => {
  if (TY.isEmpty(grid)) return [grid, [0, 0, 0]];

  /*          Example #1: expand height of 1 body row
            align=top, read=2x6 grid, write=2x7 grid
  ──────────────────────────────────────────────────────────────
             readGrid                       writeGrid            
        ╭──╴0─┲━━┳━━┓╶──╮              ╭──╴0─┲━━┳━━┓╶───╮        
        │     ┃  ┃  ┃   │              │     ┃ a┃ b┃ writeBodyH  
      readH 1╶╊━━╋━━┫ readTop          │   1╶╊━━╋━━┫╶───╯─╮      
        │     ┃  ┃  ┃   │              │     ┃  ┃  ┃      │      
    ╭───│──╴2╶╊━━╋━━┫╶──╯              │   2╶╊━━╋━━┫      │      
  readBodyH   ┃ a┃ b┃                  │     ┃  ┃  ┃      │      
    ╰───│──╴3╶╊━━╋━━┫╶──╮              │   3╶╊━━╋━━┫      │
        │     ┃  ┃  ┃   │           writeH   ┃  ┃  ┃      │     
        │   4╶╊━━╋━━┫ readBottom       │   4╶╊━━╋━━┫      │     
        │     ┃  ┃  ┃   │              │     ┃  ┃  ┃      │     
        │   5╶╊━━╋━━┫   │              │   5╶╊━━╋━━┫ writeBottom
        │     ┃  ┃  ┃   │              │     ┃  ┃  ┃      │ 
        ╰──╴6─┺━━┻━━┛╶──╯              │   6╶╊━━╋━━┫      │
                                       │     ┃  ┃  ┃      │
                                       ╰──╴7─┺━━┻━━┛╶─────╯     

              Example #2: crop height of 3 body rows
            align=top, read=2x6 grid, write=2x2 grid
  ─────────────────────────────────────────────────────────────
             readGrid                       writeGrid            
        ╭──╴0─┲━━┳━━┓╶──╮              ╭──╴0─┲━━┳━━┓╶───╮        
        │     ┃  ┃  ┃ readTop          │     ┃ a┃ b┃ writeBodyH  
    ╭───│──╴1╶╊━━╋━━┫╶──╯           writeH 1╶╊━━╋━━┫    │      
    │   │     ┃ a┃ b┃                  │     ┃ c┃ d┃    │
 readBodyH  2╶╊━━╋━━┫                  ╰──╴2─┺━━┻━━┛╶───╯
    │   │     ┃ c┃ d┃                            
    ╰───│──╴3╶╊━━╋━━┫╶──╮                   
        │     ┃ e┃ f┃   │                       
        │   4╶╊━━╋━━┫ readBottom                
        │     ┃  ┃  ┃   │                       
        │   5╶╊━━╋━━┫   │                       
        │     ┃  ┃  ┃   │                   
        ╰──╴6─┺━━┻━━┛╶──╯                   
  ───────────────────────────────────────────────────────────── */

  const [read, { width }] = [grid.buffer, grid],
    rowWords = width * CE.cellWords,
    [readTop, readBodyH] = vGaps(grid, TY.size(grid)),
    writeGaps = writeH - readBodyH,
    writeBodyH = readBodyH + (writeGaps >= 0 ? 0 : writeGaps),
    readIdx =
      readTop * rowWords +
      (writeGaps >= 0
        ? 0
        : AL.vertically(align, readBodyH - writeBodyH)[0] * rowWords),
    writeIdx = Math.max(0, AL.vertically(align, writeGaps)[0] * rowWords),
    res = TY.sized({ width, height: writeH });

  CE.copyNRows(writeBodyH, width)(read, res.buffer, readIdx, writeIdx);

  return [res, [readIdx, writeIdx, writeBodyH]];
};
