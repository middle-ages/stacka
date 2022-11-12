import { Unary } from 'util/function';
import { Pair } from 'util/tuple';

export type Copy = (
  read: Uint32Array,
  write: Uint32Array,
  readI: number,
  writeI: number,
) => Pair<number>;

export const copyCell: Copy = (read, write, readI, writeI): Pair<number> => {
  write[writeI + 0] = read[readI + 0];
  write[writeI + 1] = read[readI + 1];
  write[writeI + 2] = read[readI + 2];
  write[writeI + 3] = read[readI + 3];

  return [readI + 4, writeI + 4];
};

/** Copy a cell N times horizontally */
export const copyCells =
  (n: number): Copy =>
  (read, write, givenReadI, givenWriteI) => {
    const [readI, writeI] = [givenReadI, givenWriteI];

    const [read0, read1, read2, read3] = [
      read[readI + 0],
      read[readI + 1],
      read[readI + 2],
      read[readI + 3],
    ];

    for (let m = 0; m < n; m++) {
      const offset = m * 4;

      write[writeI + 0 + offset] = read0;
      write[writeI + 1 + offset] = read1;
      write[writeI + 2 + offset] = read2;
      write[writeI + 3 + offset] = read3;
    }

    return [readI + 4, writeI + 4 * n];
  };

/** Copy a row N times */
export const repeatRow =
  (n: number, cellsPerRow: number): Copy =>
  (read, write, givenReadI, givenWriteI) => {
    const wordsPerRow = cellsPerRow * 4;

    let [readI, writeI] = [givenReadI, givenWriteI];

    for (let x = 0; x < cellsPerRow; x++) {
      for (let m = 0; m < n; m++) {
        const offset = m * wordsPerRow;

        write[writeI + 0 + offset] = read[readI + 0];
        write[writeI + 1 + offset] = read[readI + 1];
        write[writeI + 2 + offset] = read[readI + 2];
        write[writeI + 3 + offset] = read[readI + 3];
      }
      writeI += 4;
      readI += 4;
    }
    return [readI, writeI + (n - 1) * wordsPerRow];
  };

/** Copy N rows from one grid to another */
export const copyNRows =
  (n: number, cellsPerRow: number): Copy =>
  (read, write, givenReadIdx, givenWriteIdx) => {
    const advance = cellsPerRow * n;

    let [readI, writeI] = [givenReadIdx, givenWriteIdx];

    for (let idx = 0; idx < advance; idx++) {
      write[writeI + 0] = read[readI + 0];
      write[writeI + 1] = read[readI + 1];
      write[writeI + 2] = read[readI + 2];
      write[writeI + 3] = read[readI + 3];

      readI += 4;
      writeI += 4;
    }

    return [readI, writeI];
  };

/** Copy a row from one grid to another */
export const copyRow: Unary<number, Copy> = cellsPerRow =>
  copyNRows(1, cellsPerRow);

export const copyCellPair: Copy = (
  read,
  write,
  givenReadI,
  givenWriteI,
): Pair<number> => {
  const [readI, writeI] = copyCell(read, write, givenReadI, givenWriteI);
  return copyCell(read, write, readI, writeI);
};

export const copyStyle: Copy = (read, write, readI, writeI) => {
  write[writeI + 0] = read[readI + 0];
  write[writeI + 1] = read[readI + 1];

  return [readI + 2, writeI + 2];
};

export const copyRune: Copy = (read, write, readI, writeI) => {
  write[writeI + 2] = read[readI + 2];

  return [readI + 1, writeI + 1];
};

export const copyInit: Copy = (read, write, readI, writeI) => {
  write[writeI + 0] = read[readI + 0];
  write[writeI + 1] = read[readI + 1];
  write[writeI + 2] = read[readI + 2];

  return [readI + 3, writeI + 3];
};
