let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const getId = ([x, y]) => `${x},${y}`;

const getValley = (data) => {
  const blizzards = [];
  const graph = {};

  data.split('\n').forEach((line, y) => {
    const cells = line.split('');
    if (cells[3] !== '#') {
      cells.forEach((cell, x) => {
        if (cell !== '.' && cell !== '#') {
          const coord = getId([x, y]);
          const blizzard = {
            id: `bliz--${blizzards.length + 1}`,
            x,
            y,
            dir: cell,
          };
          graph[coord] = graph[coord] || [];
          graph[coord].push(blizzard);
          blizzards.push(blizzard);
        }
      });
    }
  });

  const height = data.split('\n').length;
  const width = data.split('\n')[0].split('').length;

  return [blizzards, graph, height, width];
};

const getNextBlizzardPosition = (blizzard, height, width) => {
  let x = blizzard.x;
  let y = blizzard.y;

  switch(blizzard.dir) {
    case '^':
      y--;
      break;
    case 'v':
      y++;
      break;
    case '>':
      x++;
      break;
    case '<':
      x--;
      break;
  }

  if (x < 1) {
    x = width - 2;
  } else if (x > width - 2) {
    x = 1;
  }
  if (y < 1) {
    y = height - 2;
  } else if (y > height - 2) {
    y = 1;
  }

  return [x, y];
};

const printValley = (position, dest, graph, height, width) => {
  const lines = [];

  for (let y = 0; y < height; y++) {
    const line = [];

    for (let x = 0; x < width; x++) {
      let c = '#'.grey;

      if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
        c = '.'.green;
        const coord = getId([x, y]);
        const blizzards = graph[coord];

        if (blizzards) {
          c = blizzards.length === 1 ? blizzards[0].dir.brightWhite : blizzards.length.toString().brightWhite;
        }
      }

      if (x === position[0] && y === position[1]) {
        c = 'E'.brightGreen;
      } else if (x === dest[0] && y === dest[1]) {
        c = '.'.white;
      }

      line.push(c);
    }

    lines.push(line.join(''));
  }

  log(`${lines.join('\n')}\n`);
};

const isValidMove = (pos, dest, graph, height, width) => {
  const posId = getId(pos);

  if (pos[0] === dest[0] && pos[1] === dest[1]) {
    return true;
  }

  if (
    pos[0] === 0 || 
    pos[1] === 0 || 
    pos[0] > width - 2 || 
    pos[1] > height - 2 ||
    graph[posId]
  ) {
    return false;
  }

  return true;
};

const getNextBlizzards = (blizzards, height, width) => {
  const graph = {};
  const next = blizzards.map((blizzard) => {
    const [nx, ny] = getNextBlizzardPosition(blizzard, height, width);
    const b = { ...blizzard };
    b.x = nx;
    b.y = ny;
    const nextId = getId([nx, ny]);
    graph[nextId] = graph[nextId] || [];
    graph[nextId].push(b);
    return b;
  });
  return [next, graph];
};

const canMoveForward = (position, dest, graph, height, width) => {
  const right = [position[0] + 1, position[1]];
  const down = [position[0], position[1] + 1];

  return isValidMove(right, dest, graph, height, width) || isValidMove(down, dest, graph, height, width);
};

const getNextBestRetreat = (r1, r2, blizzards, dest, height, width, steps) => {
  const [, nextGraph] = getNextBlizzards(blizzards, height, width);

  if (canMoveForward(r1, dest, nextGraph, height, width)) {
    return [r1, 'r1'];
  } else {
    return [r2, 'r2'];
  }
};

const getNextPosition = (position, dest, blizzards, graph, height, width, steps) => {
  // Attempt move
  const downFirst = dest[0] - position[0] < dest[1] - position[1];
  const offset = downFirst ? [0, 1] : [1, 0];
  const secondOffset = downFirst ? [1, 0] : [0, 1];

  let next = [position[0] + offset[0], position[1] + offset[1]];

  if (isValidMove(next, dest, graph, height, width)) {
    log(`Minute ${steps}, move ${downFirst ? 'down' : 'right'}:`);
    return next;
  }

  next = [position[0] + secondOffset[0], position[1] + secondOffset[1]];

  if (isValidMove(next, dest, graph, height, width)) {
    log(`Minute ${steps}, move ${downFirst ? 'right' : 'down'}:`);
    return next;
  }

  // Can't move forward, see if another move is needed
  const posId = getId([position[0], position[1]]);

  if (graph[posId]) {
    const retreatOffset = downFirst ? [-1, 0] : [0, -1];
    const secondRetreatOffset = downFirst ? [0, -1] : [-1, 0];

    const r1 = [position[0] + retreatOffset[0], position[1] + retreatOffset[1]];
    const r2 = [position[0] + secondRetreatOffset[0], position[1] + secondRetreatOffset[1]];

    const r1IsValid = isValidMove(r1, dest, graph, height, width);
    const r2IsValid = isValidMove(r2, dest, graph, height, width);

    if (r1IsValid && !r2IsValid) {
      log(`Minute ${steps}, move ${downFirst ? 'left' : 'up'}:`);
      return r1;
    } else if (r2IsValid && !r1IsValid) {
      log(`Minute ${steps}, move ${downFirst ? 'up' : 'left'}:`);
      return r2;
    } else if (r1IsValid && r2IsValid) {
      // Look ahead to step after this:
      const [nextBest, whichNext] = getNextBestRetreat(r1, r2, blizzards, dest, height, width, steps);
      log(`Minute ${steps}, move ${((downFirst && whichNext === 'r1') || !downFirst && whichNext === 'r2') ? 'left' : 'up'}:`);
      return nextBest;
    }
  }
 
  log(`Minute ${steps}, wait:`);

  return position;
};

const getNumSteps = (blizzards, graph, height, width, maxMins = 10) => {
  let position = [1, 0];
  const dest = [width - 2, height - 1];

  printValley(position, dest, graph, height, width);

  let steps = 0;

  let m = 0;
  while (true) {
    steps++;

    const [next, nextGraph] = getNextBlizzards(blizzards, height, width);
    blizzards = next;

    position = getNextPosition(position, dest, blizzards, nextGraph, height, width, steps);

    printValley(position, dest, nextGraph, height, width);

    if (position[0] === dest[0] && position[1] === dest[1]) {
      break;
    }

    // if (++m > maxMins) {
    //   break;
    // }
  }

  return steps;
};

const getResult = (data) => {
  isLogging = true;
  const [blizzards, graph, height, width] = getValley(data);
  const steps = getNumSteps(blizzards, graph, height, width, 17);
  return steps;
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
