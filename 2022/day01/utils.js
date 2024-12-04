const getElves = (lines) => {
  const elves = [{ sum: 0 }];
  lines.forEach((line) => {
    if (!line) {
      elves.push({ sum: 0 });
    } else {
      const lineNum = Number(line);
      elves[elves.length-1].sum += lineNum;
    }
  });
  return elves;
};

const getSortedElves = (lines) => {
  const elves = getElves(lines);
  elves.sort((a, b) => {
    if (a.sum > b.sum) return -1;
    if (a.sum < b.sum) return 1;
    return 0;
  });
  return elves;
};

const getMostCalories = (lines) => {
  const elves = getElves(lines);

  const max = elves.reduce((acc, elf) => {
    if (elf.sum > acc) {
      return elf.sum;
    }
    return acc;
  }, 0);

  return max;
};

const getLines = (data) => {
  return data.split('\n');
};

module.exports = { getLines, getMostCalories, getSortedElves };
