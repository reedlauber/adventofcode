const SCORES = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13,
  n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20, u: 21, v: 22, w: 23, x: 24, y: 25, z: 26,
};
const LETTERS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
]

const getShared = (first, second) => {
  const shared = first.split('').find((c) => second.includes(c));
  return shared;
};

const getSacks = (data) => {
  return data.split('\n').map((line) => {
    const center = line.length / 2;
    const first = line.substring(0, center);
    const second = line.substring(center);
    const shared = getShared(first, second);
    const score = SCORES[shared] || (SCORES[shared.toLowerCase()] + 26);
    return { items: line, first, second, shared, score  };
  });
};

const getSacksScore = (data) => {
  const sacks = getSacks(data);
  return sacks.reduce((acc, sack) => acc + sack.score, 0);
};

const getGroupedSacks = (data) => {
  const sacks = getSacks(data);
  const groups = [];
  sacks.forEach((sack, i) => {
    if (i % 3 === 0) {
      groups.push([]);
    }
    groups[groups.length-1].push(sack);
  });
  return groups;
};

const getSharedItem = (first, second, third) => {
  const letters = {};

  LETTERS.forEach((letter) => {
    letters[letter] = 0;
    letters[letter] += first.items.includes(letter) ? 1 : 0;
    letters[letter] += second.items.includes(letter) ? 1 : 0;
    letters[letter] += third.items.includes(letter) ? 1 : 0;
  });
  LETTERS.forEach((letter) => {
    const letterCap = letter.toUpperCase();
    letters[letterCap] = 0;
    letters[letterCap] += first.items.includes(letterCap) ? 1 : 0;
    letters[letterCap] += second.items.includes(letterCap) ? 1 : 0;
    letters[letterCap] += third.items.includes(letterCap) ? 1 : 0;
  });

  const shared = Object.keys(letters).find((key) => letters[key] >= 3);

  return shared;
};

const getGroupsValues = (data) => {
  const groups = getGroupedSacks(data);

  return groups.map(([one, two, three]) => {
    const shared = getSharedItem(one, two, three);
    const score = SCORES[shared] || (SCORES[shared.toLowerCase()] + 26);
    return score;
  }).reduce((acc, score) => acc + score, 0);
};

module.exports = { getGroupedSacks, getGroupsValues, getSacksScore };
