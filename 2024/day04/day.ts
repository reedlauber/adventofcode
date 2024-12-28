import { DayBase } from '../../utils';

class Day extends DayBase {
  testDir(grid: string[][], [y, x]: [number, number], dy: number, dx: number) {
    const M = grid[y + dy]?.[x + dx] === 'M';
    const A = grid[y + dy * 2]?.[x + dx * 2] === 'A';
    const S = grid[y + dy * 3]?.[x + dx * 3] === 'S';
    return M && A && S ? 1 : 0;
  }

  testUp(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], -1, 0);
  }

  testUpRight(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], -1, 1);
  }

  testRight(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], 0, 1);
  }

  testDownRight(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], 1, 1);
  }

  testDown(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], 1, 0);
  }

  testDownLeft(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], 1, -1);
  }

  testLeft(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], 0, -1);
  }

  testUpLeft(grid: string[][], y: number, x: number) {
    return this.testDir(grid, [y, x], -1, -1);
  }

  testTL_BR(grid: string[][], y: number, x: number) {
    const tl = grid[y - 1]?.[x - 1];
    const br = grid[y + 1]?.[x + 1];
    return (tl === 'M' && br === 'S') || (tl === 'S' && br === 'M');
  }

  testTR_BL(grid: string[][], y: number, x: number) {
    const tr = grid[y - 1]?.[x + 1];
    const bl = grid[y + 1]?.[x - 1];
    return (tr === 'M' && bl === 'S') || (tr === 'S' && bl === 'M');
  }

  testX_Mas(grid: string[][], y: number, x: number) {
    return this.testTL_BR(grid, y, x) && this.testTR_BL(grid, y, x) ? 1 : 0;
  }

  getXs(grid: string[][]) {
    const xs: [y: number, x: number][] = [];
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'X') {
          xs.push([y, x]);
        }
      });
    });
    return xs;
  }

  getAs(grid: string[][]) {
    const xs: [y: number, x: number][] = [];
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'A') {
          xs.push([y, x]);
        }
      });
    });
    return xs;
  }

  getXmases(grid: string[][], xs: [y: number, x: number][]) {
    let count = 0;

    xs.forEach(([y, x]) => {
      count +=
        this.testUp(grid, y, x) +
        this.testUpRight(grid, y, x) +
        this.testRight(grid, y, x) +
        this.testDownRight(grid, y, x) +
        this.testDown(grid, y, x) +
        this.testDownLeft(grid, y, x) +
        this.testLeft(grid, y, x) +
        this.testUpLeft(grid, y, x);
    });

    return count;
  }

  getX_Mases(grid: string[][], as: [y: number, x: number][]) {
    let count = 0;

    as.forEach(([y, x]) => {
      count += this.testX_Mas(grid, y, x);
    });

    return count;
  }

  step1() {
    const grid = this.grid();
    const xs = this.getXs(grid);
    return this.getXmases(grid, xs);
  }

  step2() {
    const grid = this.grid();
    const as = this.getAs(grid);
    return this.getX_Mases(grid, as);
  }
}

export { Day };
