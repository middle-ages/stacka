import { typedKeys } from 'util/object';

export const resolution = 5;

export const columnsPerCell =
  1 + // left border
  resolution; // display matrix columns

/**
 * Bitmap syntax:
 *
 * Parsed as as fixed width strings.
 *
 * The header syntax is a number (the glyph number),
 * then the glyph character.
 */

export const basicBitmaps = {
  thin: `
| 1 ┌ | 2 ┬ | 3 ┐ | 4 │ | 5 ├ | 6 ┼ | 7 ┤ | 8 ─ │ 9 └ |10 ┴ |11 ┘ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │  #  │  #  │  #  │  #  │     │  #  │  #  │  #  │
│     │     │     │  #  │  #  │  #  │  #  │     │  #  │  #  │  #  │
│  ###│#####│###  │  #  │  ###│#####│###  │#####│  ###│#####│###  │
│  #  │  #  │  #  │  #  │  #  │  #  │  #  │     │     │     │     │
│  #  │  #  │  #  │  #  │  #  │  #  │  #  │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  thick: `
| 1 ┏ | 2 ┳ | 3 ┓ | 4 ┃ | 5 ┣ | 6 ╋ | 7 ┫ | 8 ━ | 9 ┗ │10 ┻ |11 ┛ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │ ### │ ### │ ### │ ### │     │ ### │ ### │ ### │
│ ####│#####│#### │ ### │ ####│#####│#### │#####│ ####│#####│#### │
│ ####│#####│#### │ ### │ ####│#####│#### │#####│ ####│#####│#### │
│ ####│ ### │#### │ ### │ ####│#####│#### │#####│ ####│#####│#### │
│ ### │ ### │ ### │ ### │ ### │ ### │ ### │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  hThick: `
| 1 ┍ | 2 ┯ | 3 ┑ | 4 │ | 5 ┝ | 6 ┿ | 7 ┥ | 8 ━ | 9 ┕ |10 ┷ |11 ┙ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │  #  │  #  │  #  │  #  │     │  #  │  #  │  #  │
│  ###│#####│###  │  #  │  ###│#####│###  │#####│  ###│#####│###  │
│  ###│#####│###  │  #  │  ###│#####│###  │#####│  ###│#####│###  │
│  ###│#####│###  │  #  │  ###│#####│###  │#####│  ###│#####│###  │
│  #  │  #  │  #  │  #  │  #  │  #  │  #  │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  vThick: `
| 1 ┎ | 2 ┰ | 3 ┒ | 4 ┃ | 5 ┠ | 6 ╂ | 7 ┨ | 8 ─ | 9 ┖ |10 ┸ |11 ┚ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │ ### │ ### │ ### │ ### │     │ ### │ ### │ ### │
│     │     │     │ ### │ ### │ ### │ ### │     │ ### │ ### │ ### │
│ ####│#####│#### │ ### │ ####│#####│#### │#####│ ####│#####│#### │
│ ### │ ### │ ### │ ### │ ### │ ### │ ### │     │     │     │     │
│ ### │ ### │ ### │ ### │ ### │ ### │ ### │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  double: `
| 1 ╔ | 2 ╦ | 3 ╗ | 4 ║ | 5 ╠ | 6 ╬ | 7 ╣ | 8 ═ | 9 ╚ |10 ╩ |11 ╝ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │ # # │ # # │ # # │ # # │     │ # # │ # # │ # # │
│ ####│#####│#### │ # # │ # ##│## ##│## # │#####│ # ##│## ##│## # │
│ #   │     │   # │ # # │ #   │     │   # │     │ #   │     │   # │
│ # ##│## ##│## # │ # # │ # ##│## ##│## # │#####│ ####│#####│#### │
│ # # │ # # │ # # │ # # │ # # │ # # │ # # │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  hDouble: `
| 1 ╒ | 2 ╤ | 3 ╕ | 4 │ | 5 ╞ | 6 ╪ | 7 ╡ | 8 ═ | 9 ╘ |10 ╧ |11 ╛ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │  #  │  #  │  #  │  #  │     │  #  │  #  │  #  │
│  ###│#####│###  │  #  │  ###│#####│###  │#####│  ###│#####│###  │
│  #  │     │  #  │  #  │  #  │  #  │  #  │     │  #  │     │  #  │
│  ###│#####│###  │  #  │  ###│#####│###  │#####│  ###│#####│###  │
│  #  │  #  │  #  │  #  │  #  │  #  │  #  │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  vDouble: `
| 1 ╓ | 2 ╥ | 3 ╖ | 4 ║ | 5 ╟ | 6 ╫ | 7 ╢ | 8 ─ | 9 ╙ |10 ╨ |11 ╜ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │ # # │ # # │ # # │ # # │     │ # # │ # # │ # # │
│     │     │     │ # # │ # # │ # # │ # # │     │ # # │ # # │ # # │
│ ####│#####│#### │ # # │ # ##│#####│## # │#####│ ####│#####│#### │
│ # # │ # # │ # # │ # # │ # # │ # # │ # # │     │     │     │     │
│ # # │ # # │ # # │ # # │ # # │ # # │ # # │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
  roundedDashed: `
| 1 ╭ | 2 ┬ | 3 ╮ | 4 ┆ | 5 ├ | 6 ┼ | 7 ┤ | 8 ┄ │ 9 ╰ |10 ┴ |11 ╯ |
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │  #  │  #  │  #  │  #  │     │  #  │  #  │  #  │
│     │     │     │     │  #  │  #  │  #  │     │  #  │  #  │  #  │
│   ##│#####│##   │  #  │  ###│#####│###  │# # #│   ##│#####│##   │
│  #  │  #  │  #  │     │  #  │  #  │  #  │     │     │     │     │
│  #  │  #  │  #  │  #  │  #  │  #  │  #  │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘`,
};

export type BorderSet = keyof typeof basicBitmaps;

export const borderSets: BorderSet[] = typedKeys(basicBitmaps);