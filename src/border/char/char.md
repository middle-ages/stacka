# Border Character Merging

- [Why?](#why)
  - [Data-driven vs. compositional API for drawing cells](#data-driven-vs-compositional-api-for-drawing-cells)
  - [Border Merging](#border-merging)
  - [Matrix Matching](#matrix-matching)
  - [All single-line border merges](#all-single-line-border-merges)

`char.js` is a module for merging two characters by:

1. Stacking them on top of each other
2. Finding the character that most resembles the newly formed shape

## Why?

For border merging of rectangular bordered cells, required for composing table-like output in the terminal.

### Data-driven vs. compositional API for drawing cells

We want an API for building things out of bordered cells, for example tables. We have two different API options:

1. Data-driven
2. Compositional

Where data-driven will mean:

1. A schema for a table, with cells/spans/headers, etc.
2. Functions to populate and render the schema

This can be limited in features by the schema. Consider drawing different borders fo5 different cells, or alternate-color background for rows. It is difficult to create a schema to support all use-cases.

A compositional API could remove some of these limitations. Users build any kind of cell, and then combine cells at required directions and distances.  This allows building any table-like thing from simple parts.

But when composing table-like things from cells, borders are tricky.

### Border Merging

To avoid double borders, or missing edge borders, user needs to be careful.  When adding a cell, you must consider its neighbors. The API is only compositional if you don't draw borders.

Border merging is a feature that allows you to compose bordered cells. It does what a user of the API would do when they want to avoid double/missing borders.

CSS has margin and table border merging, which work the same way. User adds borders to cells, and when the cells are rendered, borders are merged.

E.g.: when merging a top cell and its snug neighbor, a bottom cell, if:

1. Margins at the line of contact are zero for both upper and lower cell
2. Borders at the line of contact are non-empty for both cells

Then every pair of touching borders characters will be merged into one character. For example:

```txt

     BEFORE                AFTER
   ----------            ----------
   upper cell            upper cell
   :    :  :
   └────┴──┘             :    :  :
             -becomes→   ├────┼──┤
   ┌────┬──┐             :    :  :
   :    :  :
   lower cell            lower cell
```

To allow border merging we need to figure out how to merge adjacent border cells, and do this over the entire contact line.

To merge adjacent border cells we match character matrices.

### Matrix Matching

The border merge described could be implemented by indexing all possible 3-tuples for all possible table border characters:

```txt
(1st border char, 2nd border char) ⇒ merged border char
```

This would be easy to do, if only there weren't so many of them. Even if we only wanted the simple merge example above, for all border character types, merged horizontally + vertically, and their combinations, we would need many dozens of mappings.

Instead we store only mappings of char to display matrix and no combinations:

```txt
border character => character matrix
```

Then to merge borders, we:

1. Stack the two character matrices
2. Find the character whose matrix is most similar to the stacked matrix
3. This is the merged border character

For example, for the merge of the top/bottom boxes described above, the following border character merge is required for the left-most edge:

```txt
    bottom-left corner of top cell:    └
                       merged cell:    ├
    top-left corner of bottom cell:    ┌
```

We keep a static mapping from border characters to their display matrix. For the example above we would register these two matrices for the top-right elbow (“└”) and the bottom-right elbow (“┌”):

Note: diagrams reduce resolution to help the explanation. Actual resolution used is 5X5 per glyph.

```txt

  └       ┌

┌─┬─┬─┐ ┌─┬─┬─┐
│ │█│ │ │ │ │ │
├─┼█┼─┤ ├─┼─┼─┤
│ │███│ │ │███│
├─┼─┼─┤ ├─┼█┼─┤
│ │ │ │ │ │█│ │
└─┴─┴─┘ └─┴─┴─┘
```

Stacking them on top of each other gives us:

```txt
┌─┬─┬─┐
│ │█│ │
├─┼█┼─┤
│ │███│
├─┼█┼─┤
│ │█│ │
└─┴─┴─┘
```

 Finally, using the `char⇒matrix` mapping, but in the reverse direction, we find the character vertical-tee-right “├”.
