const REVERSED_OPS = {
  '+': '-',
  '-': '+',
  '*': '/',
  '/': '*',
};

const getMonkeys = (data, updatedLogic = false) => {
  const graph = {};
  const monkeys = data.split('\n').map((line) => {
    const [id, opRaw] = line.split(': ');
    const parts = opRaw.split(' ');
    let type = 'number';
    let num = null;
    let op = null;

    if (parts.length === 3) {
      type = 'op';
      const opType = updatedLogic && id === 'root' ? '=' : parts[1];
      op = { first: parts[0], type: opType, second: parts[2] };
    } else {
      num = Number(parts[0]);
    }

    const monkey = { id, type, num, op };
    graph[id] = monkey;
    return monkey;
  });
  return [monkeys, graph];
};

const getComputedNum = (firstNum, secondNum, op) => {
  switch(op) {
    case '+':
      return firstNum + secondNum;
    case '-':
      return firstNum - secondNum;
    case '*':
      return firstNum * secondNum;
    case '/':
      return firstNum / secondNum;
    case '=':
      return firstNum === secondNum ? firstNum : null;
  }
  return null;
};

const getRootNumberForId = (graph, id = 'root') => {
  let humnNum = 0;

  while(true) {
    const uncomputed = Object.values(graph).filter((m) => m.num === null && m.id !== 'root' && m.id !== id);

    if (uncomputed.length === 0) {
      // console.log(Object.values(graph).map((m) => `${m.id}: ${m.num}`).join('\n'));
      break;
    }

    uncomputed.forEach((monkey) => {
      const { first: firstId, second: secondId, type } = monkey.op;
      const firstNum = graph[firstId].num;
      const secondNum = graph[secondId].num;

      if (firstNum !== null && secondNum !== null) {
        graph[monkey.id].num = getComputedNum(firstNum, secondNum, type);
        // if (monkey.id === 'ptdq') {
        //   console.log(`ptdq = ${graph[monkey.id].num}`);
        // }
      }
    });
  }

  graph[id].num = getComputedNum(graph[graph[id].op.first].num, graph[graph[id].op.second].num, graph[id].op.type);

  return graph[id].num;
};

const getHumnForRef = (graph, id) => {
  const monkey = graph[id];

  if (id === 'humn') {
    return 1;
  } else if (monkey.type !== 'op') {
    return -1;
  } else {
    const { first, second } = monkey.op;
    const firstResult = getHumnForRef(graph, first);
    const secondResult = getHumnForRef(graph, second);
    if (firstResult === 1 || secondResult === 1) {
      return 1;
    }
  }
  return 0;
};

const getNonHumnRootRef = (graph) => {
  const { first, second } = graph['root'].op;
  let ref = null;
  [first, second].forEach((id) => {
    if (getHumnForRef(graph, id)) {
      ref = id;
    }
  });
  return ref === first ? second : first;
};

const getHumnForResult = (graph, id, result) => {
  const monkey = graph[id];
  const first = graph[monkey.op.first];
  const second = graph[monkey.op.second];

  if (first.type === 'op') {
    const op = REVERSED_OPS[first.op.type];
    return getComputedNum(second.num, getHumnForResult(graph, first.id, result), op);
  } else {
    const op = REVERSED_OPS[second.op.type];
    return getComputedNum(first.num, getHumnForResult(graph, second.id, result), op);
  }
};

const getHumanNumber = (graph) => {
  let humnNum = 0;
  let rootNum = null;

  while(true) {
    const copy = { ...graph };
    Object.keys(copy).forEach((key) => {
      if (copy[key].type === 'op') {
        copy[key].num = null;
      }
    });
    copy['humn'].num = ++humnNum;
    // console.log(`\nTry humn num`, copy['humn'].num);
    rootNum = getRootNumber(copy);

    // if (humnNum > 5) {
    //   break;
    // }

    if (rootNum !== null) {
      break;
    }
  }

  return rootNum;
};

const getResult = (data) => {
  const [monkeys, graph] = getMonkeys(data);
  return getRootNumberForId(graph);
};

const getResult2 = (data) => {
  const [monkeys, graph] = getMonkeys(data, true);
  const humnRef = getNonHumnRootRef(graph);
  console.log(`Non-humn path follows ${humnRef}`);
  return getRootNumberForId(graph, humnRef);
};

module.exports = { getResult, getResult2 };
