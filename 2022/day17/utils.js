const { SHAPES } = require('./constants');
let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const getCaveGrid = (cave, x, y) => {
  const grid = cave.split('\n').filter(Boolean).map(
    (line) => line.split('').map((space) => space === '#' ? 1 : 0)
  );

  // Height of whatever is already in the cave
  const settledHeight = grid.length;
  // Additional height to add for currently falling rock
  const heightToAdd = y - settledHeight;
  // Prepend rows for currently falling rock
  for (let i = 0; i < heightToAdd; i++) {
    grid.unshift([0, 0, 0, 0, 0, 0, 0]);
  }

  return grid;
};

const isCollision = (cave, shape, x, y) => {
  let collission = false;

  if (shape && y - shape.height === -1) {
    return true;
  }

  const grid = getCaveGrid(cave, x, y);

  const offset = grid.length - y;

  shape.pattern.split('\n').filter(Boolean).forEach((shapeLine, shapeY) => {
    shapeLine.split('').forEach((shapeCell, shapeX) => {
      
      grid[shapeY + offset][shapeX + x] += shapeCell === '#' ? 1 : 0;

      if (grid[shapeY + offset][shapeX + x] > 1) {
        collission = true;
      }
    });
  });

  return collission;
};

const getUpdatedCave = (cave, x, y, shape) => {
  log(`Update cave @{${x},${y}} with settled shape`.brightRed);
  const grid = getCaveGrid(cave, x, y);
  const shapeGrid = shape && shape.pattern.split('\n').map((line) => line.split(''));

  // Insert collided shape
  shapeGrid.forEach((shapeRow, shapeY) => {
    shapeRow.forEach((shapeCell, shapeX) => {
      if (shapeCell === '#') {
        grid[shapeY + (grid.length - y)][shapeX + x] = 1;
      }
    });
  });

  // Re-print grid into text cave
  return grid.map((row, y) => row.map((cell) => cell ? '#' : '.').join('')).join('\n');
};

const printCave = (cave, x, y, shape) => {
  const grid = getCaveGrid(cave, x, y);
  const height = grid.length;
  const shapeGrid = shape && shape.pattern.split('\n').map((line) => line.split(''));
  let caveLines = [];

  grid.forEach((row, gridY) => {
    const line = [];

    const offset = height - gridY - y + 1;

    const shapeLine = shapeGrid && shapeGrid[offset];

    row.forEach((cell, gridX) => {
      let c = '.'.grey;
      if (shapeLine && shapeLine[gridX - x] === '#') {
        c = '@'.green;
      } else if (cell) {
        c = '#'.white;
      }
      line.push(c);
    });

    if (line.length) {
      caveLines.push('|' + line.join('') + '|');
    }
  });

  caveLines.push('+-------+');

  log(caveLines.join('\n') + '\n');
};

const getTotalHeight = (jets, maxRocks = 3) => {
  let cave = '';
  let isJetStep = true;
  let currentX = 2;
  let currentY = 4;
  let currentJet = 0;
  let currentShape = 0;
  let numRocksSettled = 0;
  
  printCave(cave, currentX, currentY, SHAPES[currentShape]);

  while(true) {
    const shape = SHAPES[currentShape];
    const prevX = currentX;
    const prevY = currentY;

    if (isJetStep) {
      log(`Jet step: ${jets[currentJet]}`.white);
      const nextX = currentX + (jets[currentJet] === '>' ? 1 : -1);

      if (nextX >= 0 && nextX + shape.width <= 7) {
        log(`Jet moves x from ${currentX} to ${nextX}`);
        currentX = nextX;
      }

      isJetStep = false;
      currentJet++;
      if (currentJet >= jets.length) {
        currentJet = 0;
      }
    } else {
      log(`Rock moves down from ${currentY} to ${currentY - 1}`.white);
      currentY--;

      isJetStep = true;
    }

    let collission = isCollision(cave, shape, currentX, currentY);

    // Collision happened because of horizontal movement. Cancel movement.
    if (collission && !isJetStep) {
      currentX = prevX;
      continue;
    }

    log(`${currentX},${currentY} is collision: ${collission}`);

    if (collission) {
      const settledX = !isJetStep ? prevX : currentX;
      const settledY = isJetStep ? prevY : currentY;
      isJetStep = true;
      log(`Collision X = ${prevX} -> ${currentX}; y = ${prevY} -> ${currentY}`)
      cave = getUpdatedCave(cave, settledX, settledY, shape);

      printCave(cave, currentX, currentY);

      numRocksSettled++;
      currentShape++;
      currentX = 2;
      if (currentShape > SHAPES.length - 1) {
        currentShape = 0;
      }
      currentY = cave.split('\n').length + 3 + SHAPES[currentShape].height;

      log(`A new rock appears. (${currentY})`.brightGreen);
      printCave(cave, currentX, currentY, SHAPES[currentShape]);

      if (numRocksSettled % 100 === 0) {
        console.log(numRocksSettled.toString().brightWhite, `settled so far. (${cave.split('\n').length})`.grey);
      }
    } else {
      printCave(cave, currentX, currentY, SHAPES[currentShape]);
    }

    if (numRocksSettled === maxRocks) {
      // const preLogging = isLogging;
      // isLogging = true;
      // printCave(cave, currentX, currentY);
      // isLogging = preLogging;
      break;
    } else if (numRocksSettled === maxRocks - 1) {
      if (!isLogging) {
        // isLogging = true;
        log(`A new rock appears. (${currentY})`.brightGreen);
        printCave(cave, currentX, currentY, SHAPES[currentShape]);
      }
    }
  }

  return cave.split('\n').length;
};

const getResult = (data) => {
  isLogging = false;
  const jets = data.split('');
  // 1,000,000,000,000
  return getTotalHeight(jets, 2022);
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
