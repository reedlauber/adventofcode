import { stdout } from 'node:process';

import {
  ARROW_DIRECTION_MOVES,
  ARROW_DIRECTION_NEXTS,
  ARROW_DIRECTION_PREVS,
  type ArrowDirection,
  DayBase,
  type GridCoords,
  type GridCellKey,
  gridCellKey,
  type LookupGrid,
  type LookupGridCollection,
  createGridFromLines,
  eachGrid,
  getAdjacentCell,
  ARROW_DIRECTIONS,
} from '../../utils';

interface AdjacentCell {
  c: GridCoords;
  d: ArrowDirection;
  k: GridCellKey;
  p?: LookupGridCollection<ArrowDirection>;
  pc?: GridCoords;
  s?: number;
}

type AdjacentLookupValue = AdjacentCell | null;

type Adjacents = [
  AdjacentLookupValue,
  AdjacentLookupValue,
  AdjacentLookupValue,
  AdjacentLookupValue
];

interface Maze extends LookupGrid<true | number | ArrowDirection> {
  direction: ArrowDirection;
  end: GridCellKey;
  lowest: GridCellKey;
  pos: GridCoords;
  score: number;
  adjacents: { [key: GridCellKey]: Adjacents };
  state: 'aborted' | 'complete' | 'deadend' | 'exploring';
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

class Day extends DayBase {
  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    super(day, step, isSample, data);

    this.isAsync = true;
  }

  output = '';
  best = 109496;
  scores: number[] = [];
  scorePaths: LookupGridCollection<ArrowDirection>[] = [];
  paths: { [key: string]: number } = {};

  getAdjacent(
    maze: Maze,
    pos: GridCoords,
    direction: ArrowDirection,
    turnType: 'ccw' | 'cw' | 'forward'
  ): [GridCellKey, ArrowDirection, GridCoords, boolean] {
    let nextDirection = direction;

    if (turnType === 'cw') {
      nextDirection = ARROW_DIRECTION_NEXTS[direction];
    } else if (turnType === 'ccw') {
      nextDirection = ARROW_DIRECTION_PREVS[direction];
    }
    const move = ARROW_DIRECTION_MOVES[nextDirection];
    const next: GridCoords = [pos[0] + move[0], pos[1] + move[1]];
    const key = gridCellKey(next);
    return [key, nextDirection, next, !!maze.items.walls[key]];
  }

  lowest: { [key: string]: number } = {};

  getBranches(
    maze: Maze,
    pos: GridCoords,
    posKey: GridCellKey,
    direction: ArrowDirection,
    path: LookupGridCollection<ArrowDirection>,
    score: number
  ): [AdjacentCell | null, number, AdjacentCell[]] {
    const adjacents = maze.adjacents[posKey];

    const fNum = DIRECTION_INDEXES[direction];
    const cwNum = fNum === 3 ? 0 : fNum + 1;
    const ccwNum = fNum === 0 ? 3 : fNum - 1;

    const f = adjacents[fNum];
    const cw = adjacents[cwNum];
    const ccw = adjacents[ccwNum];

    const cwGKey = `${cw?.k}-${cwNum}`;
    const cwGLowest = this.lowest[cwGKey] ?? Number.POSITIVE_INFINITY;

    const ccwGKey = `${ccw?.k}-${ccwNum}`;
    const ccwGLowest = this.lowest[ccwGKey] ?? Number.POSITIVE_INFINITY;

    const isNW = direction === '^' || direction === '<';

    const first = isNW ? cw : ccw;
    const second = isNW ? ccw : cw;

    let main: AdjacentCell | null = null;
    const branches: AdjacentCell[] = [];

    let nextScore = score + SCORES.MOVE;

    if (f && !path[f.k]) {
      const fGKey = `${f?.k}-${fNum}`;
      const fGLowest = this.lowest[fGKey] ?? Number.POSITIVE_INFINITY;

      if (nextScore <= fGLowest) {
        main = f;

        if (nextScore <= fGLowest) {
          this.lowest[fGKey] = nextScore;
        }
      }
    }

    if (first && !path[first.k]) {
      const gKey = isNW ? cwGKey : ccwGKey;
      const lowest = isNW ? cwGLowest : ccwGLowest;
      const turnScore = score + SCORES.MOVE + SCORES.TURN;

      if (turnScore <= lowest) {
        if (main) {
          first.p = { ...path };
          first.pc = pos;
          first.s = turnScore;
          branches.push(first);
        } else {
          main = first;
          nextScore += SCORES.TURN;
        }

        if (turnScore <= lowest) {
          this.lowest[gKey] = turnScore;
        }
      }
    }

    if (second && !path[second.k]) {
      const gKey = isNW ? ccwGKey : cwGKey;
      const lowest = isNW ? ccwGLowest : cwGLowest;
      const turnScore = score + SCORES.MOVE + SCORES.TURN;

      if (turnScore <= lowest) {
        if (main) {
          second.p = { ...path };
          second.pc = pos;
          second.s = turnScore;
          branches.push(second);
        } else {
          main = second;
          nextScore += SCORES.TURN;
        }
      }

      if (turnScore <= lowest) {
        this.lowest[gKey] = turnScore;
      }
    }

    return [main, nextScore, branches];
  }

  async followMainPath(
    maze: Maze,
    pos: GridCoords,
    posKey: GridCellKey,
    direction: ArrowDirection,
    score: number,
    path: LookupGridCollection<ArrowDirection>,
    prev: GridCoords,
    branchId = '0',
    etc: string = ''
  ): Promise<[score: number, branches: AdjacentCell[]]> {
    let nextPos = pos;
    let nextKey = posKey;
    let nextDirection = direction;
    let branches: AdjacentCell[] = [];

    while (true) {
      // await this.sleep(500);

      const [main, nextScore, nextBranches] = this.getBranches(
        maze,
        nextPos,
        nextKey,
        nextDirection,
        path,
        score
      );

      if (nextScore > this.best) {
        break;
      }

      this.printMaze2(
        maze,
        etc,
        path,
        [prev, nextPos],
        score,
        branches.length + nextBranches.length,
        branchId
      );
      if (!main) break;

      path[main.k] = main.d;
      score = nextScore;

      prev = nextPos;

      nextPos = main.c;
      nextKey = main.k;
      nextDirection = main.d;

      branches.push(...nextBranches);

      if (main.k === maze.end) {
        this.complete(score, { ...path });
        break;
      }
    }

    return [score, branches];
  }

  async explore(
    maze: Maze,
    pos: GridCoords,
    direction: ArrowDirection,
    score: number,
    path: LookupGridCollection<ArrowDirection>,
    prev: GridCoords,
    branchId = '0',
    etc = ''
  ) {
    const posKey = gridCellKey(pos);
    path[posKey] = direction;

    const pathStr = Object.values(path).join('');

    // etc += `\n${branchId} - ${pathStr} - Starting score: ${score}`;

    const [pathScore, branches] = await this.followMainPath(
      maze,
      pos,
      posKey,
      direction,
      score,
      path,
      prev,
      branchId,
      etc
    );

    score = pathScore;

    for (let b = 0; b < branches.length; b++) {
      const branch = branches[b];
      // this.output = '';

      await this.explore(
        maze,
        branch.c,
        branch.d,
        branch.s ?? -1000000,
        { ...branch.p, [branch.k]: branch.d },
        branch.pc ?? [0, 0],
        `${branchId}-${b}`,
        etc
      );
    }

    if (posKey === maze.end) {
      this.complete(score, path);
    }
  }

  complete(score: number, path: LookupGridCollection<ArrowDirection>) {
    if (this.best === -1 || score < this.best) {
      this.best = score;
    }

    this.scores.push(score);
    this.scorePaths.push(path);
  }

  getBestCompletedPaths() {
    const completedPath = this.scorePaths.reduce<
      LookupGridCollection<ArrowDirection>
    >((acc, path, i) => {
      if (this.scores[i] === this.best) {
        const p = Object.keys(path).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        );
        return { ...acc, ...p };
      }
      return acc;
    }, {});

    return completedPath;
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
      adjacents: {},
      direction: '>',
      end: '-1,-1',
      height: 0,
      items: {
        nodes: {},
        path: {},
        walls: {},
      },
      lowest: '-1,-1',
      pos: [0, 0],
      score: 0,
      state: 'exploring',
      width: 0,
    };

    this.getDataWithoutDeadends()
      .split('\n')
      .forEach((line, y) => {
        line.split('').forEach((cell, x) => {
          const cellKey = gridCellKey([y, x]);

          if (cell === '#') {
            maze.items.walls[cellKey] = true;
          } else {
            if (cell === 'E') {
              maze.end = cellKey;
            } else if (cell === 'S') {
              maze.pos = [y, x];
            }

            maze.items.nodes[cellKey] = Number.POSITIVE_INFINITY;

            maze.adjacents[cellKey] = [null, null, null, null];

            const nKey = gridCellKey([y - 1, x]);
            if (maze.adjacents[nKey]) {
              maze.adjacents[cellKey][0] = { c: [y - 1, x], d: '^', k: nKey };
              maze.adjacents[nKey][2] = { c: [y, x], d: 'v', k: cellKey };
            }

            const wKey = gridCellKey([y, x - 1]);
            if (maze.adjacents[wKey]) {
              maze.adjacents[cellKey][3] = { c: [y, x - 1], d: '<', k: wKey };
              maze.adjacents[wKey][1] = { c: [y, x], d: '>', k: cellKey };
            }
          }
        });
      });

    const startKey = gridCellKey(maze.pos);

    maze.height = this.lines.length;
    maze.width = this.lines[0].length;
    maze.items.nodes[startKey] = 0;
    maze.items.path[startKey] = '>';
    maze.lowest = startKey;

    return maze;
  }

  clearMaze(maze: Maze) {
    stdout.cursorTo(0, maze.height + this.scores.length + 3);
    stdout.clearScreenDown();
  }

  printMaze(
    maze: Maze,
    depth: number,
    path: { [key: GridCellKey]: ArrowDirection },
    score: number = 0
  ) {
    if (!this.output) {
      let output = `Depth: ${depth}. [${maze.pos}]                      \n`;

      const posKey = gridCellKey(maze.pos);

      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          const key = gridCellKey([y, x]);
          if (key === maze.end) {
            output = `${output}${'*'.green.bold}`;
          } else if (typeof path[key] === 'string') {
            output = `${output}${path[key].magenta}`;
          } else if (path[key]) {
            output = `${output}${'O'.white.bold}`;
          } else if (key === posKey) {
            output = `${output}${maze.direction.red.bold}`;
          } else if (maze.items.walls[key]) {
            output = `${output}${'#'.grey}`;
          } else {
            output = `${output}${'.'.grey}`;
          }
        }
        output = `${output} ${y}\n`;
      }

      output += `Status: ${maze.state} | Score: ${score}           \n`;

      this.output = output;

      stdout.cursorTo(0, 1);
      stdout.write(output);
    } else {
      stdout.cursorTo(0, 1);
      stdout.write(`Depth: ${depth}. [${maze.pos}]                      \n`);

      stdout.cursorTo(maze.pos[1], maze.pos[0] + 2);
      stdout.write(maze.direction.red);
    }

    stdout.cursorTo(0, maze.height + 3);
    stdout.clearScreenDown();
    this.scores.forEach((score, i) => {
      console.log(
        `Score: ${score}, Path: ${Object.values(this.scorePaths[i]).join('')}`
      );
    });

    // stdout.cursorTo(0, 1);
    // stdout.clearScreenDown();
    // stdout.write(output + '\n');
  }

  printMazeCell(
    maze: Maze,
    cell: GridCoords,
    path: { [key: GridCellKey]: ArrowDirection }
  ) {
    const key = gridCellKey(cell);

    if (key === maze.end) {
      return `${'*'.green.bold}`;
    } else if (typeof path[key] === 'string') {
      return `${path[key].magenta}`;
    } else if (path[key]) {
      return `${'O'.white.bold}`;
    } else if (maze.items.walls[key]) {
      return `${'#'.grey}`;
    } else {
      return `${'.'.grey}`;
    }
  }

  printCount = 0;

  printMaze2(
    maze: Maze,
    etc: string,
    path: { [key: GridCellKey]: ArrowDirection },
    updates: Array<GridCoords | undefined> = [],
    score: number = 0,
    branches: number,
    branchId: string
  ) {
    if (++this.printCount > 5000) {
      this.printCount = 0;
      this.output = '';
    }

    const windowHalf = 20;
    const windowSize = Math.min(windowHalf * 2 + 1, maze.height);

    const end = maze.height;
    const start = Math.max(end - windowSize, 0);

    if (this.output) {
      stdout.cursorTo(0, 0);
      stdout.write(`Node: [${maze.pos}]                      \n`);

      updates.forEach((update) => {
        if (!update || update[0] + 1 - start < 1) return;
        const key = gridCellKey(update);
        stdout.cursorTo(update[1], update[0] + 1 - start);
        stdout.write(this.printMazeCell(maze, update, path));
      });

      stdout.cursorTo(0, windowSize + 1);
      stdout.write(
        `Branch: ${branchId} | Score: ${score} | Branches: ${branches}               \n`
      );
      stdout.cursorTo(0, windowSize + 1 + etc.split('\n').length + 2);

      return;
    }

    let output = `Node: [${maze.pos}]                      \n`;

    for (let y = start; y < end; y++) {
      for (let x = 0; x < maze.width; x++) {
        output = `${output}${this.printMazeCell(maze, [y, x], path)}`;
      }

      output = `${output} ${y}           \n`;
    }

    output += `Branch: ${branchId} | Score: ${score} | Branches: ${branches}            \n`;

    this.output = output;

    stdout.cursorTo(0, 0);
    stdout.clearScreenDown();
    stdout.write(output + '\n');
    stdout.write(etc);
  }

  async step1Async() {
    const maze = this.getMaze();

    await this.explore(maze, maze.pos, '>', 0, {}, maze.pos);

    this.printMaze(maze, 0, {});

    return Promise.resolve('Best: ' + this.best);
  }

  async step2Async() {
    const maze = this.getMaze();

    await this.explore(maze, maze.pos, '>', 0, {}, maze.pos);

    const completedPath = this.getBestCompletedPaths();

    this.output = '';
    this.printMaze(maze, 0, completedPath);

    // return Promise.resolve('Best: ' + this.best);
    return Promise.resolve('Best: ' + Object.keys(completedPath).length);
  }
}

export { Day };
