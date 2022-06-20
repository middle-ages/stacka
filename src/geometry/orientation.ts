import { Pair } from 'util/tuple';

export type Orientation = 'horizontal' | 'vertical';
export type Oriented<T> = Record<Orientation, T>;

export const orientations: Pair<Orientation> = ['horizontal', 'vertical'];
