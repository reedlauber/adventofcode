let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const getFileData = (data) => {
  return data.split('\n').map((line, i) => {
    const id = `${i}-${line}`;
    return { id, num: Number(line) };
  });
};

const findDupes = (fileNums) => {
  const found = {};
  fileNums.forEach((n) => {
    found[n.id] = found[n.id] || 0;
    found[n.id]++;
  });
  const dupes = Object.keys(found).filter((key) => found[key] > 1);
  console.log('dupes', dupes);
};

const getMovedNumbers = (fileNums) => {
  const updated = [...fileNums];
  const len = fileNums.length;

  log(`Initial arrangement:`);
  log(updated.map((d) => d.num).join(', '));

  fileNums.forEach(({ id, num }, i) => {
    // If 0, no movement needed
    if (num !== 0) {
      // Get current position of num from original list
      const pos = updated.findIndex((u) => u.id === id);

      // Get next position by adding current value
      let nextPos = pos + num;

      // If it goes beyond the "left" side
      if (nextPos < 0) {
        // [0, 1, -2, 3] => [0, 1, 3, -1] (4 + 0 - 1) = 3
        // [0, 1, -4, 3] => [0, -4, 1, 3] (4 + -2 - 1) = 1
        nextPos = len + nextPos - 1;
      } else if (nextPos >= len) {
        // [0, 1, 5, 4] => [2, 0, 1, 4] (7 - 4 + 0) = 3

        nextPos = nextPos - len + 1;
      }

      // [0, (1), 2, 3, 4] => [0, 2, 3, 4] => [0, 2, 1, 3, 4] :: (1 + 1) = 2
      let pre = (updated[nextPos] || { num: '??' }).num;
      let post = (updated[nextPos+1] || { num: '??' }).num;

      updated.splice(pos, 1);
      updated.splice(nextPos, 0, { id, num });

      log(`\n${num} moves between ${pre} and ${post}:`);
    } else {
      log(`\n0 does not move:`)
    }

    log(updated.map((d) => d.num).join(', '));
  });

  return updated;
};

const getDecryptedSum = (moved) => {
  const len = moved.length;
  const lookups = [1000, 2000, 3000];
  const zeroIndex = moved.findIndex((m) => m.num === 0);

  log('\nmoved', moved.map((d) => d.num).join(', '))
  console.log('zeroIndex', zeroIndex)

  let first = 0;
  let second  = 0;
  let third = 0;
  let idx = zeroIndex;
  for (let i = 1; i <= 3000; i++) {
    idx++;
    if (idx > len - 1) {
      idx = 0;
    }
    if (i === 1000) {
      console.log('1000', idx, moved[idx].num);
      first = moved[idx].num;
    }
    if (i === 2000) {
      console.log('2000', idx, moved[idx].num);
      second = moved[idx].num;
    }
    if (i === 3000) {
      console.log('3000', idx, moved[idx].num);
      third = moved[idx].num;
    }
  }
  console.log(first, second, third);
  return first + second + third;

  // return lookups.reduce((acc, l) => {
  //   const val = moved[(l + zeroIndex)].num;
  //   return acc + val;
  // }, 0);
};

const getResult = (data) => {
  // isLogging = true;
  const fileData = getFileData(data);
  const moved = getMovedNumbers(fileData);
  // findDupes(moved);
  return getDecryptedSum(moved);
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
