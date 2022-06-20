/**
 * A simple pure unary function as an example implementation under test
 */

import { apply0, Unary } from 'util/function';

export const toBinary: Unary<number, string> = n => {
  const f = () => n.toString(2);
  return apply0(f);
};
