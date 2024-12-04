const COORD_RE = /(\-?\d{1,2}, ? \-?\d{1,2})/g;

const getDimensions = (points) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = 0;
  let maxY = 0;
  points.forEach(({ position }) => {
    if (position[0] < minX) minX = position[0];
    if (position[1] < minY) minY = position[1];
    if (position[0] > maxX) maxX = position[0];
    if (position[1] > maxY) maxY = position[1];
  });
  return { minX: minX - 0, minY: minY - 0, maxX: maxX + 1, maxY: maxY + 1 };
  // return { minX: -50, minY: -125, maxX: 200, maxY: 125 };
};

const getPoints = (data) => {
  const graph = {};
  const points = data.split('\n').map((line) => {
    const [posRaw, velRaw] = line.match(COORD_RE);
    if (!posRaw || !velRaw) {
      console.error('Failed on', line.match(COORD_RE));
    }
    const position = posRaw.split(', ').map(Number);
    const velocity = velRaw.split(', ').map(Number);
    const point = { id: `${position[0]},${position[1]}`, position, velocity };
    graph[point.id] = point;
    return point;
  });
  return [points, graph];
};

const getPoints2 = (data) => {
  const graph = {};
  const points = data.split('\n').map((line) => {
    const [pRaw, vRaw] = line.split(' velocity=<');
    const pCoord = pRaw.substring(10).replace('>', '');
    const vCoord = vRaw.replace('>', '');
    const position = pCoord.split(', ').map(Number);
    const velocity = vCoord.split(', ').map(Number);
    const point = { id: `${position[0]},${position[1]}`, position, velocity, line };
    graph[point.id] = point;
    return point;
  });
  return [points, graph];
};

const renderSky = (dimensions, graph) => {
  const rows = [];
  for (let y = dimensions.minY; y < dimensions.maxY; y++) {
    const row = [];
    for (let x = dimensions.minX; x < dimensions.maxX; x++) {
      const id = `${x},${y}`;
      row.push(graph[id] ? '#' : '.');
    }
    rows.push(row.join(''));
  }
  console.log(rows.join('\n'));
};

const getUpdatedGraph = (points, graph) => {
  const updated = { };

  points.forEach((point, i) => {
    point.position[0] += point.velocity[0];
    point.position[1] += point.velocity[1];
    point.id = `${point.position[0]},${point.position[1]}`;
    points[i] = point;
    updated[point.id] = point;
  });

  return updated;
};

const runTime = (points, graph, duration = 3) => {
  let running = { ...graph };
  let dimensions = getDimensions(points);
  renderSky(dimensions, running);

  for (let s = 0; s < duration; s++) {
    running = getUpdatedGraph(points, graph);
    dimensions = getDimensions(points);
    if (dimensions.maxX - dimensions.minX > 250) {
      break;
    }
    console.log(`== ${s} Seconds ==`.brightWhite);
    renderSky(dimensions, running);
  }
};

const runTime2 = (points, graph, duration = 3) => {
  let updatedGraph = { };

  let smallest = { height: -1, width: -1, size: Infinity };
  let smallestIndex = -1;

  for (let i = 2; i < 25000; i++) {
    const updatedPoints = points.map((point) => {
      const x = point.position[0] + (i * point.velocity[0]);
      const y = point.position[1] + (i * point.velocity[1]);
      const id = `${x},${y}`;
      const updated = {
        id,
        position: [x, y],
        velocity: point.velocity
      };
      updatedGraph[id] = updated;
      return updated;
    });
    const dimensions = getDimensions(updatedPoints);
    const width = dimensions.maxX - dimensions.minX;
    const height = dimensions.maxY - dimensions.minY;
    const size = width * height;
    if (smallest.height === -1 || size < smallest.size) {
      smallest.height = height;
      smallest.width = width;
      smallest.size = size;
      smallestIndex = i;
    }
  }

  console.log('smallestIndex', smallestIndex);


  // const updatedPoints = points.map((point) => {
  //   const x = point.position[0] + (duration * point.velocity[0]);
  //   const y = point.position[1] + (duration * point.velocity[1]);
  //   const id = `${x},${y}`;
  //   const updated = {
  //     id,
  //     position: [x, y],
  //     velocity: point.velocity
  //   };
  //   updatedGraph[id] = updated;
  //   return updated;
  // });

  // let dimensions = getDimensions(updatedPoints);

  // renderSky(dimensions, updatedGraph);
};

const getResult = (data) => {
  const [points, graph] = getPoints(data);
  // console.log(points);
  // const dimensions = getDimensions(points);
  runTime2(points, graph, 10000);
  return '??';
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
