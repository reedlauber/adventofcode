const isTreeVisible = (trees, [x, y]) => {
  const row = trees[y];
  const tree = row[x];

  // up
  let upHidden = false;
  for (let i = y-1; i >= 0; i--) {
    if (trees[i][x] >= tree) {
      upHidden = true;
      break;
    }
  }
  // right
  let rightHidden = false;
  for (let i = x+1; i < row.length; i++) {
    if (trees[y][i] >= tree) {
      rightHidden = true;
      break;
    }
  }
  // down
  let downHidden = false;
  for (let i = y+1; i < trees.length; i++) {
    if (trees[i][x] >= tree) {
      downHidden = true;
      break;
    }
  }
  // left
  let leftHidden = false;
  for (let i = x-1; i >= 0; i--) {
    if (trees[y][i] >= tree) {
      leftHidden = true;
      break;
    }
  }

  return !upHidden || !rightHidden || !downHidden || !leftHidden;
};

const getVisibleCount = (trees) => {
  let count = 0;

  for (let y = 1; y < trees.length - 1; y++) {
    const row = trees[y];
    for (let x = 1; x < row.length - 1; x++) {
      count += isTreeVisible(trees, [x, y]) ? 1 : 0;
    }
  }

  return count;
};

const getTrees = (data) => {
  return data.split('\n').map((line) => line.split('').map(Number));
};

const getTreeScore = (trees, [x, y]) => {
  const row = trees[y];
  const tree = row[x];

  if (x === 0 || y === 0 || x >= row.length - 1 || y >= trees.length - 1) {
    return 0;
  }

  // up
  let upScore = 0;
  for (let i = y - 1; i >= 0; i--) {
    upScore++;
    if (trees[i][x] >= tree) {
      break;
    }
  }
  // right
  let rightScore = 0;
  for (let i = x + 1; i < row.length; i++) {
    rightScore++;
    if (row[i] >= tree) {
      break;
    }
  }
  // down
  let downScore = 0;
  for (let i = y + 1; i < row.length; i++) {
    downScore++;
    if (trees[i][x] >= tree) {
      break;
    }
  }
  // left
  let leftScore = 0;
  for (let i = x - 1; i >= 0; i--) {
    leftScore++;
    if (row[i] >= tree) {
      break;
    }
  }
  // console.log([upScore, rightScore, downScore, leftScore]);

  return upScore * rightScore * downScore * leftScore;
};

const getTreeScores = (trees) => {
  return trees.map((row, y) => {
    return row.map((t, x) => getTreeScore(trees, [x, y]));
  });
};

const getHighestScore = (trees) => {
  const withScores = getTreeScores(trees);
  return withScores.reduce((acc, row) => {
    const max = row.reduce((rAcc, t) => Math.max(rAcc, t), 0);
    return Math.max(acc, max);
  }, 0);
};

const getResult = (data) => {
  const trees = getTrees(data);
  const outsideCount = (trees.length - 1) * 4;
  const internalCount = getVisibleCount(trees);

  return outsideCount + internalCount;
};

const getResult2 = (data) => {
  const trees = getTrees(data);
  // console.log(getTreeScores(trees));
  // console.log(getTreeScore(trees, [3, 3]));
  return getHighestScore(trees);
};

module.exports = { getResult, getResult2 };
