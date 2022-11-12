import { SetterOf, SetValue } from './types';

export const setProp: SetValue = k => v => o => ({ ...o, [k]: v });

export const setPropOf =
  <T extends {}>() =>
  <K extends keyof T>(k: K): SetterOf<T, K> =>
  v =>
  o => ({ ...o, [k]: v });
