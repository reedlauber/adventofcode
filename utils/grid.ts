export interface Grid {
  cells: Array<Array<string | undefined>>;
  height: number;
  width: number;
}

export type GridCoords = [y: number, x: number];

export const createGridFromLines = (lines: string[], separator = ''): Grid => {
  const cells = lines.map((line) => line.split(separator));
  return { cells, height: lines.length, width: cells[0]?.length ?? 0 };
};

export const eachGrid = (grid: Grid, eachFn: (item: string | undefined, coords: GridCoords) => void) => {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      eachFn(grid.cells[y]?.[x], [y, x]);
    }
  }
};

export const mapGrid = (grid: Grid, mapFn: (item: string | undefined, coords: GridCoords) => string | undefined) => {
  const mappedGrid: Grid = { ...grid, cells: [] };

  for (let y = 0; y < grid.cells.length; y++) {
    mappedGrid.cells[y] = [];

    for (let x = 0; x < grid.width; x++) {
      mappedGrid.cells[y][x] = mapFn(grid.cells[y][x], [y, x]);
    }
  }

  return mappedGrid;
};

export const getAtCoords = (grid: Grid, coords: GridCoords) => grid.cells[coords[0]]?.[coords[1]];

export const callAtCoords = (grid: Grid, coords: GridCoords, callFn: (item: string | undefined, coords: GridCoords) => void) => {
  callFn(grid.cells[coords[0]]?.[coords[1]], coords);
};

export const eachAdjacent = (grid: Grid, coords: GridCoords, eachFn: (item: string | undefined, coords: GridCoords) => void) => {
  callAtCoords(grid, [coords[0] - 1, coords[1]], eachFn); // above
  callAtCoords(grid, [coords[0], coords[1] + 1], eachFn); // right
  callAtCoords(grid, [coords[0] + 1, coords[1]], eachFn); // bottom
  callAtCoords(grid, [coords[0], coords[1] - 1], eachFn); // left
};

export const eachSurrounding = (grid: Grid, coords: GridCoords, eachFn: Parameters<typeof callAtCoords>[2]) => {
  callAtCoords(grid, [coords[0] - 1, coords[1] - 1], eachFn); // above-left
  callAtCoords(grid, [coords[0] - 1, coords[1]], eachFn); // top-center
  callAtCoords(grid, [coords[0] - 1, coords[1] + 1], eachFn); // top-right
  callAtCoords(grid, [coords[0], coords[1] + 1], eachFn); // right
  callAtCoords(grid, [coords[0] + 1, coords[1] + 1], eachFn); // bottom-right
  callAtCoords(grid, [coords[0] + 1, coords[1]], eachFn); // bottom-center
  callAtCoords(grid, [coords[0] + 1, coords[1] - 1], eachFn); // bottom-left
  callAtCoords(grid, [coords[0], coords[1] - 1], eachFn); // left
};
