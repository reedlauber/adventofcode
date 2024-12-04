const getDimensions = (paths) => {
  let minX = Number.MAX_VALUE;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  paths.forEach((path) => {
    path.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
  });

  return { minX, minY, maxX: maxX + 1, maxY: maxY + 1 };
};

const renderCave = (dimensions, graph, sand) => {
  const rows = [];

  for (let y = 0; y < dimensions.maxY; y++) {
    const row = [`${y} `];
    for (let x = dimensions.minX; x < dimensions.maxX; x++) {
      const id = `${x},${y}`;
      row.push(sand[id] ? 'o'.brightWhite : graph[id] ? '#' : '.');
    }
    rows.push(row.join(''));
  }

  console.log(rows.join('\n'));
};

const getPaths = (data) => {
  return data.split('\n').map((line) => {
    const coords = line.split(' -> ').map((coord) => {
      return coord.split(',').map(Number);
    });
    return coords;
  });
};

const getGraph = (paths) => {
  const graph = {};
  paths.forEach((path) => {
    for (let p = 0; p < path.length; p++) {
      const [x, y] = path[p];
      graph[`${x},${y}`] = true;
      
      const prev = path[p-1];

      if (prev) {
        const [prevX, prevY] = prev;
        if (prevX === x) { // Vert
          for (let pathY = prevY; pathY < y; pathY++) {
            graph[`${x},${pathY}`] = true;
          }
        } else if (prevX > x) { // Left
          for (let pathX = prevX; pathX >= x; pathX--) {
            graph[`${pathX},${y}`] = true;
          }
        } else if (prevX < x) { // Right
          for (let pathX = prevX; pathX < x; pathX++) {
            graph[`${pathX},${y}`] = true;
          }
        }
      }
    }
  });

  return graph;
};

const getDropPosition = (graph, sands, [x, y], depth = 0) => {
  if (depth > 6200) {
    console.log('Max depth reached');
    return -1;
  }

  const id = `${x},${y}`;

  // Hit obstacle
  if (graph[id] || sands[id]) {
    // console.log(`Ran into obstacle at [${id}]:${depth}`);
    const up = [x, y - 1];

    if (up[1] < 1) {
      // console.log('Up too high');
      return -1;
    }

    // Try down, left
    const dl = [up[0] - 1, up[1] + 1];
    const dlId = `${dl[0]},${dl[1]}`;
    if (!graph[dlId] && !sands[dlId]) {
      // console.log(`Down left looks good at [${dlId}]:${depth}`);
      // Moving left worked
      return getDropPosition(graph, sands, [dl[0], dl[1]], depth + 1);
      // return dl;
    }

    // try, down, right
    const dr = [up[0] + 1, up[1] + 1];
    const drId = `${dr[0]},${dr[1]}`;
    if (!graph[drId] && !sands[drId]) {
      // console.log(`Down right looks good at [${drId}]:${depth}`);
      return getDropPosition(graph, sands, [dr[0], dr[1]], depth + 1);
      // return dr;
    }

    // console.log(`Down left/right didn't work, using up [${up[0]},${up[1]}]:${depth}`);

    return up;
  }

  return getDropPosition(graph, sands, [x, y + 1], depth + 1);
};

const dropSand = (graph, sands) => {
  return getDropPosition(graph, sands, [500, 1], 0);
};

const getSands = (graph) => {
  const sands = {};

  let count = 0;
  while(true) {
    // console.log(`== Drop ${count} ==`)
    const drop = dropSand(graph, sands);

    if (drop === -1) {
      break;
    }

    if (drop && drop !== -1) {
      sands[`${drop[0]},${drop[1]}`] = true;
    }

    count++;

    // if (++count > 24) {
    //   break;
    // }
  }

  return sands;
};

const getResult = (data) => {
  const paths = getPaths(data);
  const graph = getGraph(paths);
  const dimensions = getDimensions(paths);
  const sand = getSands(graph);
  // console.log(sand);
  // console.log(graph)
  renderCave(dimensions, graph, sand);
  return Object.keys(sand).length;
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
