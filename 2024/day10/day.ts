import {
  coordInBounds,
  createNumberGridFromLines,
  DayBase,
  eachGrid,
  GridCoords,
  type Grid,
} from '../../utils';

type Direction = 'N' | 'E' | 'S' | 'W';

const DIRECTION_MOVES: { [key in Direction]: GridCoords } = {
  N: [-1, 0],
  E: [0, 1],
  S: [1, 0],
  W: [0, -1],
};

class Day extends DayBase {
  getTrailheads(grid: Grid<number>): GridCoords[] {
    const trailHeads: GridCoords[] = [];
    eachGrid<number>(grid, (item, coords) => {
      if (item === 0) {
        trailHeads.push(coords);
      }
    });
    return trailHeads;
  }

  // 1 = summit found
  // 0 = no summit
  // -1 = still moving

  fanout(
    grid: Grid<number>,
    position: GridCoords,
    summits: { [key: `${number},${number}`]: true },
    depth = 0
  ): number {
    return (
      this.walkTrail(grid, position, 'N', summits, depth) +
      this.walkTrail(grid, position, 'E', summits, depth) +
      this.walkTrail(grid, position, 'S', summits, depth) +
      this.walkTrail(grid, position, 'W', summits, depth)
    );
  }

  walkTrail(
    grid: Grid<number>,
    [y, x]: GridCoords,
    direction: Direction,
    summits: { [key: `${number},${number}`]: true },
    depth: number
  ): number {
    const el = grid.cells[y]?.[x] ?? 10;
    const move = DIRECTION_MOVES[direction];
    const next: GridCoords = [y + move[0], x + move[1]];

    const indent = ' '.repeat(depth);

    if (!coordInBounds(grid, next)) {
      // this.log(
      //   `${indent}${direction}: [${y},${x}]->[${next[0]},${next[1]}] :: x`
      // );
      return 0;
    }

    const nextEl = grid.cells[next[0]]?.[next[1]] ?? -1;
    const elDiff = nextEl - el;

    if (elDiff !== 1) {
      // this.log(
      //   `${indent}${direction}: [${y},${x}]->[${next[0]},${next[1]}] :: <`
      // );
      return 0;
    }

    if (nextEl === 9) {
      // const summitKey: `${number},${number}` = `${next[0]},${next[1]}`;
      // if (summits[summitKey]) {
      //   // this.log(
      //   //   `${indent}${direction}: [${y},${x}]->[${next[0]},${next[1]}] :: 9+`
      //   // );
      //   return 0;
      // }
      // summits[summitKey] = true;
      // // this.log(
      // //   `${indent}${direction}: [${y},${x}]->[${next[0]},${next[1]}] :: 9-`
      // // );
      return 1;
    }

    // this.log(`${indent}${direction}: [${y},${x}]->[${next[0]},${next[1]}]`);

    return this.fanout(grid, next, summits, depth + 1);
  }

  getTrailSummitCount(grid: Grid<number>, trailHead: GridCoords): number {
    const summits: { [key: `${number},${number}`]: true } = {};
    const count = this.fanout(grid, trailHead, summits);
    this.log('Trailhead:', trailHead, count);
    return count;
  }

  getTrailheadSummitCounts(): number[] {
    const grid = createNumberGridFromLines(this.lines);
    const trailHeads = this.getTrailheads(grid);

    return trailHeads.map<number>((trailHead) =>
      this.getTrailSummitCount(grid, trailHead)
    );
  }

  step1() {
    return this.getTrailheadSummitCounts().reduce(
      (acc, count) => acc + count,
      0
    );
  }

  step2() {
    return this.getTrailheadSummitCounts().reduce(
      (acc, count) => acc + count,
      0
    );
  }
}

export { Day };
