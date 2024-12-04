const findPairToRemove = (input) => {
  let removeIdx = -1;

  for (let i = 1; i < input.length; i++) {
    const prev = input[i-1];
    const curr = input[i];

    if (prev !== curr && prev.toLowerCase() === curr.toLowerCase()) {
      removeIdx = i - 1;
      break;
    }
  }

  return removeIdx;
};

const getCollapsedPolymer = (polymer) => {
  let searching = true;
  while(searching) {
    const removeIdx = findPairToRemove(polymer);

    if (removeIdx < 0) {
      searching = false;
    } else {
      const pre = polymer;
      polymer = polymer.substring(0, removeIdx) + polymer.substring(removeIdx + 2);
      // console.log('removeIdx', removeIdx, '\n' + pre, '\n' + polymer);
    }
  }
  return polymer
};

const LETTERS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

const getCollapsedForType = (type, polymer) => {
  const re = new RegExp(type, 'ig');
  let removed = polymer.replace(re, '');
  return getCollapsedPolymer(removed);
};

const getTypeLengths = (original) => {
  return LETTERS.map((type) => {
    let polymer = original;
    const collapsed = getCollapsedForType(type, polymer);
    return { type, collapsed };
  });
};

const getResult = (data) => {
  const polymer = getCollapsedPolymer(data);
  return polymer.length;
};

const getShortestResult = (data) => {
  const types = getTypeLengths(data);
  const shortest = types.reduce((acc, type) => {
    if (type.collapsed.length < acc[0]) {
      return [type.collapsed.length, type];
    }
    return acc;
  }, [Number.MAX_VALUE, null]);
  // console.log(types, shortest);
  return shortest[0];
};

module.exports = { getResult, getShortestResult };
