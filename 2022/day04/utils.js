const pairContains = ([low1, high1], [low2, high2]) => {
  if (low2 >= low1 && high2 <= high1) {
    return true;
  }
  return false;
};

const pairOverlaps = ([low1, high1], [low2, high2]) => {
  if ((low2 <= high1 && high2 >= high1) || (high2 >= low1 && low2 <= low1)) {
    return true;
  }

  return false;
};

const getPairs = (data) => {
  return data.split('\n').map((line) => {
    const [first, second] = line.split(',');
    const [low1, high1] = first.split('-').map(Number);
    const [low2, high2] = second.split('-').map(Number);
    const hasContained = pairContains([low1, high1], [low2, high2]) || pairContains([low2, high2], [low1, high1]);
    const hasOverlap = pairOverlaps([low1, high1], [low2, high2]) || pairOverlaps([low2, high2], [low1, high1]);
    // console.log(line, hasContained, hasOverlap);

    return {
      first: { low: low1, high: high1 },
      second: { low: low2, high: high2 },
      hasContained,
      hasOverlap
    };
  });
};

const getContainedPairs = (data) => {
  return getPairs(data).reduce((acc, pair) => acc + (pair.hasContained ? 1 : 0), 0);
};

const getOverlappingPairs = (data) => {
  return getPairs(data).reduce((acc, pair) => acc + (pair.hasOverlap ? 1 : 0), 0);
};

module.exports = { getContainedPairs, getOverlappingPairs };
