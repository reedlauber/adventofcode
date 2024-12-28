import {
  DayBase,
  DIRECTION_MOVES,
  DIRECTIONS,
  getAdjacentCell,
  gridCellKey,
  GridCellKey,
  GridCoords,
  LookupGridCollection,
  type LookupGrid,
} from '../../utils';

interface Room extends LookupGrid {
  end: GridCoords;
  endKey: GridCellKey;
  start: GridCoords;
  startKey: GridCellKey;
}

interface Visit {
  key: GridCellKey;
  pos: GridCoords;
  visited: LookupGridCollection<true>;
}

class Day extends DayBase {
  printRoom(room: Room) {
    let output = '';
    for (let y = 0; y <= room.height; y++) {
      for (let x = 0; x <= room.width; x++) {
        const key = gridCellKey([y, x]);
        let c = '.';
        if (key === room.endKey) {
          c = 'E';
        } else if (key === room.startKey) {
          c = 'S';
        } else if (room.items.walls[key]) {
          c = '#';
        }
        output = `${output}${c}`;
      }
      output = `${output} ${y}\n`;
    }
    console.log(output);
  }

  printDistances(room: Room, nodes: LookupGridCollection<number>) {
    let output = '';
    for (let y = 0; y <= room.height; y++) {
      for (let x = 0; x <= room.width; x++) {
        const key = gridCellKey([y, x]);
        let char = '.. ';
        if (room.items.walls[key]) {
          char = '## ';
        } else if (nodes[key] === Number.POSITIVE_INFINITY) {
          char = 'ii ';
        } else if (typeof nodes[key] === 'number') {
          char = `${nodes[key]} `.padStart(3, '0');
        }
        output = `${output}${char}`;
      }
      output = `${output}| ${y}\n`;
    }
    console.log(output);
  }

  getInput(size: number): [Room, GridCoords[]] {
    const room: Room = {
      end: [size, size],
      endKey: gridCellKey([size, size]),
      height: size,
      items: {
        nodes: {},
        walls: {},
      },
      start: [0, 0],
      startKey: `0,0`,
      width: size,
    };

    for (let y = 0; y <= size; y++) {
      for (let x = 0; x <= size; x++) {
        room.items.nodes[`${y},${x}`] = true;
      }
    }

    return [
      room,
      this.lines.map<GridCoords>((line) => {
        const [x, y] = line.split(',');
        return [Number(y), Number(x)] as GridCoords;
      }),
    ];
  }

  getShortestPath(room: Room, start: GridCoords, end: GridCoords): number {
    const startKey = gridCellKey(start);
    const endKey = gridCellKey(end);

    const nodes: LookupGridCollection<number> = {};
    const unvisited: LookupGridCollection<number> = {};

    for (let y = 0; y <= room.height; y++) {
      for (let x = 0; x <= room.width; x++) {
        const key = gridCellKey([y, x]);
        if (!room.items.walls[key]) {
          nodes[`${y},${x}`] = Number.POSITIVE_INFINITY;
          unvisited[`${y},${x}`] = Number.POSITIVE_INFINITY;
        }
      }
    }

    nodes[startKey] = 0;
    unvisited[startKey] = 0;

    while (true) {
      const [lowest, distance] = Object.entries(unvisited).reduce<
        [GridCellKey | null, number]
      >(
        (acc, [k, v]) => (v < acc[1] ? [k as GridCellKey, v] : acc),
        [null, Number.POSITIVE_INFINITY]
      );

      if (!lowest || distance === Number.POSITIVE_INFINITY) break;

      if (lowest === endKey) break;

      nodes[lowest] = unvisited[lowest] ?? -1;

      const lowestCoord = lowest.split(',').map(Number) as GridCoords;

      DIRECTIONS.forEach((d) => {
        const move = DIRECTION_MOVES[d];
        const adjNode = getAdjacentCell(lowestCoord, move);
        const adjKey = gridCellKey(adjNode);

        if (
          room.items.nodes[adjKey] &&
          unvisited[adjKey] &&
          unvisited[adjKey] > distance + 1
        ) {
          unvisited[adjKey] = distance + 1;
        }

        delete unvisited[lowest];
      });
    }

    this.printDistances(room, nodes);

    let pos = end;
    let moves = 0;

    while (true) {
      moves++;

      const [next, nextKey] = DIRECTIONS.reduce<
        [GridCoords | null, GridCellKey | null, number]
      >(
        (acc, d) => {
          const move = DIRECTION_MOVES[d];
          const adjNode = getAdjacentCell(pos, move);
          const adjKey = gridCellKey(adjNode);
          const dist = nodes[adjKey];
          if (typeof dist === 'number' && dist < acc[2]) {
            return [adjNode, adjKey, dist];
          }

          return acc;
        },
        [null, null, Number.POSITIVE_INFINITY]
      );

      if (!next || !nextKey) break;
      if (nextKey === room.endKey) break;

      pos = next;
    }

    return moves;
  }

  dropByte(room: Room, byte: GridCoords) {
    const key = gridCellKey(byte);
    room.items.walls[key] = true;
  }

  dropBytes(room: Room, bytes: GridCoords[], numBytes: number) {
    for (let i = 0; i < numBytes; i++) {
      this.dropByte(room, bytes[i]);
    }
  }

  canReachEnd(room: Room, log = false) {
    let reachedEnd = false;

    const visited: LookupGridCollection<true> = { [room.startKey]: true };

    const visits: Visit[] = [
      {
        key: room.startKey,
        pos: room.start,
        visited: { [room.startKey]: true },
      },
    ];

    while (true) {
      const visit = visits.pop();

      if (!visit) break;

      if (visit.key === room.endKey) {
        reachedEnd = true;
        break;
      }

      DIRECTIONS.forEach((d) => {
        const move = DIRECTION_MOVES[d];
        const adjNode = getAdjacentCell(visit.pos, move);
        const adjKey = gridCellKey(adjNode);
        const isNode = !!room.items.nodes[adjKey];
        const isWall = !!room.items.walls[adjKey];
        const isVisited = !!visited[adjKey];

        if (log) {
          console.log(`Visit: ${visit.key} - Dir: ${d} - Adj: ${adjKey}`);
        }

        if (isNode && !isWall && !isVisited) {
          visited[adjKey] = true;
          visits.push({
            key: adjKey,
            pos: adjNode,
            visited: visit.visited,
            // visited: { ...visit.visited, [adjKey]: true },
          });
        }
      });
    }

    return reachedEnd;
  }

  getFirstBlockingByte(room: Room, bytes: GridCoords[]): GridCoords | null {
    let blocking: GridCoords | null = null;

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      this.dropByte(room, byte);

      const watch = byte[0] === 67 && byte[1] === 52;
      console.log(`${i + 1}. Drop ${byte}`);

      // if (watch) {
      //   this.printRoom(room);
      //   break;
      // }

      const canEscape = this.canReachEnd(room, watch);

      console.log(`Can escape = ${canEscape}\n`);
      // this.printRoom(room);

      if (!canEscape) {
        blocking = byte;
        break;
      }
    }

    return blocking;
  }

  step1() {
    const roomSize = this.isSample ? 6 : 70;
    const numBytes = this.isSample ? 12 : 1024;
    const [room, bytes] = this.getInput(roomSize);
    this.dropBytes(room, bytes, numBytes);
    return this.getShortestPath(room, room.end, room.start);
  }

  step2() {
    const roomSize = this.isSample ? 6 : 70;
    const [room, bytes] = this.getInput(roomSize);
    const blocking = this.getFirstBlockingByte(room, bytes);

    if (!blocking) return 'oops';

    return `${blocking[1]},${blocking[0]}`;
  }
}

export { Day };
