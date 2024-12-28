import { eachGrid, Grid } from "../../utils";

export interface Sequence {
  cost: number;
  totalCost?: number;
  secondary?: Sequence[];
  s: string;
}

const PRIMITIVE_COSTS = {
  'A': 0,
  '^': 1,
  '>': 1,
  'v': 2,
  '<': 3,
} as const;

const COSTS = {
  'A': 0,
  '^A': PRIMITIVE_COSTS['^'] * 2,
  '^^A': PRIMITIVE_COSTS['^'] * 2,
  '^>A': PRIMITIVE_COSTS['^'] + 1 + PRIMITIVE_COSTS['>'],
  '^vA': PRIMITIVE_COSTS['^'] + 1 + PRIMITIVE_COSTS['v'],
  '^<A': PRIMITIVE_COSTS['^'] + 2 + PRIMITIVE_COSTS['<'],
  '^^^A': PRIMITIVE_COSTS['^'] * 2,
  '^^>A': PRIMITIVE_COSTS['^'] + 2 + PRIMITIVE_COSTS['>'],
  '^^vA': PRIMITIVE_COSTS['^'] + 1 + PRIMITIVE_COSTS['v'],
  '^^<A': PRIMITIVE_COSTS['^'] + 2 + PRIMITIVE_COSTS['<'],
  '^>^A': PRIMITIVE_COSTS['^'] + 2 + 2 + PRIMITIVE_COSTS['^'],
  '^>>A': PRIMITIVE_COSTS['^'] + 2 + PRIMITIVE_COSTS['>'],

  '>A': PRIMITIVE_COSTS['>'] * 2,

  'vA': PRIMITIVE_COSTS['v'] * 2,

  '<A': PRIMITIVE_COSTS['<'] * 2,

} as const;

export const ARROW_SEQS: { [key: string]: Sequence[] } = {
  'A # A': [{ cost: 0, s: 'A' }],
  'A # ^': [{ cost: 1, s: '<A' }],
  'A # >': [{ cost: 2, s: 'vA' }],
  'A # v': [{ cost: 4, s: '<vA' }, { cost: 3, s: 'v<A' }],
  'A # <': [{ cost: 3, s: 'v<<A' }, { cost: 5, s: '<v<A' }],

  '^ # A': [{ cost: 1, s: '>A' }],
  '^ # ^': [{ cost: 0, s: 'A' }],
  '^ # >': [{ cost: 2, s: '>vA' }, { cost: 2, s: 'v>A' }],
  '^ # v': [{ cost: 1, s: 'vA' }],
  '^ # <': [{ cost: 2, s: 'v<A' }],

  '> # A': [{ cost: 1, s: '^A' }],
  '> # ^': [{ cost: 3, s: '^<A' }, { cost: 5, s: '<^A' }],
  '> # >': [{ cost: 0, s: 'A' }],
  '> # v': [{ cost: 3, s: '<A' }],
  '> # <': [{ cost: 3, s: '<<A' }],

  'v # A': [{ cost: 3, s: '>^A' }, { cost: 3, s: '^>A' }],
  'v # ^': [{ cost: 1, s: '^A' }],
  'v # >': [{ cost: 1, s: '>A' }],
  'v # v': [{ cost: 0, s: 'A' }],
  'v # <': [{ cost: 3, s: '<A' }],

  '< # A': [{ cost: 3, s: '>>^A' }, { cost: 5, s: '>^>A' }],
  '< # ^': [{ cost: 2, s: '>^A' }],
  '< # >': [{ cost: 2, s: '>>A' }],
  '< # v': [{ cost: 1, s: '>A' }],
  '< # <': [{ cost: 0, s: 'A' }],
};

const arrowsGrid: Grid = { cells: [], height: 2, width: 3 };
arrowsGrid.cells[0][0] = 'X';
arrowsGrid.cells[0][1] = '^';
arrowsGrid.cells[0][2] = 'A';
arrowsGrid.cells[1][0] = '<';
arrowsGrid.cells[1][1] = 'v';
arrowsGrid.cells[1][2] = '>';

const arrowSeqs: { [key: string]: Sequence[] } = {};
const getArrowSequences = (start: string, end: string) => {}

const generateArrowSequences = () => {
  eachGrid(arrowsGrid, (start, [stY, stX]) => {
    eachGrid(arrowsGrid, (end, [eY, eX]) => {
      if (start === 'X' || end === 'X') return;
      const key = `${start} # ${end}`;
      arrowSeqs[key] = [];
    });
  });
};

const setSecondary = (seq: Sequence, depth: number, limit = 1) => {
  const secondary: Sequence[] = [];

  let prev = 'A';
  seq.s.split('').forEach((c, i) => {
    secondary.push(...ARROW_SEQS[`${prev} # ${c}`]);
    prev = c;
  });

  if (depth < limit) {
    secondary.forEach((sec) => {
      sec.secondary = [];
      setSecondary(sec, depth + 1, limit);
    });
  }

  seq.totalCost = secondary.reduce(
    (acc, s) => acc + (s.totalCost ?? 0),
    0
  );

  seq.secondary = secondary;
};

Object.values(ARROW_SEQS).forEach((sequences) => {
  sequences.forEach((s) => {
    s.totalCost = s.cost;
    setSecondary(s, 1, 2);
  });
});

// ARROW_SEQS['A # A'][0].secondary = [...ARROW_SEQS['A # A']];
// ARROW_SEQS['A # ^'][0].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # A']];
// ARROW_SEQS['A # >'][0].secondary = [...ARROW_SEQS['A # v'], ...ARROW_SEQS['v # A']];
// ARROW_SEQS['A # v'][0].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # v'], ...ARROW_SEQS['v # A']];
// ARROW_SEQS['A # v'][1].secondary = [...ARROW_SEQS['A # v'], ...ARROW_SEQS['v # <'], ...ARROW_SEQS['< # A']];
// ARROW_SEQS['A # <'][0].secondary = [...ARROW_SEQS['A # v'], ...ARROW_SEQS['v # <'], ...ARROW_SEQS['< # <'], ...ARROW_SEQS['< # A']];
// ARROW_SEQS['A # <'][1].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # v'], ...ARROW_SEQS['v # <'], ...ARROW_SEQS['< # A']];

// ARROW_SEQS['^ # A'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['^ # ^'][0].secondary = [...ARROW_SEQS['A # A']];
// ARROW_SEQS['^ # >'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # v'], ...ARROW_SEQS['v # A']];
// ARROW_SEQS['^ # >'][1].secondary = [...ARROW_SEQS['A # v'], ...ARROW_SEQS['v # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['^ # v'][0].secondary = [...ARROW_SEQS['A # v'], ...ARROW_SEQS['v # A']];
// ARROW_SEQS['^ # <'][0].secondary = [...ARROW_SEQS['A # v'], ...ARROW_SEQS['v # <'], ...ARROW_SEQS['< # A']];

// ARROW_SEQS['> # A'][0].secondary = [...ARROW_SEQS['A # ^'], ...ARROW_SEQS['^ # A']];
// ARROW_SEQS['> # ^'][0].secondary = [...ARROW_SEQS['A # ^'], ...ARROW_SEQS['^ # <'], ...ARROW_SEQS['< # A']];
// ARROW_SEQS['> # ^'][1].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # ^'], ...ARROW_SEQS['^ # A']];
// ARROW_SEQS['> # >'][0].secondary = [...ARROW_SEQS['A # A']];
// ARROW_SEQS['> # v'][0].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # A']];
// ARROW_SEQS['> # <'][0].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # <'], ...ARROW_SEQS['< # A']];

// ARROW_SEQS['v # A'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # ^'], ...ARROW_SEQS['^ # A']];
// ARROW_SEQS['v # A'][1].secondary = [...ARROW_SEQS['A # ^'], ...ARROW_SEQS['^ # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['v # ^'][0].secondary = [...ARROW_SEQS['A # ^'], ...ARROW_SEQS['^ # A']];
// ARROW_SEQS['v # >'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['v # v'][0].secondary = [...ARROW_SEQS['A # A']];
// ARROW_SEQS['v # <'][0].secondary = [...ARROW_SEQS['A # <'], ...ARROW_SEQS['< # A']];

// ARROW_SEQS['< # A'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # >'], ...ARROW_SEQS['> # ^'], ...ARROW_SEQS['^ # A']];
// ARROW_SEQS['< # A'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # ^'], ...ARROW_SEQS['^ # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['< # ^'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # ^'], ...ARROW_SEQS['^ # A']];
// ARROW_SEQS['< # >'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['< # v'][0].secondary = [...ARROW_SEQS['A # >'], ...ARROW_SEQS['> # A']];
// ARROW_SEQS['< # <'][0].secondary = [...ARROW_SEQS['A # A']];

export const NUM_SEQS: { [key: string]: Sequence[] } = {
  'A # A': [{ cost: 0, s: 'A' }],
  'A # 0': [{ cost: 3, s: '<A' }],
  'A # 1': [{ cost: 6, s: '^<<A' }, { cost: 10, s: '<^<A' }],
  'A # 2': [{ cost: 6, s: '^<A' }, { cost: 6, s: '<^A' }],
  'A # 3': [{ cost: 2, s: '^A' }],
  'A # 4': [
    { cost: 6, s: '^^<<A' },
    { cost: 6, s: '^<<^A' },
    { cost: 10, s: '^<^<A' },
    { cost: 10, s: '<^^<A' },
    { cost: 10, s: '<^<^A' },
  ],
  'A # 5': [{ cost: 6, s: '^^<A' }, { cost: 6, s: '^<^A' }, { cost: 6, s: '<^^A' }],
  'A # 6': [{ cost: 2, s: '^^A' }],
  'A # 7': [
    { cost: 6, s: '^^^<<A' },
    { cost: 10, s: '^^<^<A' },
    { cost: 6, s: '^^<<^A' },
    { cost: 10, s: '^<^^<A' },
    { cost: 10, s: '^<^<^A' },
    { cost: 6, s: '^<<^^A' },
    { cost: 10, s: '<^^^<A' },
    { cost: 10, s: '<^^<^A' },
    { cost: 10, s: '<^<^^A' },
  ],
  'A # 8': [{ cost: 6, s: '^^^<A' }, { cost: 6, s: '^^<^A' }, { cost: 6, s: '^<^^A' }, { cost: 6, s: '<^^^A' }],
  'A # 9': [{ cost: 2, s: '^^^A' }],

  '0 # A': [{ cost: 2, s: '>A' }],
  '0 # 0': [{ cost: 0, s: 'A' }],
  '0 # 1': [{ cost: 6, s: '^<A' }],
  '0 # 2': [{ cost: 2, s: '^A' }],
  '0 # 3': [{ cost: 4, s: '^>A' }, { cost: 4, s: '>^A' }],
  '0 # 4': [{ cost: 6, s: '^^<A' }, { cost: 6, s: '^<^A' }],
  '0 # 5': [{ cost: 2, s: '^^A' }],
  '0 # 6': [{ cost: 4, s: '^^>A' }, { cost: 0, s: '^>^A' }, { cost: 0, s: '>^^A' }],
  '0 # 7': [{ cost: 0, s: '^^^<A' }, { cost: 0, s: '^^<^A' }, { cost: 0, s: '^<^^A' }],
  '0 # 8': [{ cost: 0, s: '^^^A' }],
  '0 # 9': [{ cost: 0, s: '^^^>A' }, { cost: 0, s: '^^>^A' }, { cost: 0, s: '^>^^A' }, { cost: 0, s: '>^^^A' }],

  '1 # A': [{ cost: 0, s: '>>vA' }, { cost: 0, s: '>v>A' }],
  '1 # 0': [{ cost: 0, s: '>vA' }],
  '1 # 1': [{ cost: 0, s: 'A' }],
  '1 # 2': [{ cost: 0, s: '>A' }],
  '1 # 3': [{ cost: 0, s: '>>A' }],
  '1 # 4': [{ cost: 0, s: '^A' }],
  '1 # 5': [{ cost: 0, s: '^>A' }, { cost: 0, s: '>^A' }],
  '1 # 6': [{ cost: 0, s: '^>>A' }, { cost: 0, s: '>^>A' }, { cost: 0, s: '>>^A' }],
  '1 # 7': [{ cost: 0, s: '^^A' }],
  '1 # 8': [{ cost: 0, s: '^^>A' }, { cost: 0, s: '^>^A' }, { cost: 0, s: '>^^A' }],
  '1 # 9': [{ cost: 0, s: '^^>>A' }, { cost: 0, s: '^>^>A' }, { cost: 0, s: '^>>^A' }, { cost: 0, s: '>^^>A' }, { cost: 0, s: '>^>^A' }, { cost: 0, s: '>>^^A' }],

  '2 # A': [{ cost: 0, s: '>vA' }, { cost: 0, s: 'v>A' }],
  '2 # 0': [{ cost: 0, s: 'vA' }],
  '2 # 1': [{ cost: 0, s: '<A' }],
  '2 # 2': [{ cost: 0, s: 'A' }],
  '2 # 3': [{ cost: 0, s: '>A' }],
  '2 # 4': [{ cost: 0, s: '^<A' }, { cost: 0, s: '<^A' }],
  '2 # 5': [{ cost: 0, s: '^A' }],
  '2 # 6': [{ cost: 0, s: '^>A' }, { cost: 0, s: '>^A' }],
  '2 # 7': [{ cost: 0, s: '^^<A' }, { cost: 0, s: '^<^A' }, { cost: 0, s: '<^^A' }],
  '2 # 8': [{ cost: 0, s: '^^A' }],
  '2 # 9': [{ cost: 0, s: '^^>A' }, { cost: 0, s: '^>^A' }, { cost: 0, s: '>^^A' }],

  '3 # A': [{ cost: 0, s: 'vA' }],
  '3 # 0': [{ cost: 0, s: 'v<A' }, { cost: 0, s: '<vA' }],
  '3 # 1': [{ cost: 0, s: '<<A' }],
  '3 # 2': [{ cost: 0, s: '<A' }],
  '3 # 3': [{ cost: 0, s: 'A' }],
  '3 # 4': [{ cost: 0, s: '^<<A' }, { cost: 0, s: '<^<A' }, { cost: 0, s: '<<^A' }],
  '3 # 5': [{ cost: 0, s: '^<A' }, { cost: 0, s: '<^A' }],
  '3 # 6': [{ cost: 0, s: '^A' }],
  '3 # 7': [{ cost: 0, s: '<<^^A' }, { cost: 0, s: '<^<^A' }, { cost: 0, s: '<^^<A' }, { cost: 0, s: '^<<^A' }, { cost: 0, s: '^<^<A' }, { cost: 0, s: '^^<<A' }],
  '3 # 8': [{ cost: 0, s: '^^<A' }, { cost: 0, s: '^<^A' }, { cost: 0, s: '<^^A' }],
  '3 # 9': [{ cost: 0, s: '^^A' }],

  '4 # A': [{ cost: 0, s: '>>vvA' }, { cost: 0, s: '>v>vA' }, { cost: 0, s: '>vv>A' }, { cost: 0, s: 'v>>vA' }, { cost: 0, s: 'v>v>A' }],
  '4 # 0': [{ cost: 0, s: '>vvA' }, { cost: 0, s: 'v>vA' }],
  '4 # 1': [{ cost: 0, s: 'vA' }],
  '4 # 2': [{ cost: 0, s: '>vA' }, { cost: 0, s: 'v>A' }],
  '4 # 3': [{ cost: 0, s: '>>vA' }, { cost: 0, s: '>v>A' }, { cost: 0, s: 'v>>A' }],
  '4 # 4': [{ cost: 0, s: 'A' }],
  '4 # 5': [{ cost: 0, s: '>A' }],
  '4 # 6': [{ cost: 0, s: '>>A' }],
  '4 # 7': [{ cost: 0, s: '^A' }],
  '4 # 8': [{ cost: 0, s: '^>A' }, { cost: 0, s: '>^A' }],
  '4 # 9': [{ cost: 0, s: '^>>A' }],

  '5 # A': [{ cost: 0, s: '>vvA' }, { cost: 0, s: 'v>vA' }, { cost: 0, s: 'vv>A' }],
  '5 # 0': [{ cost: 0, s: 'vvA' }],
  '5 # 1': [{ cost: 0, s: 'v<A' }, { cost: 0, s: '<vA' }],
  '5 # 2': [{ cost: 0, s: 'vA' }],
  '5 # 3': [{ cost: 0, s: '>vA' }, { cost: 0, s: 'v>A' }],
  '5 # 4': [{ cost: 0, s: '<A' }],
  '5 # 5': [{ cost: 0, s: 'A' }],
  '5 # 6': [{ cost: 0, s: '>A' }],
  '5 # 7': [{ cost: 0, s: '^<A' }, { cost: 0, s: '<^A' }],
  '5 # 8': [{ cost: 0, s: '^A' }],
  '5 # 9': [{ cost: 0, s: '^>A' }, { cost: 0, s: '>^A' }],

  '6 # A': [{ cost: 0, s: 'vvA' }],
  '6 # 0': [{ cost: 0, s: 'vv<A' }, { cost: 0, s: 'v<vA' }, { cost: 0, s: '<vvA' }],
  '6 # 1': [{ cost: 0, s: 'v<<A' }, { cost: 0, s: '<v<A' }, { cost: 0, s: '<<vA' }],
  '6 # 2': [{ cost: 0, s: 'v<A' }, { cost: 0, s: '<vA' }],
  '6 # 3': [{ cost: 0, s: 'vA' }],
  '6 # 4': [{ cost: 0, s: '<<A' }],
  '6 # 5': [{ cost: 0, s: '<A' }],
  '6 # 6': [{ cost: 0, s: 'A' }],
  '6 # 7': [{ cost: 0, s: '^<<A' }, { cost: 0, s: '<^<A' }, { cost: 0, s: '<<^A' }],
  '6 # 8': [{ cost: 0, s: '^<A' }, { cost: 0, s: '<^A' }],
  '6 # 9': [{ cost: 0, s: '^A' }],

  '7 # A': [{ cost: 0, s: 'vv>v>A' }, { cost: 0, s: 'vv>>vA' }, { cost: 0, s: 'v>vv>A' }, { cost: 0, s: 'v>>vvA' }, { cost: 0, s: '>vvv>A' }, { cost: 0, s: '>vv>vA' }, { cost: 0, s: '>v>vvA' }, { cost: 0, s: '>>vvvA' }],
  '7 # 0': [{ cost: 0, s: 'vv>vA' }, { cost: 0, s: 'v>vvA' }, { cost: 0, s: '>vvvA' }],
  '7 # 1': [{ cost: 0, s: 'vvA' }],
  '7 # 2': [{ cost: 0, s: '>vvA' }, { cost: 0, s: 'v>vA' }, { cost: 0, s: 'vv>A' }],
  '7 # 3': [{ cost: 0, s: '>>vvA' }, { cost: 0, s: '>v>vA' }, { cost: 0, s: '>vv>A' }, { cost: 0, s: 'v>>vA' }, { cost: 0, s: 'v>v>A' }, { cost: 0, s: 'vv>>A' }],
  '7 # 4': [{ cost: 0, s: 'vA' }],
  '7 # 5': [{ cost: 0, s: '>vA' }, { cost: 0, s: 'v>A' }],
  '7 # 6': [{ cost: 0, s: '>>vA' }, { cost: 0, s: '>v>A' }, { cost: 0, s: 'v>>A' }],
  '7 # 7': [{ cost: 0, s: 'A' }],
  '7 # 8': [{ cost: 0, s: '>A' }],
  '7 # 9': [{ cost: 0, s: '>>A' }],

  '8 # A': [{ cost: 0, s: '>vvvA' }, { cost: 0, s: 'v>vvA' }, { cost: 0, s: 'vv>vA' }, { cost: 0, s: 'vvv>A' }],
  '8 # 0': [{ cost: 0, s: 'vvvA' }],
  '8 # 1': [{ cost: 0, s: 'vv<A' }, { cost: 0, s: 'v<vA' }, { cost: 0, s: '<vvA' }],
  '8 # 2': [{ cost: 0, s: 'vvA' }],
  '8 # 3': [{ cost: 0, s: '>vvA' }, { cost: 0, s: 'v>vA' }, { cost: 0, s: 'vv>A' }],
  '8 # 4': [{ cost: 0, s: 'v<A' }, { cost: 0, s: '<vA' }],
  '8 # 5': [{ cost: 0, s: 'vA' }],
  '8 # 6': [{ cost: 0, s: '>vA' }, { cost: 0, s: 'v>A' }],
  '8 # 7': [{ cost: 0, s: '<A' }],
  '8 # 8': [{ cost: 0, s: 'A' }],
  '8 # 9': [{ cost: 0, s: '>A' }],

  '9 # A': [{ cost: 0, s: 'vvvA' }],
  '9 # 0': [{ cost: 0, s: 'vvv<A' }, { cost: 0, s: 'vv<vA' }, { cost: 0, s: 'v<vvA' }, { cost: 0, s: '<vvvA' }],
  '9 # 1': [{ cost: 0, s: 'vv<<A' }, { cost: 0, s: 'v<v<A' }, { cost: 0, s: 'v<<vA' }, { cost: 0, s: '<<vvA' }],
  '9 # 2': [{ cost: 0, s: 'vv<A' }, { cost: 0, s: 'v<vA' }, { cost: 0, s: '<vvA' }],
  '9 # 3': [{ cost: 0, s: 'vvA' }],
  '9 # 4': [{ cost: 0, s: 'v<<A' }, { cost: 0, s: '<v<A' }, { cost: 0, s: '<<vA' }],
  '9 # 5': [{ cost: 0, s: 'v<A' }, { cost: 0, s: '<vA' }],
  '9 # 6': [{ cost: 0, s: 'vA' }],
  '9 # 7': [{ cost: 0, s: '<<A' }],
  '9 # 8': [{ cost: 0, s: '<A' }],
  '9 # 9': [{ cost: 0, s: 'A' }],
};
