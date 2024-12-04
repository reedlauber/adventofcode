const DIRECTIONS = ['N', 'S', 'W', 'E'];
let currentDirection = 0;

let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const getId = (x, y) => `${x},${y}`;

const getElves = (data) => {
  const elves = [];
  const positions = {};
  data.split('\n').forEach((line, y) => {
    line.split('').forEach((c, x) => {
      if (c === '#') {
        const elf = {
          id: `elf-${elves.length + 1}`,
          x,
          y,
          proposed: null,
        };
        positions[getId(x, y)] = elf;
        elves.push(elf);
      }
    });
  });
  return [elves, positions];
};

const getProposedDirection = (elf, positions) => {
  const nw = positions[getId(elf.x - 1, elf.y - 1)];
  const n = positions[getId(elf.x, elf.y - 1)];
  const ne = positions[getId(elf.x + 1, elf.y - 1)];

  const e = positions[getId(elf.x + 1, elf.y)];
  
  const se = positions[getId(elf.x + 1, elf.y + 1)];
  const s = positions[getId(elf.x, elf.y + 1)];
  const sw = positions[getId(elf.x - 1, elf.y + 1)];
  
  const w = positions[getId(elf.x - 1, elf.y)];

  if (!nw && !n && !ne && !e && !se && !s && !sw && !w) {
    // log(`Elf (${elf.id}): No change`);
    return null;
  }

  let dir = currentDirection;
  let proposedDirection = null;
  let proposedDirectionId = getId(elf.x, elf.y);

  for (let d = 0; d < DIRECTIONS.length; d++) {
    const direction = DIRECTIONS[dir];

    if (direction === 'N' && !nw && !n && !ne) {
      proposedDirectionId = getId(elf.x, elf.y - 1);
      proposedDirection = direction;
    }
    else if (direction === 'S' && !sw && !s && !se) {
      proposedDirectionId = getId(elf.x, elf.y + 1);
      proposedDirection = direction;
    }
    else if (direction === 'W' && !nw && !w && !sw) {
      proposedDirectionId = getId(elf.x - 1, elf.y);
      proposedDirection = direction;
    }
    else if (direction === 'E' && !ne && !e && !se) {
      proposedDirectionId = getId(elf.x + 1, elf.y);
      proposedDirection = direction;
    }

    if (proposedDirection) {
      break;
    }

    dir++;
    if (dir > DIRECTIONS.length - 1) {
      dir = 0;
    }
  }

  // if (proposedDirection === null) {
  //   log(`Elf (${elf.id}): Can't move (${getId(elf.x, elf.y)} => ${proposedDirectionId})`);
  // } else {
  //   log(`Elf (${elf.id}): Proposes ${proposedDirection} (${getId(elf.x, elf.y)} => ${proposedDirectionId})`);
  // }

  return proposedDirectionId;
};

const getDimensions = (elves) => {
  const [minX, maxX, minY, maxY] = elves.reduce((acc, elf) => {
    acc[0] = Math.min(acc[0], elf.x);
    acc[1] = Math.max(acc[1], elf.x);
    acc[2] = Math.min(acc[2], elf.y);
    acc[3] = Math.max(acc[3], elf.y);
    return acc;
  }, [Number.MAX_VALUE, 0, Number.MAX_VALUE, 0]);

  const height = maxY - minY + 1;
  const width = maxX - minX + 1;
  return { width, height, minX, maxX, minY, maxY };
};

const getUnoccupiedArea = (elves, positions, maxRounds = 10) => {
  renderGrove(positions);

  let nextPositions = { ...positions };

  let rounds = 0;
  for (let r = 0; r < maxRounds; r++) {
    rounds++;
    log(`Starting direction: ${DIRECTIONS[currentDirection]}`);

    const proposals = {};

    elves.forEach((elf, e) => {
      elves[e].proposed = getProposedDirection(elf, nextPositions);

      if (elves[e].proposed) {
        proposals[elves[e].proposed] = proposals[elves[e].proposed] || [];
        proposals[elves[e].proposed].push(elves[e]);
      }
    });

    nextPositions = {};

    elves.forEach((elf, e) => {
      let position = [elf.x, elf.y];

      if (elf.proposed) {
        const currentProposals = proposals[elf.proposed];

        if (currentProposals.length === 1) {
          position = elf.proposed.split(',').map(Number);
        }
      }

      elves[e].x = position[0];
      elves[e].y = position[1];
      elves[e].proposed = null;

      nextPositions[getId(elves[e].x, elves[e].y)] = elves[e];
    });

    renderGrove(nextPositions);

    currentDirection++;
    if (currentDirection > DIRECTIONS.length - 1) {
      currentDirection = 0;
    }

    if(!Object.keys(proposals).length) {
      break;
    }
  }

  const { width, height } = getDimensions(elves);

  return [(height * width) - elves.length, rounds];
};

const renderGrove = (positions) => {
  const lines = [];
  for (let y = 0; y < 12; y++) {
    const line = [];
    for (let x = 0; x < 14; x++) {
      const c = positions[getId(x, y)] ? '#'.white : '.';
      line.push(c);
    }
    lines.push(line.join(''));
  }
  log(lines.join('\n') + '\n');
};

const getResult = (data) => {
  // isLogging = true;
  const [elves, positions] = getElves(data);
  const [area] = getUnoccupiedArea(elves, positions, 10);
  return area;
};

const getResult2 = (data) => {
  // isLogging = true;
  const [elves, positions] = getElves(data);
  const [,rounds] = getUnoccupiedArea(elves, positions, 10000);
  return rounds;
};

module.exports = { getResult, getResult2 };
