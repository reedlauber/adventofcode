export interface Grid<T = string> {
  cells: Array<Array<T | undefined>>;
  height: number;
  width: number;
}

export type GridCoords = [y: number, x: number];

export type GridCellKey = `${number},${number}`;

export type Direction = 'N' | 'E' | 'S' | 'W';

export type ArrowDirection = '^' | '>' | 'v' | '<';

export const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];

export const ARROW_DIRECTIONS: ArrowDirection[] = ['^', '>', 'v', '<'];

export const DIRECTION_ARROWS: { [key in Direction]: ArrowDirection } = {
  N: '^',
  E: '>',
  S: 'v',
  W: '<',
};

export const DIRECTION_NEXTS: { [key in Direction]: Direction } = {
  N: 'E',
  E: 'S',
  S: 'W',
  W: 'N',
};

export const ARROW_DIRECTION_NEXTS: {
  [key in ArrowDirection]: ArrowDirection;
} = {
  '^': '>',
  '>': 'v',
  v: '<',
  '<': '^',
};

export const DIRECTION_PREVS: { [key in Direction]: Direction } = {
  N: 'W',
  E: 'N',
  S: 'E',
  W: 'S',
};

export const ARROW_DIRECTION_PREVS: {
  [key in ArrowDirection]: ArrowDirection;
} = {
  '^': '<',
  '>': '^',
  v: '>',
  '<': 'v',
};

export const DIRECTION_MOVES: { [key in Direction]: [dy: number, dx: number] } =
  {
    N: [-1, 0],
    E: [0, 1],
    S: [1, 0],
    W: [0, -1],
  };

export const ARROW_DIRECTION_MOVES: {
  [key in ArrowDirection]: [dy: number, dx: number];
} = {
  '^': [-1, 0],
  '>': [0, 1],
  v: [1, 0],
  '<': [0, -1],
};

export interface LookupGridCollection<T> {
  [key: GridCellKey]: T;
}

export interface LookupGrid<T = true> {
  height: number;
  items: { [key: string]: LookupGridCollection<T> };
  width: number;
}

export const createGridFromLines = (lines: string[], separator = ''): Grid => {
  const cells = lines.map((line) => line.split(separator));
  return { cells, height: lines.length, width: cells[0]?.length ?? 0 };
};

export const createNumberGridFromLines = (
  lines: string[],
  separator = ''
): Grid<number> => {
  const cells = lines.map((line) => line.split(separator).map(Number));
  return { cells, height: lines.length, width: cells[0]?.length ?? 0 };
};

export const cloneGrid = (grid: Grid): Grid => {
  return { ...grid, cells: grid.cells.map((row) => [...row]) };
};

export const eachGrid = <T = string>(
  grid: Grid<T>,
  eachFn: (item: T | undefined, coords: GridCoords) => void
) => {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      eachFn(grid.cells[y]?.[x], [y, x]);
    }
  }
};

export const mapGrid = (
  grid: Grid,
  mapFn: (item: string | undefined, coords: GridCoords) => string | undefined
) => {
  const mappedGrid: Grid = { ...grid, cells: [] };

  for (let y = 0; y < grid.cells.length; y++) {
    mappedGrid.cells[y] = [];

    for (let x = 0; x < grid.width; x++) {
      mappedGrid.cells[y][x] = mapFn(grid.cells[y][x], [y, x]);
    }
  }

  return mappedGrid;
};

export const printGrid = (grid: Grid) => {
  console.log('\n' + grid.cells.map((row) => row.join('')).join('\n'));
};

export const gridCellKey = ([y, x]: GridCoords): GridCellKey => `${y},${x}`;

export const coordInBounds = <T = string>(grid: Grid<T>, coords: GridCoords) =>
  coords[0] >= 0 &&
  coords[0] < grid.height &&
  coords[1] >= 0 &&
  coords[1] < grid.width;

export const getAtCoords = (grid: Grid, coords: GridCoords) =>
  grid.cells[coords[0]]?.[coords[1]];

export const callAtCoords = (
  grid: Grid,
  coords: GridCoords,
  callFn: (item: string | undefined, coords: GridCoords) => void
) => {
  callFn(grid.cells[coords[0]]?.[coords[1]], coords);
};

export const getAdjacentCell = (
  coords: GridCoords,
  move: [dy: number, dx: number]
): GridCoords => [coords[0] + move[0], coords[1] + move[1]];

export const getDirectionCell = (
  coords: GridCoords,
  d: Direction
): GridCoords => [
  coords[0] + DIRECTION_MOVES[d][0],
  coords[1] + DIRECTION_MOVES[d][1],
];

export const eachAdjacent = (
  grid: Grid,
  coords: GridCoords,
  eachFn: (item: string | undefined, coords: GridCoords) => void
) => {
  callAtCoords(grid, [coords[0] - 1, coords[1]], eachFn); // above
  callAtCoords(grid, [coords[0], coords[1] + 1], eachFn); // right
  callAtCoords(grid, [coords[0] + 1, coords[1]], eachFn); // bottom
  callAtCoords(grid, [coords[0], coords[1] - 1], eachFn); // left
};

export const eachSurrounding = (
  grid: Grid,
  coords: GridCoords,
  eachFn: Parameters<typeof callAtCoords>[2]
) => {
  callAtCoords(grid, [coords[0] - 1, coords[1] - 1], eachFn); // above-left
  callAtCoords(grid, [coords[0] - 1, coords[1]], eachFn); // top-center
  callAtCoords(grid, [coords[0] - 1, coords[1] + 1], eachFn); // top-right
  callAtCoords(grid, [coords[0], coords[1] + 1], eachFn); // right
  callAtCoords(grid, [coords[0] + 1, coords[1] + 1], eachFn); // bottom-right
  callAtCoords(grid, [coords[0] + 1, coords[1]], eachFn); // bottom-center
  callAtCoords(grid, [coords[0] + 1, coords[1] - 1], eachFn); // bottom-left
  callAtCoords(grid, [coords[0], coords[1] - 1], eachFn); // left
};
