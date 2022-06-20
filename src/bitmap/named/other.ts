export const tee = {
  top: '┴',
  right: '├',
  bottom: '┬',
  left: '┤',
  thick: {
    top: '┻',
    right: '┣',
    bottom: '┳',
    left: '┫',
  },
  double: {
    top: '╩',
    right: '╠',
    bottom: '╦',
    left: '╣',
  },
} as const;

export const space = ' ' as const,
  solid = '█' as const,
  cross = '┼' as const;

export type Solid = typeof solid;
export type Space = typeof space;
