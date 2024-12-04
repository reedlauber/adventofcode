const COORDS_RE = /-?\d+/g;

const getId = ([x, y]) => `${x},${y}`;

const getDistance = ([x1, y1], [x2, y2]) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

const getDimensions = (sensors, beacons) => {
  let minX = Number.MAX_VALUE;
  let maxX = 0;
  let minY = Number.MAX_VALUE;
  let maxY = 0;
  sensors.forEach((sensor) => {
    const sMinX = sensor.x - sensor.distance;
    const sMaxX = sensor.x + sensor.distance;
    const sMinY = sensor.y - sensor.distance;
    const sMaxY = sensor.y + sensor.distance;
    if (sMinX < minX) minX = sMinX;
    if (sMaxX > maxX) maxX = sMaxX;
    if (sMinY < minY) minY = sMinY;
    if (sMaxY > maxY) maxY = sMaxY;
  });
  Object.values(beacons).forEach((beacon) => {
    if (beacon.x < minX) minX = beacon.x;
    if (beacon.x > maxX) maxX = beacon.x;
    if (beacon.y < minY) minY = beacon.y;
    if (beacon.y > maxY) maxY = beacon.y;
  });
  return { minX, maxX, minY, maxY, height: maxY - minY, width: maxX - minX };
};

const getSensorsAndBeacons = (data) => {
  const sensorsGraph = {};
  const beacons = {};
  const sensors = data.split('\n').map((line) => {
    const [sX, sY, bX, bY] = line.match(COORDS_RE).map(Number);
    const beacon = { id: getId([bX, bY]), x: bX, y: bY };
    beacons[beacon.id] = beacon;
    const sensor = {
      id: getId([sX, sY]),
      x: sX,
      y: sY,
      closest: beacon,
      distance: getDistance([sX, sY], [bX, bY]),
    };
    sensorsGraph[sensor.id] = sensor;
    return sensor;
  });
  return [sensors, beacons, sensorsGraph];
};

const getCoverage = (sensors) => {
  const coverage = {};

  sensors.forEach(({ x, y, distance }, i) => {
    // if (i > 0) return;
    // console.log(`Sensor ${id}; dist = ${distance}`);
    for (let i = y - distance; i <= y + distance; i++) {
      
      // E.g (3 - (100 - 97) + 1) = 1
      //     (3 - (100 - 98) + 1) = 2
      const width = distance - Math.abs(y - i) + 1;
      // console.log(`distance:${distance}, y:${y}, i:${i}, width:${width}`);
      // console.log(`${id}; y = ${i}; width = ${width}`);

      for (let j = x - width + 1; j < x + width; j++) {
        const sId = getId([j, i]);
        coverage[sId] = true;
      }
    }
  });

  return coverage;
};

const getCoverage2 = (sensors, row = 10) => {
  const coverage = [];
  const nearEnoughGraph = {};

  const nearEnough = sensors.filter(({ distance, y }) => {
    const min = y - distance;
    const max = y + distance;
    return min <= row && max >= row;
  })
  
  nearEnough.forEach((sensor) => {
    const { id, distance, x, y } = sensor;
    nearEnoughGraph[id] = sensor;
    // How far is target row from Sensor
    const rowDistance = Math.abs(y - row);
    // Expected width of coverage is: 
    // (sensor range) - (distance from target)
    // E.g. 3 - 0 = 3
    const width = distance - rowDistance + 1;
    const half = width;
    const minX = x - half + 1;
    const maxX = x + half - 1;
    
    coverage.push([minX, maxX]);
  });

  return [coverage, nearEnoughGraph];
};

const getCoverage3 = (sensors, maxSize) => {
  const candidates = [];
  for (let y = 0, len = maxSize; y < len; y++) {
    const row = [];
    if (y % 10000 === 0) {
      console.log(`Constructed candidate row ${y}`);
    }
    for (let x = 0; x < maxSize; x++) {
      row.push(0);
    }
    candidates.push(row);
  }

  console.log(`Candidate constructed`)

  for (let s = 0; s < sensors.length; s++) {
    const { id, x, y, distance } = sensors[s];
    console.log('== Sensor ${id} ==');
    // const coverage = {};

    for (let i = y - distance; i <= y + distance; i++) {
      const width = distance - Math.abs(y - i) + 1;

      for (let j = x - width + 1; j < x + width; j++) {
        const sId = getId([j, i]);
        // coverage[sId] = true;
        if (candidates[i] && j >= 0) {
          candidates[i][j] = 1; 
        }
      }
    }
  }

  // console.log(candidates)

  let found = null;

  for (let y = 0, len = maxSize; y < len; y++) {
    for (let x = 0; x < len; x++) {
      if (candidates[y][x] === 0) {
        found = [x, y];
        break;
      }
    }
    if (found) {
      break;
    }
  }

  return found;
};

const getPositionsWithoutBeacon = (dimensions, beacons, coverage, row) => {
  let covered = 0;
  for (let x = dimensions.minX; x <= dimensions.maxX; x++) {
    const id = getId([x, row]);
    covered += coverage[id] && !beacons[id] ? 1 : 0;
  }
  return covered;
};

const getCoverageSize = (coverage) => {
  const visited = {};
  return coverage.reduce((acc, [min, max]) => {
    let len = 0;
    for (let i = min; i < max; i++) {
      if (!visited[i]) {
        len++;
        visited[i] = true;
      }
    }
    return acc + len;
  }, 0);
};

const getUncovered = (dimensions, coverage) => {
  let uncovered = null;

  for (let y = dimensions.minY; y < dimensions.maxY; y++) {
    for (let x = dimensions.minX; x < dimensions.maxX; x++) {
      const id = getId([x, y]);
      if (!coverage[id]) {
        uncovered = [x, y];
        break;
      }
    }
    if (uncovered) {
      break;
    }
  }

  return uncovered;
};

const isInCoverage = (x, coverage) => {
  let isIn = false;
  coverage.forEach(([min, max]) => {
    if (x >= min && x <= max) {
      isIn = true;
    }
  });
  return isIn;
};

const render = (dimensions, sensorsGraph, beacons, coverage, rowNum) => {
  // console.log(coverage);
  // return;
  const rows = [];

  for (let y = dimensions.minY; y < dimensions.maxY; y++) {
    const row = [];
    for (let x = dimensions.minX; x < dimensions.maxX; x++) {
      const id = getId([x, y]);
      let c = '.'.grey;
      if (coverage[id]) c = '#';
      // if (y === rowNum && isInCoverage(x, coverage)) c = '#'.white;
      if (beacons[id]) c = 'B'.red;
      if (sensorsGraph[id]) c = `${sensorsGraph[id].distance}`.brightWhite;
      row.push(c);
    }
    rows.push(`${y}`.padStart(2, '0') + ' ' + row.join(''));
  }

  console.log(rows.join('\n'));
};

const getResult = (data) => {
  const row = 2000000;
  const [sensors, beacons, sensorsGraph] = getSensorsAndBeacons(data);
  // console.log(sensors)
  const dimensions = getDimensions(sensors, beacons);
  const [coverage, nearEnoughGraph] = getCoverage2(sensors, row);
  // render(dimensions, nearEnoughGraph, beacons, coverage, row);
  return getCoverageSize(coverage);
  // return getPositionsWithoutBeacon(dimensions, beacons, coverage, row);
};

const getResult2 = (data) => {
  const maxSize = 10000; //4000000;
  const [sensors, beacons, sensorsGraph] = getSensorsAndBeacons(data);
  const dimensions = { minX: 0, maxX: maxSize, minY: 0, maxY: maxSize };
  const uncovered = getCoverage3(sensors, maxSize);
  // render(dimensions, sensorsGraph, beacons, coverage);
  // const uncovered = getUncovered(dimensions, coverage);

  if (uncovered) {
    return uncovered[0] * 40000000 + uncovered[1];
  }
  console.log(uncoveredId);
  return '??';
};

module.exports = { getResult, getResult2 };
