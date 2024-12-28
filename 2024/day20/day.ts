import {
  DayBase,
  Direction,
  DIRECTION_ARROWS,
  DIRECTION_MOVES,
  DIRECTIONS,
  getDirectionCell,
  gridCellKey,
  type GridCellKey,
  type GridCoords,
  type LookupGrid,
} from '../../utils';

type CheatKey = `${GridCellKey}->${GridCellKey}`;

interface Cheat {
  diff: number;
  end: GridCellKey;
  endDistance: number;
  key: CheatKey;
  start: GridCellKey;
  startDistance: number;
}

interface TrackNode {
  coord: GridCoords;
  distance: number;
  key: GridCellKey;
  nextSpace?: GridCellKey;
  spaces: GridCellKey[];
  type: 'space' | 'wall';
  walls: GridCellKey[];
}

interface Track extends LookupGrid<true | number | TrackNode> {
  cheats: Cheat[];
  distance: number;
  end: GridCoords;
  endKey: GridCellKey;
  longCheats: Cheat[];
  nodes: { [key: GridCellKey]: TrackNode };
  path: { [key: GridCellKey]: GridCellKey };
  start: GridCoords;
  startKey: GridCellKey;
}

class Day extends DayBase {
  cheatKeys: { [key: CheatKey]: number } = {};

  printTrackCell(track: Track, coord: GridCoords) {
    const key = gridCellKey(coord);

    if (track.endKey === key) {
      return 'E'.magenta;
    }
    if (track.startKey === key) {
      return 'S'.magenta;
    }
    if (track.items.cheats[key] === 1) {
      return '#'.green;
    }
    if (track.items.cheats[key] === 2) {
      return '#'.red;
    }
    if (track.items.walls[key]) {
      return '#'.grey;
    }
    // if (track.items.distances[key]) {
    //   const d = track.items.distances[key] as number;
    //   const ds = String(d);
    //   return ds[0];
    //   // return ds[ds.length - 1];
    // }
    return '.';
  }

  printTrack(track: Track) {
    let output = '';

    for (let y = 0; y < track.height; y++) {
      for (let x = 0; x < track.width; x++) {
        output = `${output}${this.printTrackCell(track, [y, x])}`;
      }

      output = `${output} ${y}\n`;
    }

    console.log(output);
  }

  printSummary(track: Track) {
    const groups = track.longCheats.reduce<{ [key: number]: number }>(
      (acc, c) => {
        acc[c.diff] = acc[c.diff] ?? 0;
        acc[c.diff] += 1;

        return acc;
      },
      {}
    );

    let arr = Object.entries(groups)
      .reduce<[number, number][]>((acc, [k, v]) => {
        return [...acc, [Number(k), v]];
      }, [])
      .sort((a, b) => {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
        return 0;
      });

    let output = '';

    arr.forEach(([diff, count]) => {
      const articleTxt = count === 1 ? 'is' : 'are';
      const cheatsTxt = count === 1 ? 'cheat' : 'cheats';
      const savesTxt = count === 1 ? 'saves' : 'save';
      output = `${output}- There ${articleTxt} ${count} ${cheatsTxt} that ${savesTxt} ${diff} picoseconds.\n`;
    });

    output = `${output}From ${
      Object.keys(track.items.cheats).length
    } initial cheats\n`;
    output = `${output}Totaling ${track.cheats.length} final cheats\n`;

    console.log(output);
  }

  getNodeAdjacents(track: Track, pos: GridCoords, posKey: GridCellKey) {
    for (let d of DIRECTIONS) {
      const adj = getDirectionCell(pos, d);
      const adjKey = gridCellKey(adj);
      const adjNode = track.nodes[adjKey];

      if (!adjNode) continue;

      if (adjNode.type === 'space') {
        track.nodes[posKey]?.spaces.push(adjKey);
      }

      if (adjNode.type === 'wall') {
        track.nodes[posKey]?.walls.push(adjKey);
      }
    }
  }

  getAdjacents(track: Track) {
    for (let y = 0; y < track.height; y++) {
      for (let x = 0; x < track.width; x++) {
        const pos: GridCoords = [y, x];
        const posKey = gridCellKey(pos);
        this.getNodeAdjacents(track, pos, posKey);
      }
    }
  }

  getPath(track: Track) {
    let pos: GridCoords = [...track.start];
    let posKey = gridCellKey(pos);

    track.nodes[posKey].distance = 0;

    track.items.distances[track.startKey] = 0;

    let distance = 0;

    while (true) {
      const node = track.nodes[posKey];

      if (!node) break;

      const spaces = node.spaces.filter((spaceKey) => !track.path[spaceKey]);

      if (spaces.length !== 1) {
        console.log(`Finding path broke down at ${posKey}`);
        break;
      }

      const nextKey = spaces[0];

      track.nodes[posKey].nextSpace = nextKey;
      track.path[posKey] = nextKey;

      track.nodes[nextKey].distance = ++distance;

      if (track.endKey === nextKey) break;

      posKey = nextKey;
    }
  }

  getNextSpace(
    track: Track,
    pos: GridCoords
  ): [GridCoords | undefined, GridCellKey | undefined] {
    let next: GridCoords | undefined;
    let nextKey: GridCellKey | undefined;

    for (let d of DIRECTIONS) {
      next = getDirectionCell(pos, d);
      nextKey = gridCellKey(next);

      if (
        track.items.spaces[nextKey] &&
        !track.items.distances[nextKey] &&
        nextKey !== track.startKey
      ) {
        break;
      }
    }

    return [next, nextKey];
  }

  addSimpleCheat(
    track: Track,
    start: TrackNode,
    end: TrackNode,
    distance: number
  ) {
    const key: CheatKey = `${start.key}->${end.key}`;
    const altKey: CheatKey = `${end.key}->${start.key}`;

    if (this.cheatKeys[key] && this.cheatKeys[key] > distance) return;
    if (this.cheatKeys[key]) {
      this.cheatKeys[key] = distance;
      return;
    }

    if (this.cheatKeys[altKey] && this.cheatKeys[altKey] > distance) return;
    if (this.cheatKeys[altKey]) {
      this.cheatKeys[altKey] = distance;
      return;
    }

    this.cheatKeys[key] = distance;

    track.longCheats.push({
      diff: distance,
      end: end.key,
      endDistance: end.distance,
      key,
      start: start.key,
      startDistance: start.distance,
    });
  }

  addCheat(track: Track, a: GridCellKey, b: GridCellKey) {
    if (!track.nodes[a] || !track.nodes[b]) return;

    const aDistance = track.nodes[a].distance;
    const bDistance = track.nodes[b].distance;

    if (typeof aDistance !== 'number' || typeof bDistance !== 'number') {
      console.log(`Invalid cheat distance a:(${aDistance}) b:(${bDistance})`);
      return;
    }

    const aGreater = aDistance > bDistance;
    const diff = (aGreater ? aDistance - bDistance : bDistance - aDistance) - 2;
    const start = aGreater ? b : a;
    const startDistance = aGreater ? bDistance : aDistance;
    const end = aGreater ? a : b;
    const endDistance = aGreater ? aDistance : bDistance;
    const key: CheatKey = `${start}->${end}`;

    if (this.cheatKeys[key]) return;

    this.cheatKeys[key] = diff;

    const cheat: Cheat = {
      diff,
      end,
      endDistance,
      key,
      start,
      startDistance,
    };

    if (this.step === 1) {
      track.cheats.push(cheat);
    } else {
      track.longCheats.push(cheat);
    }

    // track.items.cheats[wall] = cheatType;
  }

  getCheats(track: Track) {
    Object.keys(track.items.walls).forEach((wallKey) => {
      const wall: GridCoords = wallKey.split(',').map(Number) as GridCoords;
      const adjacents: [GridCellKey, GridCellKey, GridCellKey, GridCellKey] = [
        gridCellKey(getDirectionCell(wall, 'N')),
        gridCellKey(getDirectionCell(wall, 'S')),
        gridCellKey(getDirectionCell(wall, 'E')),
        gridCellKey(getDirectionCell(wall, 'W')),
      ];

      this.addCheat(track, adjacents[0], adjacents[1]);
      this.addCheat(track, adjacents[2], adjacents[3]);
    });
  }

  getNearbyNodes(track: Track, start: TrackNode) {
    for (let yoff = -20; yoff < 20; yoff++) {
      for (let xoff = -20; xoff < 20; xoff++) {
        const y = start.coord[0] + yoff;
        const x = start.coord[1] + xoff;
        const nodeCoord: GridCoords = [y, x];
        const nodeKey = gridCellKey(nodeCoord);
        const node = track.nodes[nodeKey];

        if (!node || node.key === start.key || node.type === 'wall') {
          continue;
        }

        const cartDist =
          Math.abs(start.coord[0] - y) + Math.abs(start.coord[1] - x);
        const diff = node.distance - start.distance;

        if (cartDist > 20 || diff <= cartDist) continue;

        const savings = diff - cartDist + 1;

        // if (start.key === '3,1' && node.key === '2,1') {
        //   console.log(`3,1->2,1 | cartesian = ${cartDist} | diff = ${diff}`);
        // }

        this.addSimpleCheat(track, start, node, savings);
      }
    }
  }

  getLongCheats(track: Track) {
    Object.values(track.nodes).forEach((node) => {
      if (node.type === 'wall') return;
      this.getNearbyNodes(track, node);
    });
  }

  getInput() {
    const track: Track = {
      cheats: [],
      distance: 0,
      end: [-1, -1],
      endKey: '-1,-1',
      height: this.lines.length,
      items: {
        cheats: {},
        distances: {},
        spaces: {},
        walls: {},
      },
      longCheats: [],
      nodes: {},
      path: {},
      start: [-1, -1],
      startKey: '-1,-1',
      width: this.lines[0].length,
    };

    this.lines.forEach((line, y) => {
      line.split('').forEach((cell, x) => {
        // Skip edges
        if (
          y === 0 ||
          y === track.height - 1 ||
          x === 0 ||
          x === track.width - 1
        ) {
          return;
        }

        const coord: GridCoords = [y, x];
        const key = gridCellKey(coord);
        let nodeType: 'space' | 'wall' = 'space';

        if (cell === '#') {
          nodeType = 'wall';
          track.items.walls[key] = true;
        } else {
          track.items.spaces[key] = true;

          if (cell === 'E') {
            track.end = coord;
            track.endKey = key;
          } else if (cell === 'S') {
            track.start = coord;
            track.startKey = key;
          }
        }

        track.nodes[key] = {
          coord,
          distance: -1,
          key,
          spaces: [],
          type: nodeType,
          walls: [],
        };
      });
    });

    this.getAdjacents(track);
    this.getPath(track);
    if (this.step === 1) {
      this.getCheats(track);
    }

    track.distance = (track.items.distances[track.endKey] as number) ?? -1;

    return track;
  }

  step1() {
    const min = this.isSample ? 64 : 100;
    const track = this.getInput();
    return track.cheats.filter((c) => c.diff >= min).length;
  }

  step2() {
    const min = this.isSample ? 50 : 100;
    const track = this.getInput();
    this.getLongCheats(track);
    // this.printSummary(track);
    // this.printTrack(track);
    // return track.longCheats.length;
    return track.longCheats.filter((c) => c.diff >= min).length;
  }
}

export { Day };
