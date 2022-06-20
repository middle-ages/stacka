import { Directed, Oriented } from 'src/geometry';

export type Orient = Oriented<string>;
export type Direct = Directed<string>;

export const isDirect = (c: Orient | Direct): c is Direct => 'top' in c;

export type Dash = 'none' | 'dot' | 'line' | 'wide';

export type BasicCornerLine = 'line' | 'thick' | 'double';
