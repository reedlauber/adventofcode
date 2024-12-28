import { stdout } from 'node:process';

import {
  ARROW_DIRECTION_MOVES,
  ARROW_DIRECTION_NEXTS,
  ARROW_DIRECTION_PREVS,
  ARROW_DIRECTIONS,
  type ArrowDirection,
  createGridFromLines,
  DayBase,
  eachGrid,
  getAdjacentCell,
  gridCellKey,
  type GridCellKey,
  type GridCoords,
  type LookupGrid,
  type LookupGridCollection,
} from '../../utils';

interface Maze extends LookupGrid<true | number | ArrowDirection> {
  direction: ArrowDirection;
  end: GridCellKey;
  endCoord: GridCoords;
  lowest: GridCellKey;
  pos: GridCoords;
  posKey: GridCellKey;
  score: number;
  start: GridCellKey;
  startCoord: GridCoords;
  state: 'aborted' | 'complete' | 'deadend' | 'exploring';
}

interface Path {
  lookup: LookupGridCollection<true>;
  nodes: GridCellKey[];
  score: number;
}

const SCORES = {
  MOVE: 1,
  TURN: 1000,
} as const;

const DIRECTION_INDEXES: { [key in ArrowDirection]: 0 | 1 | 2 | 3 } = {
  '^': 0,
  '>': 1,
  v: 2,
  '<': 3,
};

type Cell = [
  score: number,
  direction: ArrowDirection,
  coords: GridCoords,
  path: string[]
];

class Day extends DayBase {
  visited: { [key: string]: number } = {};
  winning: { [key: string]: true } = {};

  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    super(day, step, isSample, data);

    this.isAsync = true;
  }

  getDataWithoutDeadends() {
    return this.getSavedData('data-no-deadends', () => {
      const grid = createGridFromLines(this.lines);

      while (true) {
        let found = 0;

        eachGrid(grid, (cell, coords) => {
          if (cell !== '.') return;

          const nearbyWalls = ARROW_DIRECTIONS.map((direction) =>
            getAdjacentCell(coords, ARROW_DIRECTION_MOVES[direction])
          ).reduce((acc, [y, x]) => {
            return acc + (grid.cells[y]?.[x] === '#' ? 1 : 0);
          }, 0);

          if (nearbyWalls >= 3) {
            grid.cells[coords[0]][coords[1]] = '#';
            found++;
          }
        });

        if (!found) break;
      }

      return grid.cells.map((row) => row.join('')).join('\n');
    });
  }

  getMaze() {
    const maze: Maze = {
      direction: '>',
      end: '-1,-1',
      endCoord: [-1, -1],
      height: 0,
      items: {
        available: {},
        nodes: {},
        nodeDirections: {},
        path: {},
        walls: {},
      },
      lowest: '-1,-1',
      pos: [0, 0],
      posKey: gridCellKey([0, 0]),
      score: 0,
      start: '-1,-1',
      startCoord: [-1, -1],
      state: 'exploring',
      width: 0,
    };

    this.data.split('\n').forEach((line, y) => {
      line.split('').forEach((cell, x) => {
        const cellKey = gridCellKey([y, x]);

        if (cell === '#') {
          maze.items.walls[cellKey] = true;
        } else {
          maze.items.nodes[cellKey] = true;
          maze.items.nodeDirections[cellKey] = '>';

          if (cell === 'S') {
            maze.start = cellKey;
            maze.startCoord = [y, x];
            maze.pos = [y, x];
            maze.posKey = cellKey;
          } else if (cell === 'E') {
            maze.end = cellKey;
            maze.endCoord = [y, x];
          }
        }
      });
    });

    const startKey = gridCellKey(maze.pos);

    maze.height = this.lines.length;
    maze.width = this.lines[0].length;
    maze.lowest = startKey;

    return maze;
  }

  printMazeCell(maze: Maze, key: GridCellKey) {
    const pad = 1;

    if (key === maze.posKey) {
      return `${'@'.padStart(pad, '@').yellow.bold}`;
    } else if (this.winning[key]) {
      return `${'O'.padStart(pad, String(this.winning[key])).magenta}`;
    } else if (key === maze.end) {
      return `${'*'.padStart(pad, '*').green.bold}`;
    } else if (maze.items.walls[key]) {
      return `${'#'.padStart(pad, '#').white}`;
    } else if (maze.items.available[key]) {
      return '.'.padStart(pad, '.');
    } else {
      return '.'.padStart(pad, '.');
    }
  }

  output = '';

  printFullMaze(maze: Maze, yStart: number, yEnd: number, etc: string) {
    let output = '';

    for (let y = yStart; y < yEnd; y++) {
      for (let x = 0; x < maze.width; x++) {
        const key = gridCellKey([y, x]);
        output = `${output}${this.printMazeCell(maze, key)}`;
      }

      output = `${output} ${y}           \n`;
    }

    output += `Status: ${maze.state} | Score: ${maze.score}                                   \n`;

    this.output = output;

    stdout.cursorTo(0, 0);
    stdout.clearScreenDown();
    stdout.write(output + '\n');
  }

  printUpdates(
    maze: Maze,
    yStart: number,
    updates: Array<GridCoords | undefined> = []
  ) {
    stdout.cursorTo(0, 1);

    updates.forEach((update) => {
      if (!update) return;
      const key = gridCellKey(update);
      stdout.cursorTo(update[1], update[0] - yStart);
      stdout.write(this.printMazeCell(maze, key));
    });
  }

  printEtc(maze: Maze, etc: string) {
    stdout.cursorTo(0, maze.height + 1);
    stdout.clearScreenDown();
    stdout.write(etc);
  }

  printMaze(
    maze: Maze,
    etc: string,
    updates: Array<GridCoords | undefined> = []
  ) {
    const windowHalf = 20;
    const windowSize = Math.min(windowHalf * 2 + 1, maze.height);

    const end = maze.height;
    const start = Math.max(end - windowSize, 0);

    if (this.output) {
      this.printUpdates(maze, start, updates);
    } else {
      this.printFullMaze(maze, start, end, etc);
    }

    this.printEtc(maze, etc);
  }

  canVisit(direction: ArrowDirection, coordKey: GridCellKey, score: number) {
    const key = `${coordKey},${direction}`;
    const prev = this.visited[key];

    // console.log('can visit', key, prev, score, prev < score);

    if (typeof prev === 'number' && prev < score) {
      // console.log('can visit prev', key, prev);
      return false;
    }

    this.visited[key] = score;

    return true;
  }

  step1() {
    return '';
  }

  lowestScore = 109497;
  winningPaths: { [key: number]: { [key: string]: true } } = {};

  addWinningPath(path: string[], score: number) {
    const winningPath: { [key: string]: true } = this.winningPaths[score] ?? {};

    path.forEach((cell) => {
      winningPath[cell] = true;
    });

    this.winningPaths[score] = winningPath;

    if (score < this.lowestScore) {
      this.lowestScore = score;
      this.winning = winningPath;
    }
  }

  exploreAdjacent(
    maze: Maze,
    pos: GridCoords,
    direction: ArrowDirection,
    score: number,
    path: string[],
    adjacentType: 'cw' | 'ccw' | 'fw'
  ): [Cell | undefined, string, string] {
    const nextDirection =
      adjacentType === 'fw'
        ? direction
        : adjacentType === 'cw'
        ? ARROW_DIRECTION_NEXTS[direction]
        : ARROW_DIRECTION_PREVS[direction];

    const [my, mx] =
      adjacentType === 'fw' ? ARROW_DIRECTION_MOVES[direction] : [0, 0];
    const nextPos: GridCoords =
      adjacentType === 'fw' ? [pos[0] + my, pos[1] + mx] : pos;
    const nextKey = gridCellKey(nextPos);
    const scoreAddition = adjacentType === 'fw' ? SCORES.MOVE : SCORES.TURN;
    const nextScore = score + scoreAddition;
    const nextPath = adjacentType === 'fw' ? [...path, nextKey] : [...path];

    // const etc = '';
    let etc = `Explore: ${pos} ${direction} :: ${nextPos} ${nextDirection}. Next exists = ${!!maze
      .items.nodes[nextKey]}. Can visit = ${this.canVisit(
      nextDirection,
      nextKey,
      nextScore
    )}`;

    if (
      maze.items.nodes[nextKey] &&
      this.canVisit(nextDirection, nextKey, nextScore) &&
      (adjacentType !== 'fw' || !path.includes(nextKey))
    ) {
      return [
        [nextScore, nextDirection, nextPos, nextPath],
        adjacentType.toUpperCase(),
        etc,
      ];
    }

    return [undefined, '', etc];
  }

  async step2Async() {
    const maze = this.getMaze();

    let cell: Cell | undefined = [0, '>', maze.startCoord, [maze.start]];
    let cells: Cell[] = [cell];

    let prev = cell;

    let its = 0;

    let skipReason = '';
    let stopReason = '';
    this.printMaze(maze, '');

    // const turnTypes = ['fw', 'cw', 'ccw'] as const;
    const turnTypes = ['ccw', 'cw', 'fw'] as const;

    while (cells.length) {
      // if (++its > 300) break;

      const prevKey = gridCellKey(prev[2]);
      prev = [...cell];
      cell = cells.pop();

      if (!cell) break;

      const [score, direction, pos, path] = cell;
      const key = gridCellKey(pos);

      skipReason = '';

      if (this.lowestScore < score) {
        skipReason = 'score too high. stop.';
        continue;
      }

      if (key === maze.end) {
        skipReason = 'reached end';
        this.addWinningPath(path, score);

        this.output = '';
        this.printMaze(maze, `${key} ${direction}. skip: ${skipReason}`, [
          prev[2],
          pos,
        ]);
        await this.sleep(200);
        continue;
      }

      if (!this.canVisit(direction, key, score)) {
        skipReason = 'cannot visit current cell';
        this.printMaze(maze, `${key} ${direction}. skip: ${skipReason}`, [
          prev[2],
          pos,
        ]);
        await this.sleep(200);
        continue;
      }

      maze.pos = pos;
      maze.posKey = key;
      const options: string[] = [];

      let etc = '';

      turnTypes.forEach((adjType) => {
        const [nextCell, nextOption, nextEtc] = this.exploreAdjacent(
          maze,
          pos,
          direction,
          score,
          path,
          adjType
        );

        if (
          pos[0] === 9 &&
          pos[1] === 3 &&
          direction === '>' &&
          adjType === 'ccw'
        ) {
          etc = `${pos} ${direction} has next = ${!!nextCell}`;
        }

        if (nextCell) {
          options.push(nextOption);
          cells.push(nextCell);
        }
      });

      this.printMaze(
        maze,
        `${prevKey} ${direction} ${key} | ${score} | can move: ${options.join(
          ', '
        )}. remaining: ${cells.length}.`,
        [prev[2], pos]
      );

      // if (etc) {
      //   console.log('\n', etc);
      //   break;
      // }

      // await this.sleep(100);
    }

    // this.printMaze(maze, stopReason);
    console.log('\n');

    return `${Object.keys(this.winning).length} (${this.lowestScore})`;
  }
}

export { Day };
