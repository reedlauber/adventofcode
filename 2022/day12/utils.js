const HEIGHTS = {
  S: 1,
  E: 26,
  a: 01, b: 02, c: 03, d: 04, e: 05, f: 06, g: 07, h: 08, i: 09, j: 10, k: 11, l: 12, m: 13,
  n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26
};

const MOVES = [
  { dir: '^', change: [0, -1] }, // Up
  { dir: '>', change: [1, 0] }, // Right
  { dir: 'v', change: [0, 1] }, // Down
  { dir: '<', change: [-1, 0] }, // Left
];

const canReach = (from, to) => {
  return to.height - from.height <= 1
};

const getGrid = (data, isAllowed = canReach) => {
  const lines = data.split('\n');
  const height = lines.length;
  const width = lines[0].length;
  const graph = {};
  const grid = lines.map((line, y) => {
    return line.split('').map((char, x) => {
      const node = { id: `${x},${y}`, height: HEIGHTS[char], letter: char, x, y, edges: [], cost: Infinity, via: '' };
      graph[node.id] = node;
      return node;
    });
  });

  Object.keys(graph).forEach((key) => {
    const node = graph[key];
    const { x, y } = node;
    const edges = [];
    if (y > 0 && isAllowed(node, grid[y-1][x])) { // up
      edges.push(`${x},${y-1}`);
    }
    if (x < width - 1 && isAllowed(node, grid[y][x+1])) { // right
      edges.push(`${x+1},${y}`);
    }
    if (y < height - 1 && isAllowed(node, grid[y+1][x])) { // down
      edges.push(`${x},${y+1}`);
    }
    if (x > 0 && isAllowed(node, grid[y][x-1])) { // left
      edges.push(`${x-1},${y}`);
    }
    grid[y][x].edges = edges;
    node.edges = edges;
  });

  return [grid, graph];
};

const getSpecialCoords = (grid) => {
  let start = null;
  let end = null;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x].letter === 'S') {
        start = grid[y][x];
      } else if (grid[y][x].letter === 'E') {
        end = grid[y][x];
      }
    }
  }
  return [start, end];
};

const getShortestPath = (graph, start, end) => {
  graph[start.id].cost = 0;
  const unvisited = Object.keys(graph);
  let destination = '';

  while (unvisited.length) {
    unvisited.sort((a, b) => graph[b].cost - graph[a].cost);
    const current = unvisited.pop();

    if (graph[current].cost === Infinity) {
      throw new Error(`Path not found, unvisited: ${unvisited.length}`)
    }

    const nextCost = graph[current].cost + 1;

    for (let edge of graph[current].edges) {
      if (nextCost < graph[edge].cost) {
        graph[edge].cost = nextCost;
        graph[edge].via = current;
      }
    }

    // check if destination node is visited
    if (current === `${end.x},${end.y}`) {
      destination = current;
      break;
    }
  }

  const result = [];

  while (destination && graph[destination].cost > 0) {
    const { x, y, via } = graph[destination];
    // const [x, y] = destination.split(',').map(Number);
    result.unshift({ x, y });
    destination = via;
  }

  return result;
};

const getShortestPath2 = (graph, end) => {
  const unvisited = Object.keys(graph);
  let minCost = Infinity;
  let minCostKey = '';

  graph[`${end.x},${end.y}`].cost = 0;

  while (unvisited.length) {
    unvisited.sort((a, b) => graph[b].cost - graph[a].cost);
    const current = unvisited.pop();

    // exit loop if no shorter trails possible
    if (graph[current].cost >= minCost) break;

    if (graph[current].cost === Infinity) {
      throw new Error(`Path not found, unvisited: ${unvisited.length}`);
    }

    const nextCost = graph[current].cost + 1;
    
    for (let edge of graph[current].edges) {
      if (nextCost < graph[edge].cost) {
        graph[edge].cost = nextCost;
        graph[edge].via = current;
      }
    }

    // check if we on the lowest height
    if (graph[current].letter === 'a') {
      minCost = Math.min(minCost, graph[current].cost);
      minCostKey = current;
    }
  }

  let destination = minCostKey;

  const result = []
  while (graph[destination].cost > 0) {
    const [x, y] = destination.split(',').map(Number);
    result.unshift({ x, y });
    destination = graph[destination].via;
  }
  return result;
}

const getResult = (data) => {
  const [grid, graph] = getGrid(data);
  const [start, end] = getSpecialCoords(grid);
  const path = getShortestPath(graph, start, end);
  console.log(path)
  return path.length;
};

const getResult2 = (data) => {
  const [grid, graph] = getGrid(data, (from, to) => canReach(to, from));
  const [, end] = getSpecialCoords(grid);
  const path = getShortestPath2(graph, end);
  console.log(path)
  return path.length;
};

module.exports = { getResult, getResult2 };
