const DIR_SCORES = {
  0: 3,
  90: 0,
  180: 1,
  270: 2,
};

const DIR_CHARS = {
  0: '^',
  90: '>',
  180: 'v',
  270: '<',
};

let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const getNotes = (data) => {
  const [mapRaw, pathRaw] = data.split('\n\n');

  const map = mapRaw.split('\n').map((line, i) => {
    const cellsRaw = line.split('');
    const offset = cellsRaw.findIndex((c) => c !== ' ');
    const cells = cellsRaw.map((c) => {
      if (c !== ' ') {
        return c;
      }
    }).filter(Boolean);
    return { offset, cells, y: i };
  });

  const path = [];
  let idx = 0;
  const pathLen = pathRaw.length;
  pathRaw.split('').forEach((c, i) => {
    if (i === pathLen - 1) {
      const num = Number(pathRaw.substring(idx, i + 1));
      path.push(num);
    } else if (c === 'R' || c === 'L') {
      const num = Number(pathRaw.substring(idx, i));
      path.push(num);
      path.push(c);
      idx = i + 1;
    }
  });

  return [map, path];
};

const getNextDir = (dir, inst) => {
  const instAmt = inst === 'R' ? 90 : -90;
  let nextDir = dir += instAmt;
  if (nextDir < 0) {
    nextDir = 360 + nextDir;
  } else if (nextDir > 360) {
    nextDir = nextDir - 360;
  }
  return nextDir;
};

const getMoveRight = (map, x, y, inst) => {
  const row = map[y];
  let nextX = x;
  for (let i = 0; i < inst; i++) {
    const next = row.cells[nextX + 1];

    // If step hits a wall, we're done
    if (next === '#') {
      break;
    }

    // If step is empty, loop to left side
    // If left side starts with a wall, we're done
    if (!next) {
      if (row.cells[0] === '#') {
        break;
      } else {
        nextX = -1;
      }
    }

    nextX++;
  }

  return nextX;
};

const getMoveLeft = (map, x, y, inst) => {
  const row = map[y];
  let nextX = x;
  for (let i = 0; i < inst; i++) {
    const prev = row.cells[nextX - 1];

    // If step hits a wall, we're done
    if (prev === '#') {
      break;
    }

    // If step is empty, loop to right side
    if (!prev) {
      if (row.cells[row.cells.length - 1] === '#') {
        break;
      } else {
        nextX = row.cells.length;
      }
    }

    nextX--;
  }

  return nextX;
};

const getMoveDown = (map, x, y, inst) => {
  let nextX = x;
  let nextY = y;

  for (let i = 0; i < inst; i++) {
    const row = map[nextY];
    const trueX = nextX + row.offset;
    const nextRow = map[nextY + 1];
    const nextRowLen = nextRow ? nextRow.cells.length : 0;
    const nextRowX = trueX - (nextRow ? nextRow.offset : 0);
    // log(`Move down [${nextX},${nextY}], true X: ${trueX}, offset: ${nextRow.offset}, next X: ${nextRowX}`);
    
    if (!nextRow || trueX < nextRow.offset || trueX > (nextRow.offset + nextRowLen)) { // x doesn't exist for next row, loop to top
      const topIdx = map.findIndex((row) => row.offset < trueX);
      const top = map[topIdx];
      const x = trueX - top.offset;
      // X position in top row is a wall. Stop
      if (top.cells[x] === '#') {
        break;
      }
      nextX = x;
      nextY = topIdx;
      continue;
    } else if (nextRow.cells[nextRowX] === '#') {
      break;
    }

    nextX = nextRowX;
    nextY++;
  }

  return [nextX, nextY];
};

const getMoveUp = (map, x, y, inst) => {
  let nextX = x;
  let nextY = y;

  for (let i = 0; i < inst; i++) {
    const row = map[nextY];
    const trueX = nextX + row.offset;
    const prevRow = map[nextY - 1];
    const prevRowLen = prevRow ? prevRow.cells.length : 0;
    const prevRowX = trueX - (prevRow ? prevRow.offset : 0);
    
    if (!prevRow || trueX < prevRow.offset || trueX > (prevRow.offset + prevRowLen)) { // x doesn't exist for previous row, loop to bottom
      const bottomIdx = (map.length - 1) - map.reverse().findIndex((row) => row.offset < trueX);
      const bottom = map[bottomIdx];
      const x = trueX - bottom.offset;
      // X position in bottom row is a wall. Stop
      if (bottom.cells[x] === '#') {
        break;
      }
      nextX = x;
      nextY = bottomIdx;
      continue;
    } else if (prevRow.cells[prevRowX] === '#') {
      break;
    }

    nextX = prevRowX;
    nextY--;
  }

  return [nextX, nextY];
};

const printMap = (map, steps) => {
  const rows = [];
  map.forEach((row, y) => {
    const line = [];
    row.cells.forEach((cell, x) => {
      const stepId = `${x},${y}`;
      const step = steps[stepId];
      if (step) {
        line.push(DIR_CHARS[step]);
      } else {
        line.push(cell);
      }
    });
    rows.push(line.join('').padStart(row.offset + row.cells.length));
  });
  console.log(rows.join('\n'));
};

const getPassword = (map, path) => {
  let x = 0;
  let y = 0;
  let dir = 90;

  const steps = { [`${x},${y}`]: dir };

  for (let i = 0; i < path.length; i++) {
    const inst = path[i];
    if (inst === 'L' || inst === 'R') {
      dir = getNextDir(dir, inst);
    } else {
      try {
        if (dir === 90) { // Right
          x = getMoveRight(map, x, y, inst);
          log(`Move right: ${inst} => [${x},${y}]`);
        } else if (dir === 180) { // Down
          const result = getMoveDown(map, x, y, inst);
          x = result[0];
          y = result[1];
          log(`Move down: ${inst} => [${x},${y}]`);
        } else if (dir === 270) { // Left
          x = getMoveLeft(map, x, y, inst);
          log(`Move left: ${inst} => [${x},${y}]`);
        } else if (dir === 0) { // Up
          const result = getMoveUp(map, x, y, inst);
          x = result[0];
          y = result[1];
          log(`Move up: ${inst} => [${x},${y}]`);
        }
        steps[`${x},${y}`] = dir;
      }
      catch (e) {
        console.error(`Failed on instruction: ${path[i-1]}${inst} (${i})`);
        console.error(e);
        break;
      }
    }
  }

  let password = (1000 * (y + 1)) + (4 * (x + map[y].offset + 1)) + DIR_SCORES[dir];

  return [password, steps];
};

const getResult = (data) => {
  // isLogging = true;
  const [map, path] = getNotes(data);
  const [password, steps] = getPassword(map, path);
  // printMap(map, steps);
  return password;
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
