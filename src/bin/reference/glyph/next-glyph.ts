import { array as AR, function as FN, option as OP } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { unlines } from 'fp-ts-std/String';
import { bitmap, color as co, Glyph, glyph, GlyphRelation } from 'src/stacka';
import * as TR from 'util/tree';

/**
 * Show the next-glyph relation tree for a given glyph
 *
 * With no arguments, shows the relation tree for the space character, of depth 2.
 *
 * If given a line drawing character, will draw the tree for the given glyph.
 *
 * If the character is followed by a number, this will be the tree depth.
 *
 * `-h` will show the list of all line drawing characters.
 *
 * `space` character can be given using the string `space`.
 *
 * Example:
 *
 * ```txt
 * next-glyph.ts ┬ 2
 * ```
 */

const [arg0, arg1] = [process.argv[2], process.argv[3]];

const color = {
  bg: { char: 'light' },
  fg: { char: 'darkBlue', branch: 'darkGrey' },
} as const;

const style = {
  char: co.of([color.fg.char, color.bg.char]),
  branch: co.fg(color.fg.branch),
} as const;

if (arg0 === '-h') {
  const all = FN.pipe(
    bitmap.chars,
    AR.map(style.char),
    AR.chunksOf(20),
    FN.pipe('', join, AR.map),
    unlines,
  );
  console.log(all);
  process.exit();
}

const [fst, maxDepth] = [arg0 ?? ' ', parseInt(arg1 ?? '2')];
const start = fst === 'space' ? ' ' : fst;

const { horizontal, vertical } = bitmap.line.dash.dot,
  tee = bitmap.tee;

const deco = {
  hBranch: style.branch(horizontal),
  vBranch: style.branch(vertical),
  elbow: style.branch(bitmap.elbows.round.bottomLeft),
  teeRight: style.branch(tee.right),
  teeDown: style.branch(tee.bottom),
};

type Node = Glyph | GlyphRelation;

interface Deep {
  depth: number;
  node: Node;
}

const deep =
  (depth: number) =>
  (node: Node): Deep => ({ depth, node });

const isGlyph = (node: Node): node is Glyph =>
  '_tag' in node && node._tag === 'glyph';

const config: TR.DrawConfig = {
  ...TR.defaultConfig,
  edge: {
    ...TR.defaultConfig.edge,
    horizontal: deco.hBranch,
    vertical: deco.vBranch,
    init: deco.teeRight,
    last: deco.elbow,
  },
  bullet: {
    leaf: deco.hBranch,
    node: deco.teeDown + deco.hBranch,
  },
};

const getGlyphNodes = (g: Glyph): GlyphRelation[] =>
  FN.pipe(
    g.char,
    glyph.glyphRelations,
    AR.filter(rel => rel.next.length > 0),
  );

const getNodes = (node: Node): Node[] =>
  isGlyph(node)
    ? FN.pipe(
        node,
        getGlyphNodes,
        AR.chain(g => g.next),
      )
    : node.next;

const nodeToString = (node: Node): string =>
  (isGlyph(node) ? style.char(node.char) : node.relation) + '\n';

const deepUnfolder =
  (maxDepth: number) =>
  ({ depth, node }: Deep): Deep[] =>
    depth >= maxDepth
      ? []
      : FN.pipe(node, getNodes, FN.pipe(depth + 1, deep, AR.map));

const tree = (start: string): TR.Tree<string> => {
  const build = FN.pipe(maxDepth, deepUnfolder, TR.unfoldTree);

  return FN.pipe(
    start,
    glyph.glyphByChar,
    FN.pipe(0, deep, OP.map),
    OP.map(
      FN.flow(
        build,
        TR.mapTree(t => t.node),
      ),
    ),
    FN.pipe(nodeToString, TR.mapTree, OP.map),
    FN.pipe('no glyph', TR.leaf, FN.constant, OP.getOrElse),
  );
};

const drawn = FN.pipe(start, tree, TR.drawFromConfig(config));

console.log(drawn);
