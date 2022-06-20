import assert from 'assert';
import {
  reader as RE,
  array as AR,
  function as FN,
  option as OP,
  predicate as PRE,
  string as STR,
  tree as TR,
  tuple as TU,
} from 'fp-ts';
import { invert } from 'fp-ts-std/Boolean';
import { fork } from 'fp-ts-std/Function';
import { join } from 'fp-ts-std/ReadonlyArray';
import { lines } from 'fp-ts-std/String';
import * as FS from 'fs';
import { L } from 'ts-toolbelt';
import { head, init, last } from './array';
import { Binary, BinaryC, Endo, Unary } from './function';
import { toString } from './object';
import { matchAny } from './string';
import { tupleWith } from './tuple';
import { removeRo } from './array';

/** A function that can list all dir names at a path */
export type DirLoader = Unary<string, string[]>;

/** A function that can list all files names at a path */
export type FileListLoader = Unary<string, string[]>;

/** A function that loads file contents by lines */
export type FileLineLoader = Unary<string, string[]>;

export interface FileLoader {
  content: FileLineLoader;
  list: FileListLoader;
}

/** Everything you need to load directories and files from a filesystem */
export interface FsLoader {
  dir: DirLoader;
  file: FileLoader;
}

/** `FS.FileContentLoader ⇒ R` */
export type LineReader<R> = RE.Reader<FileLineLoader, R>;

/** `FS.FileLoader ⇒ R` */
export type FileReader<R> = RE.Reader<FileLoader, R>;

/** `FS.FsLoader ⇒ R` */
export type FsReader<R> = RE.Reader<FsLoader, R>;

export type FileFilters = readonly [
  includeFiles: RegExp[],
  excludeFiles: RegExp[],
];

export type DirFilters = RegExp[];

/** Tuple of 3 RegExp arrays: Ignore dirs, Include files, Exclude files */
export type Filters = L.Concat<[DirFilters], FileFilters>;

type PathEntry = [path: string, isDir: boolean];

/** Path depth */
export const pathDepth: Unary<string, number> = s =>
  (s.match(/\//g) || []).length;

/**
 * Compare paths by:
 *   1. Directory depth, ascending from top
 *   2. Two paths of same depth are sorted as strings
 */
export const comparePaths = (a: string, b: string): number =>
  a === b
    ? 0
    : a === ''
    ? 1
    : b === ''
    ? -1
    : pathDepth(a) === pathDepth(b)
    ? a.localeCompare(b)
    : pathDepth(a) < pathDepth(b)
    ? 1
    : -1;

/** Relative path parent or `none` if path is top */
export const parentPath: Unary<string, OP.Option<string>> = path => {
  const parent = path.split('/');
  return parent.length > 0
    ? FN.pipe(parent, init, join('/'), OP.some)
    : OP.none;
};

/** Path filename or final directory name */
export const finalPart: Endo<string> = path => {
  assert(path.length);
  return FN.pipe(path.split('/'), last);
};

const extRe = '\\.[^\\.]*$';

/** Filename without extension */
export const baseName: Endo<string> = path => {
  assert(path.length);
  return FN.pipe(path, finalPart, STR.replace(new RegExp(extRe), ''));
};

export const extName: Endo<string> = path =>
  FN.pipe(
    path,
    finalPart,
    STR.replace(new RegExp(`^.*(${extRe})`), '$1'),
  ).substring(1);

const shouldInclude: Binary<RegExp[], RegExp[], PRE.Predicate<string>> =
  (includeRes, excludeRes) => s =>
    matchAny(includeRes)(s) && !matchAny(excludeRes)(s);

const shouldNotIgnoreDir: Unary<RegExp[], PRE.Predicate<string>> = ignore =>
  FN.flow(finalPart, matchAny(ignore), invert);

export const getFileFilters: Unary<Filters, FileFilters> = ([
  ,
  include,
  exclude,
]) => [include, exclude];

const readPathEntries: Unary<string, PathEntry[]> = cwd =>
  FS.readdirSync(cwd).map(name => {
    const path = cwd + '/' + name;
    const isDir = FS.statSync(path).isDirectory();
    return [path, isDir] as [string, boolean];
  });

const filterFiles: BinaryC<FileFilters, PathEntry[], string[]> = ([
  include,
  exclude,
]) =>
  FN.flow(
    AR.filter(FN.flow(TU.snd, invert)),
    AR.map(TU.fst),
    AR.filter(shouldInclude(include, exclude)),
  );

const filterDirs: BinaryC<DirFilters, PathEntry[], string[]> = ignore =>
  FN.flow(
    AR.filter(TU.snd),
    AR.map(TU.fst),
    AR.filter(shouldNotIgnoreDir(ignore)),
  );

export type PathTree = TR.Tree<[string, string[]]>;

export const loadFileList: Unary<FileFilters, FileListLoader> = filters =>
  FN.flow(readPathEntries, FN.flow(filterFiles(filters)));

export const loadDirs: Unary<DirFilters, DirLoader> = filters =>
  FN.flow(readPathEntries, filterDirs(filters));

export const loadPathTree: BinaryC<Filters, string, PathTree> =
  filters => cwd => {
    const [dirFilters, ...fileFilters] = filters;

    const dirs = FN.flow(
      loadDirs(dirFilters),
      FN.pipe(filters, loadPathTree, AR.map),
    );

    const files = FN.flow(loadFileList(fileFilters), tupleWith(cwd));

    return FN.pipe(cwd, fork([files, dirs]), FN.tupled(TR.make));
  };

export const loadFile: Unary<string, string[]> = FN.flow(
  FS.readFileSync,
  toString,
  lines,
  removeRo,
);

export const fileLoader: Unary<FileFilters, FileLoader> = filters => ({
  content: loadFile,
  list: loadFileList(filters),
});

export const fsLoader: Unary<Filters, FsLoader> = filters => ({
  dir: FN.pipe(filters, head, loadDirs),
  file: FN.pipe(filters, getFileFilters, fileLoader),
});
