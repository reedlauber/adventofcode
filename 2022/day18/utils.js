const getId = ([x, y, z]) => `${x},${y},${z}`;

const getDimensions = (cubes) => {
  return cubes.reduce((acc, cube) => {
    acc[0] = Math.max(acc[0], cube.x);
    acc[1] = Math.max(acc[1], cube.y);
    acc[2] = Math.max(acc[2], cube.z);
    return acc;
  }, [0, 0, 0]);
};

const getCubes = (data) => {
  const graph = {};
  const cubes = data.split('\n').map((line) => {
    const [x, y, z] = line.split(',').map(Number);
    const id = getId([x, y, z]);
    const cube = { id, x, y, z, neighbors: [], surface: 6 };
    graph[id] = cube;
    return cube;
  });
  return [cubes, graph];
};

const getIsCubeNeighbor = (a, b, considerAir = false) => {
  let isNeighbor = false;
  const xDist = Math.abs(a.x - b.x);
  const yDist = Math.abs(a.y - b.y);
  const zDist = Math.abs(a.z - b.z);
  if ((xDist + yDist + zDist) < 2) {
    isNeighbor = true;
  }
  return isNeighbor;
};

const getCubeNeighbors = (root, cubes, considerAir = false) => {
  const neighbors = [];
  cubes.forEach((cube) => {
    if (cube.id !== root.id && getIsCubeNeighbor(root, cube, considerAir)) {
      neighbors.push(cube.id);
    }
  });
  return neighbors;
};

const getSurroundedSpaces = (dimensions, cubes, graph) => {
  const spaces = [];

  for (let x = 0; x < dimensions[0]; x++) {
    for (let y = 0; y < dimensions[1]; y++) {
      for (let z = 0; z < dimensions[2]; z++) {
        const id = getId([x, y, z]);
        if (!graph[id]) {
          const space = { id, x, y, z, neighbors: [], surface: 6 };
          space.neighbors = getCubeNeighbors(space, cubes);
          space.surface = 6 - space.neighbors.length;
          spaces.push(space);
        }
      }
    }
  }

  // console.log('spaces', dimensions, spaces)

  return spaces.filter((space) => space.surface === 0);
};

const getCubesWithNeighbors = (data, considerAir = false) => {
  const [cubes, graph] = getCubes(data);
  cubes.forEach((cube, i) => {
    const neighbors = getCubeNeighbors(cube, cubes, considerAir);
    cubes[i].neighbors = neighbors;
    cubes[i].surface = 6 - neighbors.length;
  });
  return [cubes, graph];
};

const getResult = (data) => {
  const [cubes] = getCubesWithNeighbors(data);
  return cubes.reduce((acc, cube) => acc + cube.surface, 0);
};

const getResult2 = (data) => {
  const [cubes, graph] = getCubesWithNeighbors(data);
  const dimensions = getDimensions(cubes);
  // console.log('dimensions', dimensions);
  const surrounded = getSurroundedSpaces(dimensions, cubes, graph);
  // console.log('surrounded', surrounded.map((s) => s.id))

  const reduced = {};
  cubes.forEach((cube, i) => {
    if (!reduced[cube.id]) {
      const neighbor = surrounded.find((space) => space.neighbors.includes(cube.id));
      if (neighbor) {
        reduced[cube.id] = true;
        cubes[i].surface--;
      }
    }
  });

  return cubes.reduce((acc, cube) => acc + cube.surface, 0);
};

module.exports = { getResult, getResult2 };
