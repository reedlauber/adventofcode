import {
  coordInBounds,
  createGridFromLines,
  DayBase,
  type Direction,
  DIRECTION_MOVES,
  DIRECTION_NEXTS,
  DIRECTION_PREVS,
  DIRECTIONS,
  eachAdjacent,
  eachGrid,
  eachSurrounding,
  type Grid,
  gridCellKey,
  type GridCellKey,
  type GridCoords,
} from '../../utils';

interface Region {
  area: number;
  cells: GridCoords[];
  children: Region[];
  cost: number;
  id: string;
  perimeter: number;
  plant: string;
  ref: { [key: GridCellKey]: true };
  sides: number;
}

export const DIRECTION_LEFT_ADJACENTS: {
  [key in Direction]: [dy: number, dx: number];
} = {
  N: [-1, -1],
  E: [-1, 1],
  S: [1, 1],
  W: [1, -1],
};

class Day extends DayBase {
  getRegionPerimeter(garden: Grid, region: Region) {
    let perimeter = 0;

    region.cells.forEach(([y, x]) => {
      let cellPerimeter = 0;

      eachAdjacent(garden, [y, x], (_, cell) => {
        const key = gridCellKey(cell);
        if (!region.ref[key]) cellPerimeter++;
      });

      perimeter += cellPerimeter;
    });

    return perimeter;
  }

  getRegionSides(garden: Grid, region: Region) {
    if (region.area < 3) {
      return 4;
    }

    const startPlot = region.cells[0];
    const startKey = gridCellKey(startPlot);
    let sides = 1;
    let direction: Direction = 'E';
    let [y, x] = startPlot;

    let iterations = 0;

    while (true) {
      if (startKey === gridCellKey([y, x]) && direction === 'N') {
        // this.log(`Back at start, facing N. Sides: ${sides}`);
        break;
      }

      // this.log(`\nFacing ${direction} from [${[y, x]}]. Sides: ${sides}`);

      const leftDirection: Direction = DIRECTION_PREVS[direction];
      const leftMove = DIRECTION_MOVES[leftDirection];
      const leftPlot: GridCoords = [y + leftMove[0], x + leftMove[1]];
      const leftKey = gridCellKey(leftPlot);

      if (region.ref[leftKey]) {
        y = leftPlot[0];
        x = leftPlot[1];
        direction = leftDirection;
        sides++;
        // this.log(`Check left: ${'found'.green}. Move left. Add side`);
        continue;
      }

      // this.log(`Check left: ${'not found'.red}.`);

      const forwardMove = DIRECTION_MOVES[direction];
      const forwardPlot: GridCoords = [y + forwardMove[0], x + forwardMove[1]];
      const forwardKey = gridCellKey(forwardPlot);

      if (region.ref[forwardKey]) {
        y = forwardPlot[0];
        x = forwardPlot[1];
        // this.log(`Check forward: ${'found'.green}. Move forward`);
      } else {
        direction = DIRECTION_NEXTS[direction];
        sides++;
        // this.log(`Check forward: ${'not found'.red}. Turn right. Add side`);
      }

      if (startKey === gridCellKey([y, x]) && direction === 'N') {
        // this.log(`Back at start, facing N. Sides: ${sides}`);
        break;
      }

      // if (++iterations > 5000) {
      //   this.log('Looping. Stop'.red);
      //   break;
      // }
    }

    return sides;
  }

  getRegionSides2(garden: Grid, region: Region) {
    if (region.cells.length < 3) return 4;

    region.cells.sort((a, b) => {
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      if (a[1] > b[1]) return 1;
      if (a[1] < b[1]) return -1;
      return 0;
    });

    return DIRECTIONS.map((direction) => {
      let sideCount = 0;

      const sidesCache: { [key: string]: true } = {};

      region.cells.forEach(([y, x]) => {
        const cellKey = gridCellKey([y, x]);

        const [dy, dx] = DIRECTION_MOVES[direction];
        const plot: GridCoords = [y + dy, x + dx];
        const key = gridCellKey(plot);
        const cacheKey = `${cellKey}-${direction}`;

        const prevDirection =
          direction === 'N' || direction === 'S' ? 'W' : 'N';
        const [cdy, cdx] = DIRECTION_MOVES[prevDirection];
        const prevPlot: GridCoords = [y + cdy, x + cdx];
        const prevKey = gridCellKey(prevPlot);
        const prevCacheKey = `${prevKey}-${direction}`;

        const isFirst = !sidesCache[prevCacheKey];
        const isEdge = !region.ref[key];

        // if (direction === 'S') {
        //   console.log(
        //     `Cell ${[y, x]}, facing ${direction}. Offset plot: ${plot}${
        //       isEdge ? ' (edge)' : ''
        //     }${
        //       isEdge && isFirst ? ' (counted)' : ''
        //     }. prev plot (${prevDirection}) ${prevKey}. Cache: ${Object.keys(
        //       sidesCache
        //     )}`
        //   );
        // }

        if (isEdge) {
          sidesCache[cacheKey] = true;
        }

        if (isEdge && isFirst) {
          sideCount++;
        }
      });

      // console.log(`Direction ${direction} sides: ${sideCount}`);

      return sideCount;
    }).reduce((acc, n) => acc + n, 0);
  }

  explore(garden: Grid, [y, x]: GridCoords, region: Region): GridCoords[] {
    const matches: GridCoords[] = [];

    DIRECTIONS.forEach((direction) => {
      const [dy, dx] = DIRECTION_MOVES[direction];
      const plot: GridCoords = [y + dy, x + dx];
      const plotPlant = garden.cells[plot[0]]?.[plot[1]] ?? '#';
      const key = gridCellKey(plot);

      if (
        coordInBounds(garden, plot) &&
        plotPlant === region.plant &&
        !region.ref[key]
      ) {
        region.ref[gridCellKey(plot)] = true;
        matches.push(plot, ...this.explore(garden, plot, region));
      }
    });

    return matches;
  }

  isRegionChild(garden: Grid, b: Region, a: Region) {
    let bSurroundsA = true;

    a.cells.forEach(([ay, ax]) => {
      if (!bSurroundsA) return;
      let cellSurrounded = true;

      eachSurrounding(garden, [ay, ax], (plant, [y, x]) => {
        if (!cellSurrounded) return;

        const key = gridCellKey([y, x]);
        if (!a.ref[key] && !b.ref[key]) {
          this.log(`Cell [${key}] not in ${a.plant} or ${b.plant}`);
          cellSurrounded = false;
        }
      });

      if (!cellSurrounded) {
        bSurroundsA = false;
      }
    });

    this.log(`Is ${b.plant} in ${a.plant}? ${bSurroundsA ? 'Yes' : 'No'}\n`);

    return bSurroundsA;
  }

  searchDirectionCache = new Map<string, boolean>();

  searchDirection(
    regions: Region[],
    start: GridCoords,
    direction: Direction,
    plantId: string
  ): boolean {
    const cacheKey = `${start}-${direction}-${plantId}`;
    if (this.searchDirectionCache.has(cacheKey)) {
      return this.searchDirectionCache.get(cacheKey)!;
    }

    let found = false;

    let [y, x] = start;
    const [my, mx] = DIRECTION_MOVES[direction];

    while (true) {
      const next: GridCoords = [y + my, x + mx];
      y = next[0];
      x = next[1];
      const nextKey = gridCellKey(next);
      const nextPlotRegion = regions.find((r) => r.ref[nextKey]);

      if (!nextPlotRegion) {
        break;
      }
      if (nextPlotRegion.id === plantId) {
        found = true;
        break;
      }
    }

    this.searchDirectionCache.set(cacheKey, found);

    return found;
  }

  isRegionChild2(regions: Region[], outer: Region, inner: Region) {
    const xCache: { [key: number]: true } = {};
    const yCache: { [key: number]: true } = {};

    let isChild = true;

    inner.cells.forEach(([y, x]) => {
      if (!isChild) return false;
      if (!xCache[x]) {
        const east = this.searchDirection(regions, [y, x], 'E', outer.id);
        const west = this.searchDirection(regions, [y, x], 'W', outer.id);
        if (east && west) {
          xCache[x] = true;
        } else {
          isChild = false;
          return false;
        }
      }
      if (!yCache[y]) {
        const north = this.searchDirection(regions, [y, x], 'N', outer.id);
        const south = this.searchDirection(regions, [y, x], 'S', outer.id);
        if (north && south) {
          yCache[y] = true;
        } else {
          isChild = false;
          return false;
        }
      }
      return true;
    });

    this.log(
      `Is ${inner.plant} in ${outer.plant}? ${isChild ? 'Yes' : 'No'}\n`
    );

    return isChild;
  }

  getRegionChildren(regions: Region[], region: Region) {
    regions.forEach((r) => {
      if (r.plant === region.plant) return;
      if (this.isRegionChild2(regions, region, r)) {
        region.children.push(r);
      }
    });

    region.sides += region.children.reduce(
      (acc, child) => acc + child.sides,
      0
    );
    region.cost = region.area * region.sides;
  }

  calculateRegionChildren(regions: Region[]) {
    regions.forEach((region) => {
      console.log(`Get inner regions for ${region.id}`);
      this.getRegionChildren(regions, region);
    });
  }

  getRegion(
    garden: Grid,
    searched: { [key: GridCellKey]: true },
    startPlot: GridCoords,
    codeType: 'perimeter' | 'sides' = 'perimeter'
  ) {
    const plant = garden.cells[startPlot[0]][startPlot[1]] ?? '#';

    searched[gridCellKey(startPlot)] = true;

    const region: Region = {
      area: 0,
      cells: [startPlot],
      children: [],
      cost: 0,
      id: '',
      perimeter: 0,
      plant,
      ref: { [gridCellKey(startPlot)]: true },
      sides: 0,
    };

    region.cells.push(...this.explore(garden, startPlot, region));

    region.cells.forEach((cell) => {
      searched[gridCellKey(cell)] = true;
    });

    region.area = region.cells.length;

    if (codeType === 'perimeter') {
      region.perimeter = this.getRegionPerimeter(garden, region);
      region.cost = region.area * region.perimeter;
    }

    if (codeType === 'sides') {
      region.sides = this.getRegionSides2(garden, region);
      region.cost = region.area * region.sides;
    }

    // this.log(region);

    return region;
  }

  getRegions(
    garden: Grid,
    codeType: 'perimeter' | 'sides' = 'perimeter'
  ): Region[] {
    const regions: Region[] = [];

    const searched: { [key: GridCellKey]: true } = {};

    eachGrid(garden, (plant, plot) => {
      if (!plant) return;
      if (searched[gridCellKey(plot)]) return;

      // if (regions.length) return;
      const region = this.getRegion(garden, searched, plot, codeType);
      region.id = `${region.plant}-${regions.length}`;
      regions.push(region);
    });

    return regions;
  }

  printRegion(region: Region) {
    let [y, x] = region.cells[0];
    let [minX, maxX] = region.cells.reduce<[number, number]>(
      (acc, cell) => [Math.min(acc[0], cell[1]), Math.max(acc[1], cell[1])],
      [0, 0]
    );
    let [minY, maxY] = region.cells.reduce<[number, number]>(
      (acc, cell) => [Math.min(acc[0], cell[0]), Math.max(acc[1], cell[0])],
      [0, 0]
    );
    const height = maxY - minY + 1;
    const width = maxX - minX + 1;
    let rowTemplate = '.'.repeat(width);
    let output = [...Array.from(new Array(height)).map(() => rowTemplate)];
    region.cells.forEach((cell, i) => {
      const posY = Math.abs(cell[0] - minY);
      const posX = Math.abs(cell[1] - minX);
      let row = output[posY];
      row = row.substring(0, posX) + region.plant + row.substring(posX + 1);
      output[posY] = row;
    });
    console.log('\n' + output.join('\n') + '\n');
  }

  printRegionSummary(region: Region) {
    console.log(
      `- A region ${region.id} plants with, price ${region.area} * ${region.sides} = ${region.cost}.`
    );
  }

  printRegionSummaries(regions: Region[]) {
    regions.forEach(this.printRegionSummary);
  }

  step1() {
    const garden = createGridFromLines(this.lines);
    const regions = this.getRegions(garden);
    this.printRegionSummaries(regions);
    return regions.reduce((acc, region) => acc + region.cost, 0);
  }

  step2_1() {
    const garden = createGridFromLines(this.lines);
    const regions = this.getRegions(garden, 'sides');
    this.printRegionSummaries(regions);
    this.calculateRegionChildren(regions);
    // const focusRegion = 0;
    // this.printRegionSummary(regions[focusRegion]);
    // this.printRegion(regions[focusRegion]);
    // console.log('Regions:', regions.length);
    // console.log('Regions > 1:', regions.filter((r) => r.area > 1).length);
    return regions.reduce((acc, region) => acc + region.cost, 0);
  }

  step2() {
    const garden = createGridFromLines(this.lines);
    const regions = this.getRegions(garden, 'sides');
    // const focusRegion = 0;
    // this.printRegionSummary(regions[focusRegion]);
    // this.printRegion(regions[focusRegion]);
    this.printRegionSummaries(regions);
    return regions.reduce((acc, region) => acc + region.cost, 0);
  }
}

export { Day };
