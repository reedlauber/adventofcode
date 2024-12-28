import {
  cloneGrid,
  createGridFromLines,
  DayBase,
  eachGrid,
  type Grid,
  type GridCoords,
  printGrid,
} from '../../utils';

type Direction = 'N' | 'E' | 'S' | 'W';

const NEXT_DIR: { [key in Direction]: Direction } = {
  N: 'E',
  E: 'S',
  S: 'W',
  W: 'N',
} as const;

const DIR_BIT: { [key in Direction]: number } = {
  N: 1,
  E: 2,
  S: 4,
  W: 8,
} as const;

class Day extends DayBase {
  move(
    [y, x]: GridCoords,
    grid: Grid,
    dir: Direction
  ): [GridCoords | null, Direction] {
    const dx = dir === 'E' ? 1 : dir === 'W' ? -1 : 0;
    const dy = dir === 'S' ? 1 : dir === 'N' ? -1 : 0;
    const mark = dir === 'N' || dir === 'S' ? '|' : '-';

    if (grid.cells[y][x] !== '+') {
      grid.cells[y][x] = mark;
    }

    let nx = x + dx;
    let ny = y + dy;

    if (ny < 0 || ny >= grid.height || nx < 0 || nx >= grid.width) {
      return [null, dir];
    }

    const cell = grid.cells[ny][nx];

    if (cell === '#' || cell === 'O') {
      grid.cells[y][x] = '+';
      dir = NEXT_DIR[dir];
      nx = x;
      ny = y;
    }

    return [[ny, nx], dir];
  }

  runGuard(grid: Grid, start: GridCoords, startDir: Direction): boolean {
    let guard: GridCoords | null = [start[0], start[1]];
    let dir: Direction = startDir;
    let isLoop = false;

    const visited: { [key: string]: number } = {};

    while (true) {
      if (!guard) break;

      const visitedKey = `${guard[0]},${guard[1]}`;
      visited[visitedKey] = (visited[visitedKey] ?? 0) + DIR_BIT[dir];

      const [nextPos, nextDir] = this.move(guard, grid, dir);

      if (nextPos) {
        const nextVisitedKey = `${nextPos[0]},${nextPos[1]}`;
        const nextDirBit = DIR_BIT[nextDir];
        const nextVisited = visited[nextVisitedKey] ?? 0;
        if ((nextVisited & nextDirBit) > 0) {
          isLoop = true;
          break;
        }
      }

      guard = nextPos;
      dir = nextDir;
    }

    return isLoop;
  }

  getVisited(grid: Grid) {
    return grid.cells.reduce((acc, row) => {
      return (
        acc +
        row.filter((cell) => ['X', '-', '|', '+'].includes(cell ?? '')).length
      );
    }, 0);
  }

  getInitialState(): [GridCoords, Grid] {
    const grid = createGridFromLines(this.lines);
    let start: GridCoords = [-1, -1];

    eachGrid(grid, (cell, [y, x]) => {
      if (cell === '^') {
        start = [y, x];
      }
    });

    return [start, grid];
  }

  positionIsLoop(grid: Grid, start: GridCoords, pos: GridCoords): boolean {
    const clone = cloneGrid(grid);
    clone.cells[pos[0]][pos[1]] = 'O';
    const isLoop = this.runGuard(clone, start, 'N');

    if (isLoop) {
      printGrid(clone);
    }

    return isLoop;
  }

  getLoopPositions(grid: Grid, start: GridCoords): GridCoords[] {
    const loopPositions: GridCoords[] = [];

    eachGrid(grid, (cell, pos) => {
      // if (loopPositions.length > 0) return;
      if (grid.cells[pos[0]][pos[1]] === '#') return;

      if (this.positionIsLoop(grid, start, pos)) {
        loopPositions.push(pos);
      }
    });

    return loopPositions;
  }

  getTestLoopPositions(grid: Grid, start: GridCoords): GridCoords[] {
    const loopPositions: GridCoords[] = [];

    const test: GridCoords[] = [
      [6, 3],
      [7, 6],
      [7, 7],
      [8, 1],
      [8, 3],
    ];

    test.forEach((pos) => {
      if (this.positionIsLoop(grid, start, pos)) {
        loopPositions.push(pos);
      }
    });

    return loopPositions;
  }

  step1() {
    const [start, grid] = this.getInitialState();
    this.runGuard(grid, start, 'N');

    return this.getVisited(grid);
  }

  step2() {
    const [start, grid] = this.getInitialState();
    const loopPositions = this.getLoopPositions(grid, start);

    loopPositions.forEach(([y, x]) => {
      grid.cells[y][x] = 'O';
    });

    printGrid(grid);

    return loopPositions.length;
  }
}

export { Day };
