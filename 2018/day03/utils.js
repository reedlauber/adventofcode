const SIZE = 1100;

const createFabric = () => {
  const fabric = [];
  for (let y = 0; y < SIZE; y++) {
    const row = [];
    for (let x = 0; x < SIZE; x++) {
      row.push(0);
    }
    fabric.push(row);
  }
  return fabric;
};

const getInstructions = (data) => {
  return data.split('\n').map((line) => {
    const [id, at, coords, size] = line.split(' ');
    const [x, y] = coords.replace(':', '').split(',').map(Number).map((n) => n);
    const [w, h] = size.split('x').map(Number);

    return {
      id, coords, size, x, y, w, h, line
    };
  });
};

const getAppliedFabric = (fabric, instructions) => {
  instructions.forEach(({ id, coords, size, x, y, w, h }) => {
    for (let iy = y; iy < y + h; iy++) {
      if (typeof fabric[iy] === 'undefined') {
        throw new Error(`No row ${iy} (${id})`);
      }

      for (let ix = x; ix < x + w; ix++) {
        if (typeof fabric[iy][ix] === 'undefined') {
          throw new Error(`No row, cell ${iy},${ix} (${id}), ${x},${y}: ${w}x${h}`);
        }

        fabric[iy][ix]++;
      }
    }
  });

  return fabric;
};

const getOverlapsCount = (fabric) => {
  return fabric.reduce((accY, row) => {
    return accY + row.reduce((accX, cell) => accX + (cell >= 2 ? 1 : 0), 0);
  }, 0);
};

const getUnoverlappingCells = (fabric) => {
  const cells = [];

  fabric.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        cells.push([x, y]);
      }
    });
  });

  return cells;
};

const getUnoverlappingClaim = (fabric, instructions) => {
  let claim = null;
  instructions.forEach((inst) => {
    let allOnes = true;
    for(let y = inst.y; y < inst.y + inst.h; y++) {
      for (let x = inst.x; x < inst.x + inst.w; x++) {
        if (fabric[y][x] !== 1) {
          allOnes = false;
        }
      }
    }

    if (allOnes) {
      claim = inst;
    }
  });

  return claim.id;
};

const getLines = (data) => {
  const fabric = createFabric();

  console.log(`Fabric: ${fabric.length}x${fabric[0].length}`);

  const instructions = getInstructions(data);

  // console.log(instructions);

  const applied = getAppliedFabric(fabric, instructions);

  // console.log(applied);

  return getOverlapsCount(applied);
};

const getClaim = (data) => {
  const fabric = createFabric();

  const instructions = getInstructions(data);

  const applied = getAppliedFabric(fabric, instructions);

  return getUnoverlappingClaim(applied, instructions);
};

module.exports = { getClaim, getLines };
