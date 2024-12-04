import { createGridFromLines, DayBase, eachGrid, eachSurrounding, type Grid, type GridCoords } from '../../utils';

const isDigit = (char: string) => /[\d]/.test(char);
const isSymbol = (char: string) => char !== '.' && !isDigit(char);

const extractPartNumber = (grid: Grid, [y, x]: GridCoords): number => {
  let number = '';
  let pos = x;

  while (isDigit(grid.cells[y]?.[pos] ?? '')) {
    pos -= 1;
  }

  // pos will end up one too small
  pos += 1;

  while (isDigit(grid.cells[y]?.[pos] ?? '')) {
    number += grid.cells[y][pos];
    grid.cells[y][pos] = 'X'; // Prevent counting numbers twice
    pos += 1;
  }

  return Number(number) || 0;
};

class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase> ) {
    super(...args);
  }

  step1() {
    const grid = createGridFromLines(this.lines);
    const parts: number[] = [];

    eachGrid(grid, (item, [y, x]) => {
      if (item && isSymbol(item)) {
        eachSurrounding(grid, [y, x], (adjItem, adjCoords) => {
          if (adjItem && isDigit(adjItem)) {
            parts.push(extractPartNumber(grid, adjCoords));
          }
        });
      }
    });

    return parts.reduce((acc, p) => acc + p, 0);
  };

  step2() {
    const grid = createGridFromLines(this.lines);
    const gears: number[] = [];

    eachGrid(grid, (item, coord) => {
      if (item === '*') {
        const adjNums: number[] = [];
        eachSurrounding(grid, coord, (adjItem, adjCoords) => {
          if (adjItem && isDigit(adjItem)) {
            adjNums.push(extractPartNumber(grid, adjCoords));
          }
        });
        if (adjNums.length === 2) {
          gears.push(adjNums[0] * adjNums[1]);
        }
      }
    });

    return gears.reduce((acc, p) => acc + p, 0);
  };
}


export { Day };
