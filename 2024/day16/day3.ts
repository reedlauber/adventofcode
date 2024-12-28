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
  type GridCoords,
  type GridCellKey,
  gridCellKey,
  type LookupGrid,
  type LookupGridCollection,
} from '../../utils';

interface Maze extends LookupGrid<true | number | ArrowDirection> {
  direction: ArrowDirection;
  end: GridCellKey;
  lowest: GridCellKey;
  pos: GridCoords;
  score: number;
  start: GridCellKey;
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

class Day extends DayBase {
  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    super(day, step, isSample, data);

    this.isAsync = true;
  }

  output = '';
  best = Number.POSITIVE_INFINITY;
  highest = 0;
  scores: number[] = [];
  scorePaths: string[] = [];

  exploreAdjacent(
    maze: Maze,
    node: GridCoords,
    nodeDirection: ArrowDirection,
    turnDirection: 'ccw' | 'cw' | 'forward'
  ) {
    const nodeKey = gridCellKey(node);
    let direction = nodeDirection;
    let score = (maze.items.nodes[nodeKey] as number) + SCORES.MOVE;

    if (turnDirection === 'cw') {
      direction = ARROW_DIRECTION_NEXTS[nodeDirection];
      score += SCORES.TURN;
    } else if (turnDirection === 'ccw') {
      direction = ARROW_DIRECTION_PREVS[nodeDirection];
      score += SCORES.TURN;
    }

    const move = ARROW_DIRECTION_MOVES[direction];
    const neighbor: GridCoords = [node[0] + move[0], node[1] + move[1]];
    const neighborKey = gridCellKey(neighbor);

    if (maze.items.walls[neighborKey]) return false;

    // if (nodeKey === '11,5' || nodeKey === '13,5') {
    //   console.log(`${nodeKey} ${direction} ${neighborKey} (${score})`);
    // }

    const neighborScore = maze.items.nodes[neighborKey] as number;

    if (score < neighborScore) {
      maze.items.nodes[neighborKey] = score;
      maze.items.nodeDirections[neighborKey] = direction;
    }

    if (score > this.highest) {
      this.highest = score;
    }

    return true;
  }

  getLinesWithoutDeadends() {
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

    return grid.cells.map((row) => row.join(''));
  }

  getMaze() {
    const maze: Maze = {
      direction: '>',
      end: '-1,-1',
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
      score: 0,
      start: '-1,-1',
      state: 'exploring',
      width: 0,
    };

    this.getLinesWithoutDeadends().forEach((line, y) => {
      line.split('').forEach((cell, x) => {
        const cellKey = gridCellKey([y, x]);

        if (cell === '#') {
          maze.items.walls[cellKey] = true;
        } else {
          maze.items.nodes[cellKey] = Number.POSITIVE_INFINITY;
          maze.items.nodeDirections[cellKey] = '>';
          maze.items.available[cellKey] = true;

          if (cell === 'S') {
            maze.end = cellKey;
          } else if (cell === 'E') {
            maze.start = cellKey;
            maze.pos = [y, x];
            maze.items.nodes[cellKey] = 0;
          }
        }
      });
    });

    const startKey = gridCellKey(maze.pos);

    maze.height = this.lines.length;
    maze.width = this.lines[0].length;
    maze.items.nodes[startKey] = 0;
    maze.lowest = startKey;

    return maze;
  }

  printMazeCell(maze: Maze, cell: GridCoords) {
    const key = gridCellKey(cell);

    if (key === maze.end) {
      return `${'*'.padStart(7, '*').green.bold}`;
    } else if (maze.items.walls[key]) {
      return `${'#'.padStart(7, '#').white}`;
    } else if (maze.items.available[key]) {
      return `${'.'.white}`;
    } else if (maze.items.nodes[key]) {
      const score = maze.items.nodes[key] as number;
      const scoreInt = score;
      // const scoreInt = Math.floor((score / this.highest) * 10);

      if (maze.items.path[key]) {
        return `${`|${scoreInt.toString().padStart(5, '0')}|`.green}`;
      }

      return `${`|${scoreInt.toString().padStart(5, '0')}|`.magenta}`;
    } else if (key === maze.lowest) {
      return `${'@'.padStart(7, '@').yellow.bold}`;
    } else {
      return ' '.padStart(7, ' ');
    }
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
      stdout.cursorTo(0, 1);
      stdout.write(`Node: [${maze.pos}]                      \n`);

      updates.forEach((update) => {
        if (!update) return;
        const key = gridCellKey(update);
        stdout.cursorTo(update[1], update[0] + 2 - start);
        stdout.write(this.printMazeCell(maze, update));
      });

      return;
    }

    let output = `Node: [${maze.pos}]                      \n`;

    for (let y = start; y < end; y++) {
      for (let x = 0; x < maze.width; x++) {
        output = `${output}${this.printMazeCell(maze, [y, x])}`;
      }

      output = `${output} ${y}           \n`;
    }

    output += `Status: ${maze.state} | Score: ${maze.score}                                   \n`;

    this.output = output;

    stdout.cursorTo(0, 0);
    stdout.clearScreenDown();
    stdout.write(output + '\n');
    stdout.write(etc);
  }

  getLowest(maze: Maze) {
    let lowestKey: GridCellKey | undefined;
    let lowestScore = Number.POSITIVE_INFINITY;

    Object.entries(maze.items.available).forEach(([key, _]) => {
      const score = maze.items.nodes[key as GridCellKey] as number;

      if (score < lowestScore) {
        lowestScore = score;
        lowestKey = key as GridCellKey;
      }
    });

    if (lowestKey) {
      const [y, x] = lowestKey.split(',').map(Number);
      return [y, x] as GridCoords;
    }

    return lowestKey;
  }

  calculatePath(maze: Maze, start: GridCellKey) {
    let node: GridCoords = start.split(',').map(Number) as GridCoords;

    const nodeKey = gridCellKey(node);
    maze.items.path[nodeKey] = true;

    if (nodeKey === maze.end) {
      return;
    }

    const adjacents = ARROW_DIRECTIONS.map<[GridCellKey, number] | null>(
      (direction) => {
        const adjacent = getAdjacentCell(
          node,
          ARROW_DIRECTION_MOVES[direction]
        );
        const adjacentKey = gridCellKey(adjacent);

        if (maze.items.path[adjacentKey]) return null;

        const score = maze.items.nodes[adjacentKey];

        if (typeof score === 'number') {
          // console.log('adjacent', adjacent, score);
          // const scoreInt = Math.floor((score / this.highest) * 10);
          const scoreInt = score;
          return [adjacentKey, scoreInt];
        }

        return null;
      }
    );

    const best = adjacents.reduce<[GridCellKey, number] | null>((acc, r) => {
      if (r && (!acc || r[1] < acc[1])) {
        return r;
      }

      return acc;
    }, null);

    if (!best) return;

    const bests = adjacents.filter((a) => a && a[1] === best[1]);

    bests.forEach((b) => {
      if (!b) return;
      this.calculatePath(maze, b[0]);
    });
  }

  explorePathAdjacent(
    maze: Maze,
    node: GridCoords,
    nodeDirection: ArrowDirection,
    turnDirection: 'ccw' | 'cw' | 'forward'
  ) {
    const nodeKey = gridCellKey(node);
    let direction = nodeDirection;

    if (turnDirection === 'cw') {
      direction = ARROW_DIRECTION_NEXTS[nodeDirection];
      // score += SCORES.TURN;
    } else if (turnDirection === 'ccw') {
      direction = ARROW_DIRECTION_PREVS[nodeDirection];
      // score += SCORES.TURN;
    }

    const move = ARROW_DIRECTION_MOVES[direction];
    const neighbor: GridCoords = [node[0] + move[0], node[1] + move[1]];
    const neighborKey = gridCellKey(neighbor);

    if (maze.items.walls[neighborKey]) return false;

    return neighbor;
  }

  getPaths(
    maze: Maze,
    node: GridCoords,
    direction: ArrowDirection,
    paths: Path[]
  ) {
    const forward = this.explorePathAdjacent(maze, node, direction, 'forward');

    if (forward) {
      this.getPaths(maze, forward, direction, paths);
    }

    const cw = this.explorePathAdjacent(maze, node, direction, 'cw');
    const ccw = this.explorePathAdjacent(maze, node, direction, 'ccw');
  }

  async step1Async() {
    this.sleepMs = 0;
    const maze = this.getMaze();

    let node: GridCoords | undefined;
    let prev: GridCoords | undefined;
    let direction: ArrowDirection = '<';

    let output = '';

    while (true) {
      node = this.getLowest(maze);

      if (!node) break;

      const nodeKey = gridCellKey(node);
      maze.pos = node;
      maze.lowest = nodeKey;
      maze.score = maze.items.nodes[nodeKey] as number;
      direction = maze.items.nodeDirections[nodeKey] as ArrowDirection;

      // output = `${output}Pos: [${node}]. Score: ${maze.score}. Direction: ${direction}\n`;

      this.exploreAdjacent(maze, node, direction, 'forward');
      // this.printMaze(maze, output, [node, prev]);
      await this.sleep();

      this.exploreAdjacent(maze, node, direction, 'cw');
      // this.printMaze(maze, output, [node, prev]);
      await this.sleep();

      this.exploreAdjacent(maze, node, direction, 'ccw');
      // this.printMaze(maze, output, [node, prev]);
      await this.sleep();

      delete maze.items.available[nodeKey];

      prev = node;
    }

    stdout.moveCursor(0, 0);
    stdout.clearScreenDown();

    this.output = '';
    this.printMaze(maze, output, [node, prev]);

    return Promise.resolve('Best: ' + maze.items.nodes[maze.end]);
  }

  async step2Async() {
    this.sleepMs = 0;
    const maze = this.getMaze();

    let node: GridCoords | undefined;
    let prev: GridCoords | undefined;
    let direction: ArrowDirection = '<';

    let output = '';

    while (true) {
      node = this.getLowest(maze);

      if (!node) break;

      const nodeKey = gridCellKey(node);
      maze.pos = node;
      maze.lowest = nodeKey;
      maze.score = maze.items.nodes[nodeKey] as number;
      direction = maze.items.nodeDirections[nodeKey] as ArrowDirection;

      // output = `${output}Pos: [${node}]. Score: ${maze.score}. Direction: ${direction}\n`;

      this.exploreAdjacent(maze, node, direction, 'forward');
      // this.printMaze(maze, output, [node, prev]);
      await this.sleep();

      this.exploreAdjacent(maze, node, direction, 'cw');
      // this.printMaze(maze, output, [node, prev]);
      await this.sleep();

      this.exploreAdjacent(maze, node, direction, 'ccw');
      // this.printMaze(maze, output, [node, prev]);
      await this.sleep();

      delete maze.items.available[nodeKey];

      prev = node;
    }

    // stdout.moveCursor(0, 0);
    // stdout.clearScreenDown();
    const paths: Path[] = [];
    const start = maze.start.split(',').map(Number) as GridCoords;
    this.getPaths(maze, start, '<', paths);

    this.output = '';
    this.printMaze(maze, output, [node, prev]);

    return Promise.resolve('Best: ' + maze.items.nodes[maze.end]);
  }
}

export { Day };
