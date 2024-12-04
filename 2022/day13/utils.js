const log = (m, depth = 0) => {
  // console.log(`${''.padStart(depth * 2, ' ')}${m}`);
};

const isPairOrdered = ([left, right], num, depth = 0) => {
  if (num !== null) {
    log(`\n== Pair ${num+1} ==`);
    log(`- Compare ${JSON.stringify(left)} vs ${JSON.stringify(right)}`, depth);
  }

  const max = Math.max(left.length, right.length);

  for (let l = 0; l < max; l++) {
    const leftVal = left[l];
    const rightVal = right[l];

    if (typeof leftVal === 'undefined') {
      log(`- Left side ran out of items, so inputs are in the ${'right order'.white}`, depth + 1);
      return true;
    }
    if (typeof rightVal === 'undefined') {
      log(`- Right side ran out of items, so inputs are ${'not'.white} in the right order`, depth + 1);
      return false;
    }

    const leftIsInt = typeof leftVal === 'number';
    const rightIsInt = typeof rightVal === 'number';

    if (leftIsInt && rightIsInt) {
      log(`- Compare ${leftVal} vs ${rightVal}`, depth + 1);
      if (leftVal < rightVal) {
        log(`- Left side is smaller, so inputs are in the ${'right order'.white}`, depth + 1);
        return true;
      } else if (leftVal > rightVal) {
        log(`- Right side is smaller, so inputs are ${'not'.white} in the right order`, depth + 1);
        return false;
      }
    } else if (!leftIsInt && !rightIsInt) {
      // log(`- Compare ${JSON.stringify(left)} vs ${JSON.stringify(right)}`, depth);
      log(`- Compare ${JSON.stringify(leftVal)} vs ${JSON.stringify(rightVal)}`, depth + 1);
      const res = isPairOrdered([leftVal, rightVal], null, depth + 1);
      if (res !== null) {
        return res;
      }
    } else if (leftIsInt !== rightIsInt) {
      log(`- Compare ${JSON.stringify(leftVal)} vs ${JSON.stringify(rightVal)}`, depth);
      leftIsInt && log(`- Mixed types; convert left to [${leftVal}] and retry comparison`, depth + 1);
      rightIsInt && log(`- Mixed types; convert right to [${rightVal}] and retry comparison`, depth + 1);
      const leftArr = leftIsInt ? [leftVal] : leftVal;
      const rightArr = rightIsInt ? [rightVal] : rightVal;
      const res = isPairOrdered([leftArr, rightArr], null, depth + 1);
      if (res !== null) {
        return res;
      }
    }
  }

  return null;
};

const getPacketPairs = (data) => {
  return data.split('\n\n').map(pair => pair.split('\n').map(JSON.parse));
};

const getPackets = (data) => {
  return [...data.replace(/\n\n/g, '\n').split('\n').map(JSON.parse), [[2]], [[6]]];
};

const getResult = (data) => {
  const packetPairs = getPacketPairs(data);
  
  const ordered = packetPairs.map((pair, i) => {
    const isOrdered = isPairOrdered(pair, i);
    // console.log(`== Pair ${i + 1} == (${isOrdered})`);
    return [isOrdered, i + 1];
  }).filter(([ordered]) => ordered);
  // console.log('ordered', ordered);
  
  const indexes = ordered.map(([t, i]) => i);
  // console.log('indexes', indexes);
  
  const sum = indexes.reduce((acc, val) => acc + val, 0);
  // console.log(packetPairs);
  return sum;
};

const getResult2 = (data) => {
  const packets = getPackets(data);
  packets.sort((a, b) => {
    const isOrdered = isPairOrdered([a, b], 0, 0);
    if (isOrdered) return -1;
    if (!isOrdered) return 1;
    return 0;
  });
  const first = packets.findIndex((p) => JSON.stringify(p) === '[[2]]') + 1;
  const second = packets.findIndex((p) => JSON.stringify(p) === '[[6]]') + 1;
  // console.log(packets, first, second);

  return first * second;
};

module.exports = { getResult, getResult2 };
