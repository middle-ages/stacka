import {
  array as AR,
  function as FN,
  reader as RE,
  string as STR,
} from 'fp-ts';
import { sum } from 'fp-ts-std/Array';
import { fork } from 'fp-ts-std/Function';
import { prepend, unlines } from 'fp-ts-std/String';
import { mapBoth } from 'fp-ts-std/Tuple';
import { initLast } from 'util/array';
import { Binary, Endo, Unary } from 'util/function';
import { mapValues } from 'util/object';
import { lines, nChars, nSpaces } from 'util/string';
import { Pair } from 'util/tuple';
import * as LN from './lens';
import { treeCata } from './schemes';
import { Tree, TreeAlgebra } from './types';

/**
 * Keys for one character strings used for edges:
 *
 * 1. `init` -  Left edge of all branch lines last
 * 2. `last` - edge of final line of a branch
 * 3. `vertical` - vertical branch line
 * 4. `horizontal` - horizontal branch line
 * 5. `none` - empty branch space
 **/
export type EdgeChar = 'init' | 'last' | 'horizontal' | 'vertical' | 'none';

/**
 * Keys for multi-char string used for node bullets:
 *
 * 1. `leaf` - right edge of leaf nodes
 * 2. `node` - right edge of node head lines
 **/
export type BulletString = 'leaf' | 'node';

/**
 * Color keys:
 *
 * 1. `edge` - edge color
 **/
export type ColorKeys = 'edge';

export type EdgeConfig = Record<EdgeChar, string>;
export type BulletConfig = Record<BulletString, string>;
export type ColorConfig<C = string> = Record<ColorKeys, C | undefined>;

/**
 * Tree draw configuration for color type `C`
 *
 * 1. `indent` - number of spaces to shift when going down one level
 * 2. `edge` - values for the one-char edges
 * 3. `bullet` - values for the multi-char bullets
 * 4. `color` - color configuration for different parts
 * 5. `colorize` - if using colors, this is the function of type
 *    `C ⇒ string ⇒ string` which should colorize strings for
 *    the color type `C`
 */
export interface DrawConfig<C = string> {
  indent: number;
  edge: EdgeConfig;
  bullet: BulletConfig;
  color: ColorConfig<C>;
  colorize?: Unary<C, Endo<string>>;
}

export type WithConfig<T, C = string> = RE.Reader<DrawConfig<C>, T>;

export const defaultConfig: DrawConfig<string> = {
  indent: 1,
  edge: {
    init: '├',
    last: '└',
    horizontal: '─',
    vertical: '│',
    none: ' ',
  },
  bullet: {
    leaf: '─',
    node: '┬─',
  },
  color: {
    edge: undefined,
  },
  colorize: FN.constant(FN.identity),
};

// returns the formatted bullet config + prefix string for multi-line nodes
export const formatBullets: WithConfig<BulletConfig> = config => {
  const {
      color: { edge: edgeColor },
      bullet,
      edge: uncoloredEdge,
      indent,
    } = config,
    edge =
      edgeColor === undefined
        ? uncoloredEdge
        : FN.pipe(edgeColor, colorEdge(config)),
    [leaf, node]: Pair<string> = FN.pipe(
      [bullet.leaf, bullet.node],
      FN.pipe(indent, nChars(edge.horizontal), prepend, mapBoth),
    );
  return { leaf, node };
};

export const formatEdge: WithConfig<Unary<Pair<string>, Endo<string[]>>> =
  config => pair => {
    return FN.pipe(
      pair,
      mapBoth(FN.pipe(config.indent, nSpaces, prepend)),
      prependHeadTail,
      f =>
        AR.map(
          FN.flow(lines, f, FN.flow(STR.replace, AR.map)(/\s*$/, ''), unlines),
        ),
    );
  };

export const formatLabel: WithConfig<Binary<string, string[], string[]>> =
  config => (value, nodes) => {
    const bullet = formatBullets(config),
      { indent } = config,
      edge = colorEdge(config)(config.color.edge),
      [headBullet, tailEdge] = nodes.length
        ? [bullet.node, edge.vertical]
        : [bullet.leaf, edge.none];

    return FN.pipe(
      value,
      lines,
      prependHeadTail([headBullet, nSpaces(indent) + tailEdge]),
    );
  };

const colorEdge: WithConfig<Unary<string | undefined, EdgeConfig>> =
  config => color =>
    FN.pipe(
      config.edge,
      color === undefined
        ? FN.identity
        : FN.pipe(
            color,
            config.colorize ?? FN.constant(FN.identity),
            mapValues,
          ),
    );

export const makeDrawAlgebra: WithConfig<TreeAlgebra<string, string>> =
  config =>
  ({ value, nodes }) => {
    const label = formatLabel(config)(value, nodes);
    if (!nodes.length) return unlines(label);

    const [init, last]: [string[], string] = initLast(nodes),
      [format, edge] = [
        formatEdge(config),
        colorEdge(config)(config.color.edge),
      ];

    return unlines([
      ...label,
      ...format([edge.init, edge.vertical])(init),
      ...format([edge.last, edge.none])([last]),
    ]);
  };

export const drawFromConfig: WithConfig<Unary<Tree<string>, string>> = FN.flow(
  makeDrawAlgebra,
  treeCata,
);

export const draw: Unary<Tree<string>, string> = drawFromConfig(defaultConfig);

const computeLabelLines = <A>(show: Unary<A, string>): Unary<A, number> =>
  FN.flow(show, lines, AR.size);

/**
 * Given some way to compute the number of lines in a label of a `Tree<A>`,
 * a `Tree<A>`, and a node index in the top level of the tree, returns the
 * number of lines between the beginning of the node at the given index, and
 * the begining of the tree.
 *
 * For example for the tree:
 *
 * ```txt
 * line#
 *   0  ─┬─1. A One line
 *   1   ├───1.1 Two lines
 *   2   │
 *   3   ├─┬─1.2 One line
 *   4   │ └───1.2.1
 *   5   └───1.3 ← we are getting the line count for this node
 * ```
 *
 * If we have a function `countLabelLines` that returns 2 for node `1.1` and 1
 * for all others, then running this code should return 5:
 *
 * ```ts
 * computeChildLines(countLabelLines)(2)(tree) === 5
 * ```
 *
 */
export const computeChildLines =
  (nodeIdx?: number) =>
  <A>(show: Unary<A, string>): Unary<Tree<A>, number> => {
    const [computeOwn, computeNodes] = FN.pipe(
      show,
      fork([computeLabelLines, computeChildLines()]),
    );

    return tree => {
      const nodeCount = LN.getNodeCount(tree);

      return nodeCount
        ? FN.pipe(
            LN.nodes<A>()
              .get(tree)
              .slice(0, nodeIdx ?? nodeCount - 1),
            AR.map(computeNodes),
            sum,
          )
        : FN.pipe(tree, LN.value<A>().get, computeOwn);
    };
  };

function prependHeadTail([headPrefix, tailPrefix]: Pair<string>): Endo<
  string[]
> {
  return (rows: string[]) => {
    if (rows.length < 2) return [FN.pipe(rows[0], prepend(headPrefix))];

    const [head, ...tail] = rows;
    return [
      FN.pipe(head, prepend(headPrefix)),
      ...FN.pipe(tail, FN.pipe(tailPrefix, prepend, AR.map)),
    ];
  };
}
