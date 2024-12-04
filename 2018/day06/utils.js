const getCoordinates = (data) =>
  data.split('\n').map((line) => line.split(', ').map(Number));

const getGrid = (coords) => {
  const grid = [];

  const [maxX, maxY] = coords.reduce((acc, [x, y]) => {
    return [Math.max(acc[0], x), Math.max(acc[1], y)];
  }, [0, 0]);

  for (let y = 0; y <= maxY + 1; y++) {
    const row = [];
    for (let x = 0; x <= maxX + 1; x++) {
      row.push('.');
    }
    grid.push(row);
  }

  return grid;
};

const getGridWithCoords = (coords) => {
  const grid = getGrid(coords);

  // const LETTERS = [
  //   'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  //   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // ];

  coords.forEach(([x, y], i) => {
    grid[y][x] = `#${i}`;
  });

  return grid;
};

const getDistance = ([aX, aY], [bX, bY]) => {
  return Math.abs(aX - bX) + Math.abs(aY - bY);
};

const getClosest = ([x, y], coords) => {
  return coords.reduce((acc, coord) => {
    const distance = getDistance([x, y], coord);

    if (distance === acc[0]) {
      return [distance, [...acc[1], coord]];
    } else if (distance < acc[0]) {
      return [distance, [coord]];
    }

    return acc;
  }, [Number.MAX_VALUE, []])[1];
};

const getGridWithClosests = (coords) => {
  const grid = getGridWithCoords(coords);

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === '.') {
        const [first, second] = getClosest([x, y], coords);

        if (!second) {
          grid[y][x] = grid[first[1]][first[0]];
        }
      }
    });
  });

  return grid;
};

const coordOnEdges = (num, grid) => {
  const isOnTop = !!grid[0].filter((x) => x === num).length;
  const isOnRight = !!grid.filter((row) => row[row.length-1] === num).length;
  const isOnButtom = !!grid[grid.length-1].filter((x) => x === num).length;
  const isOnLeft = !!grid.filter((row) => row[0] === num).length;
  return isOnTop || isOnRight || isOnButtom || isOnLeft;
};

const getFiniteCoords = (grid, coords) => {
  const finites = [];

  coords.forEach(([x, y], i) => {
    if (!coordOnEdges(i, grid)) {
      finites.push([x, y]);
    }
  });

  return finites;
};

const getArea = (num, grid) => {
  return grid.reduce((acc, row) => {
    return acc + row.reduce((acc, c) => acc + (c === num ? 1 : 0), 0);
  }, 0);
};

const getLargestFinite = (finites, grid) => {
  return finites.reduce((acc, finite) => {
    const num = grid[finite[1]][finite[0]];
    const area = getArea(num, grid);
    // console.log('finite, area', finite, num, area);
    if (area > acc) {
      return area;
    }
    return acc;
  }, 0);
};

const printGrid = (grid) => {
  const output = grid.map((row) => row.join('')).join('\n');
  console.log(output);
};

const getGridWithDistances = (coords) => {
  const grid = getGridWithCoords(coords);

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      // if (cell === '.') {
        let totalDistance = 0;
        coords.forEach((coord) => {
          const distance = getDistance([x, y], coord);
          totalDistance += distance;
        });
        grid[y][x] = totalDistance;
      // }
    });
  });

  return grid;
};

const getCellsBelowLimit = (grid, limit) => {
  const cells = [];

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (typeof cell === 'number' && cell < limit) {
        cells.push([x, y]);
      }
    });
  });

  return cells;
};

const getResult = (data) => {
  const coords = getCoordinates(data);
  const grid = getGridWithClosests(coords);
  // printGrid(grid);
  const finites = getFiniteCoords(grid, coords);
  // console.log('finites', finites);
  return getLargestFinite(finites, grid);
};

const getResult2 = (data) => {
  const coords = getCoordinates(data);
  const grid = getGridWithDistances(coords);
  return getCellsBelowLimit(grid, 10000).length;
};

module.exports = { getResult, getResult2 };
