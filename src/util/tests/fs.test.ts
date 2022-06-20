import { function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { assert, suite, test } from 'vitest';
import { head } from '../array';
import {
  Filters,
  getFileFilters,
  loadFileList,
  loadDirs,
  loadPathTree,
} from '../fs';

const dataDir = 'test-data/util/fs';

const filters: Filters = [[], [/.*/], []];

suite('fs', () => {
  test('loadPath', () => {
    const iut = FN.pipe(
      dataDir,
      fork([loadDirs(head(filters)), loadFileList(getFileFilters(filters))]),
    );
    assert.deepEqual(iut, [[`${dataDir}/b`], [`${dataDir}/a`]]);
  });

  test('loadPathTree', () => {
    const iut = FN.pipe(dataDir, loadPathTree(filters));
    assert.deepEqual(iut, {
      value: [`${dataDir}`, [`${dataDir}/a`]],
      forest: [
        {
          value: [`${dataDir}/b`, [`${dataDir}/b/c`]],
          forest: [],
        },
      ],
    });
  });
});
