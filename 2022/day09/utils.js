const printVisited = (visited, knots) => {
  // let minX = Number.MAX_VALUE;
  // let maxX = 0;
  // let minY = Number.MAX_VALUE;
  // let maxY = 0;
  // Object.values(visited).forEach(([x, y]) => {
  //   minX = Math.min(minX, x);
  //   maxX = Math.max(maxX, x);
  //   minY = Math.min(minY, y);
  //   maxY = Math.max(maxY, y);
  // });
  let minX = -10;
  let maxX = 10;
  let minY = -10;
  let maxY = 10;

  let output = '';

  for (let y = minY; y < maxY; y++) {
    let line = '';

    for (let x = minX; x < maxX; x++) {
      let char = '.';

      if (visited[`${x},${y}`]) {
        char = '#';
      }

      if (knots.length) {
        for (let k = knots.length - 1; k > 0; k--) {
          if (x === knots[k][0] && y === knots[k][1]) {
            char = k.toString();
          }
        }
        if (x === knots[0][0] && y === knots[0][1]) {
          char = 'H';
        }
      }

      if (x === 0 && y === 0) {
        char = 's';
      }

      line += char;
    }

    output += `${line}\n`;
  }

  console.log(output);
};

const getMoves = (data) => {
  const lines = data.split('\n');
  return lines.map((line) => line.split(' '))
    .map(([dir, num]) => [dir, Number(num)]);
};

const getNextHeadPosition = (head, dir) => {
  let x = head[0];
  let y = head[1];
  switch (dir) {
    case 'U': y--; break;
    case 'R': x++; break;
    case 'D': y++; break;
    case 'L': x--; break;
  }
  return [x, y];
};

const getNextFollowerPosition = (leader, follower) => {
  let x = follower[0];
  let y = follower[1];

  const xDist = leader[0] - x;
  const yDist = leader[1] - y;

  const distance = Math.abs(xDist) + Math.abs(yDist);

  if (distance === 2) {
    if (!xDist) { // Only vert
      y += yDist > 0 ? 1 : -1;
    } else if (!yDist) { // Only hoz
      x += xDist > 0 ? 1 : -1;
    }
  } else if (distance === 3) { // Diag
    if (Math.abs(xDist) > Math.abs(yDist)) {
      x += xDist > 0 ? 1 : -1;
      y = leader[1];
    } else {
      x = leader[0];
      y += yDist > 0 ? 1 : -1;
    }
  } else if (distance > 3) { // Diag
    if (Math.abs(xDist) > Math.abs(yDist)) {
      x += xDist > 0 ? 1 : -1;
      y += yDist > 0 ? 1 : -1;
    } else {
      x += xDist > 0 ? 1 : -1;
      y += yDist > 0 ? 1 : -1;
    }
  }

  return [x, y];
};

const performMoves = (moves) => {
  const head = [0, 0];
  const tail = [0, 0];
  const visited = { '0,0': [0, 0] };

  moves.forEach(([dir, dist], i) => {
    // if (i === 0) {
    for (let d = 0; d < dist; d++) {
      // console.log(`Move ${i+1}, step ${d+1} (${dir}) 1`);
      const [headX, headY] = getNextHeadPosition(head, dir);
      // console.log(`head [${head[0]},${head[1]}] -> [${headX},${headY}]`);
      head[0] = headX
      head[1] = headY;

      const [tailX, tailY] = getNextFollowerPosition(head, tail);
      // console.log(`tail [${tail[0]},${tail[1]}] -> [${tailX},${tailY}]`);
      tail[0] = tailX;
      tail[1] = tailY;

      visited[`${tailX},${tailY}`] = [tailX, tailY];

      // printVisited(visited, head, tail);
    }
    // }
  });

  return visited;
};

const performMoves2 = (moves, knots) => {
  const visited = { '0,0': [0,0] };

  moves.filter((m, i) => i < 200000).forEach(([dir, dist], i) => {
    for (let d = 0; d < dist; d++) {
      // console.log(`\nMove ${i+1}, step ${d+1} (${dir}) 1`);
      const [headX, headY] = getNextHeadPosition(knots[0], dir);
      // console.log(`head [${knots[0][0]},${knots[0][1]}] -> [${headX},${headY}]`);
      knots[0][0] = headX;
      knots[0][1] = headY;

      for (let k = 1; k < knots.length; k++) {
        const knot = knots[k];
        const [knotX, knotY] = getNextFollowerPosition(knots[k-1], knot);
        // console.log(`knot ${k} [${knots[k][0]},${knots[k][1]}] -> [${knotX},${knotY}]`);
        knots[k][0] = knotX;
        knots[k][1] = knotY;

        if (k === 9) {
          visited[`${knotX},${knotY}`] = [knotX, knotY];
        }
        
        // printVisited(visited, knots);
      }
    }
  });

  return visited;
};

const getResult = (data) => {
  const moves = getMoves(data);
  const visited = performMoves(moves);
  printVisited(visited, [], []);
  return Object.keys(visited).length;
};

const getResult2 = (data) => {
  const knots = [
    [0, 0], // H
    [0, 0], // 1
    [0, 0], // 2
    [0, 0], // 3
    [0, 0], // 4
    [0, 0], // 5
    [0, 0], // 6
    [0, 0], // 7
    [0, 0], // 8
    [0, 0], // 9
  ];
  const moves = getMoves(data);
  const visited = performMoves2(moves, knots);
  printVisited(visited, []);
  return Object.keys(visited).length;
};

module.exports = { getResult, getResult2 };
