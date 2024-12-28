import { createHash } from 'node:crypto';
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
} from '../../utils';

interface Maze extends LookupGrid<true | ArrowDirection> {
  direction: ArrowDirection;
  end: GridCellKey;
  pos: GridCoords;
  score: number;
  state: 'aborted' | 'complete' | 'deadend' | 'exploring';
}

const SCORES = {
  MOVE: 1,
  DIRECTION: 1000,
} as const;

const cloneMaze = (maze: Maze): Maze => ({
  ...maze,
  items: {
    path: { ...maze.items.path },
    walls: { ...maze.items.walls },
  },
  pos: [maze.pos[0], maze.pos[1]],
});

class Day extends DayBase {
  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    super(day, step, isSample, data);

    this.isAsync = true;
  }

  getAdjacent(
    maze: Maze,
    turnDirection: 'ccw' | 'cw' | 'forward'
  ): [GridCellKey, ArrowDirection, GridCoords, string] {
    let direction = maze.direction;

    if (turnDirection === 'cw') {
      direction = ARROW_DIRECTION_NEXTS[maze.direction];
    } else if (turnDirection === 'ccw') {
      direction = ARROW_DIRECTION_PREVS[maze.direction];
    }
    const move = ARROW_DIRECTION_MOVES[direction];
    const pos: GridCoords = [maze.pos[0] + move[0], maze.pos[1] + move[1]];
    const key = gridCellKey(pos);
    const globalPathKey = `${key}-${direction}`;
    return [key, direction, pos, globalPathKey];
  }

  getNewDirectionClone(maze: Maze, direction: ArrowDirection) {
    const clone = cloneMaze(maze);
    clone.direction = direction;
    clone.score += SCORES.DIRECTION;
    return clone;
  }

  isGlobalPathAvailable(key: string, score: number) {
    return !this.paths[key] || this.paths[key] > score;
  }

  isAvailable(maze: Maze, key: GridCellKey) {
    return !maze.items.walls[key] && !maze.items.path[key];
  }

  isBlocked(maze: Maze, key: GridCellKey) {
    return maze.items.walls[key] || maze.items.path[key];
  }

  move(maze: Maze, onAlterate: (maze: Maze) => void) {
    const forwardMove = ARROW_DIRECTION_MOVES[maze.direction];
    const forwardPos: GridCoords = [
      maze.pos[0] + forwardMove[0],
      maze.pos[1] + forwardMove[1],
    ];
    const forwardKey = gridCellKey(forwardPos);

    // Reached end
    if (forwardKey === maze.end) {
      maze.score += SCORES.MOVE;
      maze.state = 'complete';
      return;
    }

    const [cwKey, cwDirection] = this.getAdjacent(maze, 'cw');
    const [ccwKey, ccwDirection] = this.getAdjacent(maze, 'ccw');

    const forwardBlocked = this.isBlocked(maze, forwardKey);
    const cwBlocked = this.isBlocked(maze, cwKey);
    const ccwBlocked = this.isBlocked(maze, ccwKey);

    // Next forward move is a wall
    if (forwardBlocked) {
      if (!cwBlocked) {
        // Turning clockwise is not a wall
        maze.direction = cwDirection;
        maze.score += SCORES.DIRECTION;

        // Counter clockwise is also not a wall
        if (!ccwBlocked) {
          onAlterate(this.getNewDirectionClone(maze, ccwDirection));
        }
      } else if (!ccwBlocked) {
        // Turning counter-clockwise is not a wall
        maze.direction = ccwDirection;
        maze.score += SCORES.DIRECTION;
      } else {
        maze.state = 'deadend';
      }
    } else {
      if (!cwBlocked) {
        const cwMaze = this.getNewDirectionClone(maze, cwDirection);
        cwMaze.items.path[forwardKey] = maze.direction;
        onAlterate(cwMaze);
      }

      if (!ccwBlocked) {
        const ccwMaze = this.getNewDirectionClone(maze, ccwDirection);
        ccwMaze.items.path[forwardKey] = maze.direction;

        if (!cwBlocked) {
          ccwMaze.items.path[cwKey] = cwDirection;
        }

        onAlterate(ccwMaze);
      }

      maze.items.path[forwardKey] = maze.direction;
      maze.pos = forwardPos;
      maze.score += SCORES.MOVE;
    }
  }

  async explore2(
    maze: Maze,
    depth: number,
    count: number,
    onComplete: (maze: Maze) => void
  ) {
    // if (count === 441) {
    //   this.sleepMs = 200;
    // }

    if (this.sleepMs > 0) {
      await this.sleep(this.sleepMs);
    }

    this.output = '';
    // const maze = cloneMaze(from);

    this.printMaze(maze, count, 0);

    const [forwardKey, , forwardPos, forwardGKey] = this.getAdjacent(
      maze,
      'forward'
    );
    const [cwKey, cwDirection, cwPos, cwGKey] = this.getAdjacent(maze, 'cw');
    const [ccwKey, ccwDirection, ccwPos, ccwGKey] = this.getAdjacent(
      maze,
      'ccw'
    );

    if (forwardKey === maze.end) {
      maze.score += SCORES.MOVE;
      maze.state = 'complete';
      onComplete(maze);
      return;
    }

    if (this.best !== -1 && maze.score > this.best) {
      maze.state = 'aborted';
      return;
    }

    if (
      this.isAvailable(maze, forwardKey) &&
      this.isGlobalPathAvailable(forwardGKey, maze.score + SCORES.MOVE)
    ) {
      const forwardMaze = cloneMaze(maze);
      forwardMaze.items.path[forwardKey] = forwardMaze.direction;
      forwardMaze.pos = [forwardPos[0], forwardPos[1]];
      forwardMaze.score += SCORES.MOVE;
      maze.items.path[forwardKey] = forwardMaze.direction;
      this.paths[forwardGKey] = forwardMaze.score;
      await this.explore2(forwardMaze, depth, count + 1, onComplete);
    }

    if (
      this.isAvailable(maze, cwKey) &&
      this.isGlobalPathAvailable(cwGKey, maze.score + SCORES.DIRECTION)
    ) {
      const cwMaze = cloneMaze(maze);
      cwMaze.direction = cwDirection;
      cwMaze.items.path[cwKey] = cwDirection;
      cwMaze.score += SCORES.DIRECTION;
      cwMaze.pos = [cwPos[0], cwPos[1]];
      cwMaze.score += SCORES.MOVE;
      maze.items.path[cwKey] = cwDirection;
      this.paths[forwardGKey] = cwMaze.score;
      await this.explore2(cwMaze, depth + 1, 0, onComplete);
    }

    if (
      this.isAvailable(maze, ccwKey) &&
      this.isGlobalPathAvailable(ccwGKey, maze.score + SCORES.DIRECTION)
    ) {
      const ccwMaze = cloneMaze(maze);
      ccwMaze.direction = ccwDirection;
      ccwMaze.items.path[ccwKey] = ccwDirection;
      ccwMaze.score += SCORES.DIRECTION;
      ccwMaze.pos = [ccwPos[0], ccwPos[1]];
      ccwMaze.score += SCORES.MOVE;
      maze.items.path[ccwKey] = cwDirection;
      this.paths[ccwGKey] = ccwMaze.score;
      await this.explore2(ccwMaze, depth + 1, 0, onComplete);
    }

    maze.state = 'deadend';

    // while (true) {
    //   this.move(maze, onAlterate);
    //   this.printMaze(maze, count, mazeCount);

    //   if (this.sleepMs > 0) {
    //     await this.sleep(this.sleepMs);
    //   }
    //   if (maze.state === 'complete') {
    //     onComplete(maze);
    //   }
    //   if (best !== -1 && maze.score > best) {
    //     maze.state = 'aborted';
    //   }
    //   if (maze.state !== 'exploring') break;
    // }
  }

  async explore(
    maze: Maze,
    count: number,
    mazeCount: number,
    onAlterate: (maze: Maze) => void,
    onComplete: (maze: Maze) => void
  ) {
    this.output = '';
    const clone = cloneMaze(maze);

    if (count === 441) {
      this.sleepMs = 200;
    }

    while (true) {
      this.move(clone, onAlterate);
      this.printMaze(clone, count, mazeCount);

      if (this.sleepMs > 0) {
        await this.sleep(this.sleepMs);
      }
      if (clone.state === 'complete') {
        onComplete(clone);
      }
      if (this.best !== -1 && clone.score > this.best) {
        clone.state = 'aborted';
      }
      if (clone.state !== 'exploring') break;
    }

    return clone;
  }

  getMaze() {
    const maze: Maze = {
      direction: '>',
      end: '-1,-1',
      height: 0,
      items: {
        path: {},
        walls: {},
      },
      pos: [0, 0],
      score: 0,
      state: 'exploring',
      width: 0,
    };

    this.lines.forEach((line, y) => {
      line.split('').forEach((cell, x) => {
        if (cell === '#') {
          maze.items.walls[gridCellKey([y, x])] = true;
        } else if (cell === 'E') {
          maze.end = gridCellKey([y, x]);
        } else if (cell === 'S') {
          maze.pos = [y, x];
        }
      });
    });

    maze.height = this.lines.length;
    maze.width = this.lines[0].length;

    return maze;
  }

  output = '';
  best = -1;
  scores: number[] = [];
  paths: { [key: string]: number } = {};

  printMaze(maze: Maze, count: number, mazeCount: number) {
    if (!this.output) {
      let output = `Attempt #: ${count}. Remaining: ${mazeCount} [${maze.pos}]                      \n`;

      const posKey = gridCellKey(maze.pos);

      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          const key = gridCellKey([y, x]);
          if (key === maze.end) {
            output = `${output}${'*'.green.bold}`;
          } else if (typeof maze.items.path[key] === 'string') {
            output = `${output}${String(maze.items.path[key]).magenta}`;
          } else if (key === posKey) {
            output = `${output}${maze.direction.red.bold}`;
          } else if (maze.items.walls[key]) {
            output = `${output}${'#'.white}`;
          } else {
            output = `${output}${'.'.grey}`;
          }
        }
        output = `${output} ${y}\n`;
      }

      output += `Status: ${maze.state} | Score: ${maze.score}                                       \n`;

      this.output = output;

      stdout.cursorTo(0, 1);
      stdout.write(output);
    } else {
      stdout.cursorTo(0, 1);
      stdout.write(
        `Attempt #: ${count}                                                             \n`
      );

      stdout.cursorTo(maze.pos[1], maze.pos[0] + 2);
      stdout.write(maze.direction.red);
    }

    stdout.cursorTo(0, maze.height + 3);
    stdout.clearScreenDown();
    this.scores.forEach((score) => {
      console.log(`Score: ${score}`);
    });

    // stdout.cursorTo(0, 1);
    // stdout.clearScreenDown();
    // stdout.write(output + '\n');
  }

  async step1Async() {
    const eastMaze = this.getMaze();
    const northMaze = cloneMaze(eastMaze);
    northMaze.direction = '^';
    // northMaze.score = SCORES.DIRECTION;

    let mazes: Maze[] = [northMaze, eastMaze];
    let mazeKeys: { [key: string]: true } = {};
    let count = 0;

    let maze: Maze | undefined;

    const onAlterate = (maze: Maze) => {
      const key = Object.values(maze.items.path).join('');
      // const hash = createHash('sha256');
      // hash.update(key);
      // const hashKey = hash.digest('hex');
      if (mazeKeys[key]) return;

      mazeKeys[key] = true;
      mazes.push(maze);
    };

    const onCompleted = (maze: Maze) => {
      if (this.best === -1 || maze.score < this.best) {
        this.best = maze.score;
      }

      this.scores.push(maze.score);
    };

    // while (true) {
    //   maze = mazes.pop();

    //   if (!maze) break;

    //   await this.explore(maze, ++count, mazes.length, onAlterate, onCompleted);
    // }

    await this.explore2(eastMaze, 0, 0, onCompleted);
    // await this.explore2(northMaze, ++count, onCompleted);

    stdout.cursorTo(0, eastMaze.height + this.scores.length + 3);
    stdout.clearScreenDown();

    return Promise.resolve(this.best);
  }

  step2() {
    return '';
  }
}

export { Day };
