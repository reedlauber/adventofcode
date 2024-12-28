import { stdout } from 'node:process';

import {
  DayBase,
  gridCellKey,
  type GridCellKey,
  type GridCoords,
} from '../../utils';

export type Direction = '^' | '>' | 'v' | '<';

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const DIRECTION_MOVES: { [key in Direction]: [dy: number, dx: number] } =
  {
    '^': [-1, 0],
    '>': [0, 1],
    v: [1, 0],
    '<': [0, -1],
  };

interface Board {
  boxes: { [key: GridCellKey]: number };
  height: number;
  robot: GridCoords;
  walls: { [key: GridCellKey]: number };
  width: number;
}

class Day extends DayBase {
  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    super(day, step, isSample, data);

    this.isAsync = step === 2;
  }

  getSpaceOffset(board: Board, start: GridCoords, move: Direction) {
    let offset = 0;

    const [dy, dx] = DIRECTION_MOVES[move];

    let [y, x] = start;

    while (true) {
      y += dy;
      x += dx;

      if (board.walls[`${y},${x}`]) {
        offset = 0;
        break;
      }

      offset++;

      if (!board.boxes[`${y},${x}`]) {
        break;
      }
    }

    return offset;
  }

  moveRobot(board: Board, move: Direction) {
    const [y, x] = board.robot;
    const [dy, dx] = DIRECTION_MOVES[move];
    const [ny, nx] = [y + dy, x + dx];

    const spaceOffset = this.getSpaceOffset(board, board.robot, move);

    if (spaceOffset === 0) {
      return;
    }

    if (spaceOffset > 1) {
      const [offsetY, offsetX] = [y + dy * spaceOffset, x + dx * spaceOffset];

      board.boxes[`${offsetY},${offsetX}`] = 1;
      delete board.boxes[`${ny},${nx}`];
    }

    board.robot = [ny, nx];
  }

  canMoveUVertically(
    board: Board,
    direction: Extract<Direction, '^' | 'v'>,
    surface: GridCoords[],
    depth = 0
  ): [boolean, [GridCoords, GridCoords][]] {
    const [dy] = DIRECTION_MOVES[direction];

    let canMove = true;
    const boxesToMove: [GridCoords, GridCoords][] = [];

    // this.log(
    //   `\nCan move ${direction}? - Depth: ${depth} - Surface: ${surface}`
    // );

    for (let i = 0; i < surface.length; i++) {
      const edge = surface[i];
      const nextEdge: GridCoords = [edge[0] + dy, edge[1]];
      // this.log(
      //   `Checking edge ${direction} ${[edge[0], edge[1]]} -> ${[
      //     nextEdge[0],
      //     nextEdge[1],
      //   ]}`
      // );
      const nextEdgeKey = gridCellKey(nextEdge);

      if (board.walls[nextEdgeKey]) {
        // this.log(`Found wall ${direction} ${[edge[0], edge[1]]}`);
        return [false, []];
      }

      const nextBox = board.boxes[nextEdgeKey];

      if (nextBox) {
        canMove = false;
        const leftX = nextBox === 2 ? edge[1] : edge[1] - 1;
        const rightX = nextBox === 2 ? edge[1] + 1 : edge[1];

        // this.log(
        //   `Found box ${direction} ${[nextEdge[0], nextEdge[1]]} ([${[
        //     edge[0] + dy,
        //     leftX,
        //   ]}][${[edge[0] + dy, rightX]}])`
        // );

        boxesToMove.push([
          [nextEdge[0], leftX],
          [nextEdge[0], rightX],
        ]);
      }
    }

    if (boxesToMove.length > 0) {
      let allBoxesCanMove = true;

      boxesToMove.forEach((nextBox) => {
        const [nextCanMoveUVertically, nextBoxesToMove] =
          this.canMoveUVertically(board, direction, nextBox, depth + 1);

        if (!nextCanMoveUVertically) {
          allBoxesCanMove = false;
        } else {
          boxesToMove.push(...nextBoxesToMove);
        }
      });

      canMove = allBoxesCanMove;
    }

    return [canMove, boxesToMove];
  }

  moveRobotDoubleWidth(board: Board, move: Direction) {
    const [y, x] = board.robot;
    const [dy, dx] = DIRECTION_MOVES[move];
    const [ny, nx] = [y + dy, x + dx];

    if (move === '>') {
      const spaceOffset = this.getSpaceOffset(board, board.robot, move);

      // this.log('Move >, space offset:', spaceOffset);

      if (spaceOffset === 0) {
        return;
      }

      if (spaceOffset > 1) {
        for (let i = x + 1; i < x + spaceOffset; i += 2) {
          delete board.boxes[`${ny},${x}`];
          delete board.boxes[`${ny},${x + 1}`];
          board.boxes[`${y},${i + 1}`] = 2;
          board.boxes[`${y},${i + 2}`] = 3;
        }
      }

      board.robot = [ny, nx];
    } else if (move === '<') {
      const spaceOffset = this.getSpaceOffset(board, board.robot, move);

      // this.log('Move <, space offset:', spaceOffset);

      if (spaceOffset === 0) {
        return;
      }

      if (spaceOffset > 1) {
        for (let i = x - 2; i >= x - spaceOffset; i -= 2) {
          delete board.boxes[`${ny},${i}`];
          delete board.boxes[`${ny},${i + 1}`];
        }
        for (let i = x - 2; i >= x - spaceOffset; i -= 2) {
          board.boxes[`${ny},${i - 1}`] = 2;
          board.boxes[`${ny},${i}`] = 3;
        }
      }

      board.robot = [ny, nx];
    } else if (move === '^') {
      const [canMove, boxesToMove] = this.canMoveUVertically(board, move, [
        board.robot,
      ]);

      if (!canMove) {
        return;
      }

      boxesToMove.forEach((box) => {
        const leftKey = gridCellKey(box[0]);
        const rightKey = gridCellKey(box[1]);

        if (board.boxes[leftKey]) {
          delete board.boxes[leftKey];
        }

        if (board.boxes[rightKey]) {
          delete board.boxes[rightKey];
        }
      });

      boxesToMove.forEach((box) => {
        const leftKey = gridCellKey([box[0][0] - 1, box[0][1]]);
        const rightKey = gridCellKey([box[1][0] - 1, box[1][1]]);
        board.boxes[leftKey] = 2;
        board.boxes[rightKey] = 3;
      });

      board.robot = [ny, nx];
    } else if (move === 'v') {
      const [canMove, boxesToMove] = this.canMoveUVertically(board, move, [
        board.robot,
      ]);

      if (!canMove) {
        return;
      }

      boxesToMove.forEach((box) => {
        const leftKey = gridCellKey(box[0]);
        const rightKey = gridCellKey(box[1]);

        if (board.boxes[leftKey]) {
          delete board.boxes[leftKey];
        }

        if (board.boxes[rightKey]) {
          delete board.boxes[rightKey];
        }
      });

      boxesToMove.forEach((box) => {
        const leftKey = gridCellKey([box[0][0] + 1, box[0][1]]);
        const rightKey = gridCellKey([box[1][0] + 1, box[1][1]]);
        board.boxes[leftKey] = 2;
        board.boxes[rightKey] = 3;
      });

      board.robot = [ny, nx];
    }
  }

  async performMoves(
    board: Board,
    moves: Direction[],
    size: 1 | 2,
    onMove: (board: Board, move: Direction, index: number) => Promise<boolean>
  ) {
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];

      if (size === 1) {
        this.moveRobot(board, move);
      } else {
        this.moveRobotDoubleWidth(board, move);
      }

      const result = await onMove(board, move, i);

      if (!result) {
        break;
      }
    }
  }

  parseInput(size: 1 | 2 = 1): [Board, Direction[]] {
    const [boardRaw, movesRaw] = this.data.split('\n\n');

    const boardLines = boardRaw.split('\n');
    let width = boardLines[0].length;

    if (size === 2) {
      width = width * 2;
    }

    const board: Board = {
      boxes: {},
      height: boardLines.length,
      robot: [0, 0],
      walls: {},
      width,
    };

    boardLines.forEach((line, y) => {
      let xOffset = -1;
      line.split('').forEach((cell, x) => {
        if (size === 2) {
          xOffset++;
        }

        if (cell === '#') {
          if (size === 2) {
            board.walls[`${y},${x + xOffset}`] = 2;
            board.walls[`${y},${x + xOffset + 1}`] = 3;
          } else {
            board.walls[`${y},${x}`] = 1;
          }
        } else if (cell === 'O') {
          if (size === 2) {
            board.boxes[`${y},${x + xOffset}`] = 2;
            board.boxes[`${y},${x + xOffset + 1}`] = 3;
          } else {
            board.boxes[`${y},${x}`] = 1;
          }
        } else if (cell === '@') {
          board.robot = [y, x + xOffset];
        }
      });
    });

    return [board, movesRaw.split('\n').join('').split('') as Direction[]];
  }

  printBoard(board: Board) {
    let output = '';

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const wall = board.walls[`${y},${x}`];

        if (wall) {
          output += '#';
          continue;
        }

        const box = board.boxes[`${y},${x}`];

        if (box) {
          output += box === 2 ? '[' : box === 3 ? ']' : 'O';
          continue;
        }

        if (board.robot[0] === y && board.robot[1] === x) {
          output = `${output}${'@'.green.bold}`;
          continue;
        }

        output += '.';
      }

      output += '\n';
    }

    this.log(output);
  }

  printMovesSegment(moves: Direction[], focus: number) {
    let output = '';
    let start = focus > 3 ? focus - 4 : 0;
    let end = moves.length - 1 - focus < 4 ? moves.length - 1 : focus + 4;

    if (focus === 1) {
      output += '.';
    }
    if (focus === 2) {
      output += '..';
    }
    if (focus > 2) {
      output += '...';
    }

    for (let i = start; i < end; i++) {
      const move = moves[i] ?? ('' as string);
      output = `${output}${i === focus ? move.green.bold : move}`;
    }

    if (focus < moves.length - 3) {
      output += '...';
    }

    this.log(output);
  }

  getGPSSum(board: Board) {
    return Object.entries(board.boxes).reduce((acc, box) => {
      const [coords, value] = box;
      if (value === 3) return acc;
      const [y, x] = coords.split(',').map(Number);
      return acc + (100 * y + x);
    }, 0);
  }

  step1() {
    const size = 1;
    const [board, moves] = this.parseInput(size);
    this.performMoves(board, moves, size, (board, move) => {
      this.log(`Move ${move}:`);
      this.printBoard(board);
      return Promise.resolve(true);
    });
    return this.getGPSSum(board);
  }

  async step2Async() {
    const size = 2;
    const [board, moves] = this.parseInput(size);
    this.printBoard(board);
    const range = [320, 700] as const;
    await this.performMoves(board, moves, size, async (board, move, i) => {
      // if (i >= range[0] && i < range[1]) {
      //   stdout.cursorTo(0, 0);
      //   stdout.clearScreenDown();
      //   stdout.write(`Move ${i}:`);
      //   // this.log(`${i}. Move ${move}:`);
      //   this.printMovesSegment(moves, i);
      //   this.printBoard(board);
      //   await sleep(400);
      // }

      return Promise.resolve(true);
    });

    return this.getGPSSum(board);
  }
}

export { Day };
