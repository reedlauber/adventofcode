import {
  cloneGrid,
  coordInBounds,
  createGridFromLines,
  DayBase,
  eachGrid,
  printGrid,
  type Grid,
  type GridCoords,
} from '../../utils';

interface MapLocation {}

interface AntennaLocations {
  [key: string]: GridCoords[];
}

class Day extends DayBase {
  getAntennaLocations(grid: Grid) {
    const locations: AntennaLocations = {};

    eachGrid(grid, (cell, coords) => {
      if (!cell || cell === '.') return;

      if (!locations[cell]) {
        locations[cell] = [];
      }

      locations[cell].push(coords);
    });

    return locations;
  }

  getAntinodeLocations(grid: Grid, a: GridCoords, b: GridCoords): GridCoords[] {
    const locations: GridCoords[] = [];

    const dy = b[0] - a[0];
    const dx = b[1] - a[1];

    const ant1: GridCoords = [a[0] - dy, a[1] - dx];
    const ant2: GridCoords = [b[0] + dy, b[1] + dx];

    if (coordInBounds(grid, ant1)) {
      locations.push(ant1);
    }

    if (coordInBounds(grid, ant2)) {
      locations.push(ant2);
    }

    this.log(a, b, 'ant1', ant1, 'ant2', ant2);

    return locations;
  }

  getResonantAntinodeLocations(
    grid: Grid,
    a: GridCoords,
    b: GridCoords
  ): GridCoords[] {
    const locations: GridCoords[] = [];

    const dy = b[0] - a[0];
    const dx = b[1] - a[1];

    this.log('get antennas for', a, b, `(${dy}, ${dx})`);

    // Direction 1 antinodes
    let multiplier = 1;
    while (true) {
      const antenna: GridCoords = [
        a[0] - dy * multiplier,
        a[1] - dx * multiplier,
      ];
      this.log('check antenna', antenna);

      if (coordInBounds(grid, antenna)) {
        locations.push(antenna);
      } else {
        break;
      }

      multiplier++;
    }

    // Direction 2 antinodes
    multiplier = 1;
    while (true) {
      const antenna: GridCoords = [
        a[0] + dy * multiplier,
        a[1] + dx * multiplier,
      ];

      if (coordInBounds(grid, antenna)) {
        locations.push(antenna);
      } else {
        break;
      }

      multiplier++;
    }

    // const ant1: GridCoords = [a[0] - dy, a[1] - dx];
    // const ant2: GridCoords = [b[0] + dy, b[1] + dx];

    // if (coordInBounds(grid, ant1)) {
    //   locations.push(ant1);
    // }

    // if (coordInBounds(grid, ant2)) {
    //   locations.push(ant2);
    // }

    this.log(a, b, locations);

    return locations;
  }

  calculateAntinodes(grid: Grid, antennaLocations: AntennaLocations) {
    const newGrid = cloneGrid(grid);

    // this.log('antennaLocations', antennaLocations);

    Object.entries(antennaLocations).forEach(([antenna, locations]) => {
      locations.forEach((a) => {
        locations
          .filter((loc) => loc[0] !== a[0] && loc[1] !== a[1])
          .forEach((b) => {
            this.getResonantAntinodeLocations(grid, a, b).forEach(([y, x]) => {
              newGrid.cells[y][x] = '#';
            });
          });
      });
    });

    printGrid(newGrid);

    return newGrid;
  }

  getAntinodeCount(grid: Grid) {
    let count = 0;

    eachGrid(grid, (cell) => {
      if (cell === '#') {
        count++;
      }
    });

    return count;
  }

  step1() {
    const grid = createGridFromLines(this.lines);
    const locations = this.getAntennaLocations(grid);
    const gridWithAntinodes = this.calculateAntinodes(grid, locations);
    return this.getAntinodeCount(gridWithAntinodes);
  }

  step2() {
    const grid = createGridFromLines(this.lines);
    const locations = this.getAntennaLocations(grid);
    const gridWithAntinodes = this.calculateAntinodes(grid, locations);
    return this.getAntinodeCount(gridWithAntinodes);
  }
}

export { Day };
