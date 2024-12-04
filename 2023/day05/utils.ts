import { DayBase } from '../../utils';

interface CategoryMapping {
  destStart: number;
  srcStart: number;
  srcEnd: number;
  rangeSize: number;
}

interface Category {
  id: string;
  dest: string;
  src: string;
  maps: CategoryMapping[];
}

interface SeedLocation {
  seed: number;
  location: number;
  path: Array<{ type: string; value: number }>;
}

class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase> ) {
    super(...args);
  }

  getRangedSeeds = (seedNums: number[]) => {
    const seeds: number[] = [];

    const pairs: [number, number][] = [];

    for (let i = 0; i < seedNums.length; i++) {
      if (i % 2 !== 0) {
        pairs.push([seedNums[i-1], seedNums[i]]);
      }
    }

    pairs.forEach(([start, len]) => {
      for (let i = 0; i < len; i++) {
        seeds.push(start + i);
      }
    });

    return seeds;
  };

  getInfo = (): [number[], number[], Category[]] => {
    const [seedsRaw, ...sectionsRaw] = this._data.split('\n\n');
    const seeds = seedsRaw.split(': ')[1].split(' ').map(Number);

    // const rangedSeeds = this.getRangedSeeds(seeds);

    const categories = sectionsRaw.map<Category>((sectionRaw) => {
      const [titleRaw, ...mappingsRaw] = sectionRaw.split('\n');
      const [src, dest] = titleRaw.split(' map')[0].split('-to-');

      const id = `${src}-to-${dest}`;

      const maps = mappingsRaw.map<CategoryMapping>((mappingRow) => {
        const [destStart, srcStart, rangeSize] = mappingRow.split(' ').map(Number);
        const srcEnd = srcStart + rangeSize;

        return { destStart, srcStart, srcEnd, rangeSize };
      });

      const map: Category = { id, dest, src, maps };

      return map;
    });

    return [seeds, [], categories];
  };

  getDestValue = (srcValue: number, destMappings: CategoryMapping[]) => {
    let dest: number = srcValue;

    for (let i = 0, len = destMappings.length; i < len; i++) {
      const mapping = destMappings[i];
      
      if (srcValue >= mapping.srcStart && srcValue <= mapping.srcEnd) {
        const dist = srcValue - mapping.srcStart;
        dest = mapping.destStart + dist;
        break;
      }
    }

    return dest;
  };

  getSeedLocation = (seed: number, categories: Category[]): [number, SeedLocation['path']] => {
    let mapId = 'seed';
    let map: Category | undefined;
    let destValue = seed;

    // const path: SeedLocation['path'] = [{ type: mapId, value: seed }];

    while(mapId !== 'location') {
      map = categories.find((cat) => cat.src === mapId);
      
      if (map) {
        const srcVal = destValue;

        destValue = this.getDestValue(destValue, map.maps);
        
        console.log(`Looking up ${map.dest} value for ${mapId}:${srcVal} ... ${destValue}`);
        
        mapId = map.dest;

        // path.push({ type: mapId, value: destValue });
      } else {
        break;
      }
    }

    return [destValue, []];
  };

  getSeedLocations = (seeds: number[], categories: Category[]) => {
    return seeds.map<SeedLocation>((seed) => {
      const [location, path] = this.getSeedLocation(seed, categories);
      return { seed, location, path };
    });
  };

  printSeedLocationPaths = (seedLocations: SeedLocation[]) => {
    seedLocations.forEach((seedLocation) => {
      const path = seedLocation.path.map(({type, value}) => `[${type}:${value}]`).join(' -> ');
      console.log(path);
    });
  };

  getLowest = (seedNums: number[], categories: Category[]) => {
    let lowest = Number.MAX_VALUE;

    for (let i = 0; i < seedNums.length; i++) {
      if (i % 2 !== 0) {
        const start = seedNums[i - 1];
        const len = seedNums[i];

        for (let s = 0; s < len; s++) {
          const seed = start + s;
          const [location] = this.getSeedLocation(seed, categories);
          // console.log(`Get location for seed: ${seed} ... ${location}`);

          if (location < lowest) {
            lowest = location;
          }
        }
      }
    }

    return lowest;
  };

  overlap = (r1: [number, number], r2: [number, number]) => {
    return (r1[0] < r2[1] && r1[1] > r2[0]) || (r1[0] > r2[1] && r1[1] < r2[1]);
  };

  getLowest2 = (seedNums: number[], categories: Category[]) => {
    let lowest = Number.MAX_VALUE;

    for (let i = 0; i < seedNums.length; i++) {
      if (i % 2 !== 0) {
        const start = seedNums[i - 1];
        const len = seedNums[i];

        for (let s = 0; s < len; s++) {
          const seed = start + s;
          const [location] = this.getSeedLocation(seed, categories);
          // console.log(`Get location for seed: ${seed} ... ${location}`);

          if (location < lowest) {
            lowest = location;
          }
        }
      }
    }

    return lowest;
  };

  step1() {
    const [seeds, , categories] = this.getInfo();
    const locations = this.getSeedLocations(seeds, categories);
    return Math.min(...locations.map((l) => l.location));
  };

  step2() {
    const [seeds, rangedSeeds, categories] = this.getInfo();
    return this.getLowest(seeds, categories);
    // const locations = this.getSeedLocations(rangedSeeds, categories);
    // this.printSeedLocationPaths(locations);
    // return Math.min(...locations.map((l) => l.location));
  };
}


export { Day };
