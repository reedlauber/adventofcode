const getCrates = (line, stacksNums) => {
  const crates = [];

  for (let s = 0; s < stacksNums.length; s++) {
    const start = s === 0 ? 0 : s * 4;
    const end = start + 3;
    // console.log('sub', `"${line}"`, start, end, `"${line.substring(start, end)}"`)
    const crateSpace = line.substring(start, end);

    if (crateSpace) {
      crates.push(crateSpace[1]);
    }
  }

  return crates;
};
const getStacks = (input) => {
  const lines = input.split('\n');
  const numsLine = lines.pop();
  const stackNums = numsLine.trim().split('   ');
  const stacks = [];

  lines.reverse().forEach((line, i) => {
    const crates = getCrates(line, stackNums);

    crates.forEach((crateSpace, i) => {
      stacks[i] = stacks[i] || [];
      if (crateSpace.trim()) {
        stacks[i].push(crateSpace);
      }
    });
  });

  return stacks;
};

const getMoves = (movesRaw) => {
  const moveRE = /move (\d+) from (\d+) to (\d+)/;
  const moves = [];
  movesRaw.split('\n').forEach((moveRaw) => {
    const matches = moveRaw.match(moveRE);
    if (matches && matches.length === 4) {
      moves.push({
        from: Number(matches[2]),
        to: Number(matches[3]),
        count: Number(matches[1])
      });
    }
  });
  return moves;
};

const performMoves = (stacks, moves) => {
  const moved = [...stacks];

  moves.forEach(({ from, to, count }) => {
    for (let c = 0; c < count; c++) {
      const crate = moved[from-1].pop();
      moved[to-1].push(crate);
    }
  });

  return moved;
};

const performMoves2 = (stacks, moves) => {
  const moved = [...stacks];

  moves.forEach(({ from, to, count }) => {
    const fromStack = stacks[from-1];
    const toMove = fromStack.splice(fromStack.length - count, count);
    moved[to-1].push(...toMove);
  });

  return moved;
};

const getResult = (data) => {
  const [cratesRaw, movesRaw] = data.split('\n\n');
  const stacks = getStacks(cratesRaw);
  const moves = getMoves(movesRaw);
  const moved = performMoves(stacks, moves);
  const lasts = moved.map((stack) => stack[stack.length-1]).join('');
  return lasts;
};

const getResult2 = (data) => {
  const [cratesRaw, movesRaw] = data.split('\n\n');
  const stacks = getStacks(cratesRaw);
  const moves = getMoves(movesRaw);
  const moved = performMoves2(stacks, moves);
  const lasts = moved.map((stack) => stack[stack.length-1]).join('');
  return lasts;
};

module.exports = { getResult, getResult2 };
