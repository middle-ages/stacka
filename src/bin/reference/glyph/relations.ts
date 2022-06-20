import { array as AR, function as FN } from 'fp-ts';
import { unlines } from 'fp-ts-std/String';
import { glyph, RelationName, relationReport, termWidth } from 'src/stacka';

/**
 * With no arguments, shows all relations found between the line drawing
 * characters.
 *
 * If given a command separated list of relation names, they will be the only
 * relations shown.
 *
 * `-h` will show the names of all relations.
 *
 * Example:
 *
 * ```txt
 * relations.ts invert,weight
 * ```
 */
const arg = process.argv[2];

const names = glyph.allRelationNames;

if (arg === '-h') {
  console.log('All box drawing character relations:');
  console.log(names);
  process.exit();
}

const relations =
    arg !== undefined
      ? (arg.split(',') as RelationName[])
      : glyph.allRelationNames,
  makeReport = relationReport(termWidth()),
  report = (idx: number, name: RelationName): string => makeReport([idx, name]),
  reports = FN.pipe(relations, AR.mapWithIndex(report), unlines);

console.log(reports);
